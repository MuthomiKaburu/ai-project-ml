import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PredictionRequest {
  courseId: string;
}

interface StudentFeatures {
  currentGpa: number;
  courseDifficulty: number;
  attendanceRate: number;
  hasDisability: number;
  credits: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { courseId }: PredictionRequest = await req.json();

    if (!courseId) {
      throw new Error('courseId is required');
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (studentError || !student) {
      throw new Error('Student profile not found');
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError || !course) {
      throw new Error('Course not found');
    }

    const { data: grades } = await supabase
      .from('grades')
      .select('attendance_rate')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const avgAttendance = grades?.length 
      ? grades.reduce((sum, g) => sum + (g.attendance_rate || 100), 0) / grades.length 
      : 95.0;

    const features: StudentFeatures = {
      currentGpa: student.current_gpa || 2.5,
      courseDifficulty: course.difficulty_level,
      attendanceRate: avgAttendance,
      hasDisability: student.has_disability ? 1 : 0,
      credits: course.credits,
    };

    const logisticPrediction = predictAtRiskLogistic(features);
    const rfPrediction = predictAtRiskRandomForest(features);
    const gradePrediction = predictGradeRandomForest(features);

    const atRisk = logisticPrediction.atRisk || rfPrediction.atRisk;
    const riskProbability = (logisticPrediction.probability + rfPrediction.probability) / 2;

    const factors = analyzeContributingFactors(features, atRisk);

    await supabase.from('performance_predictions').insert({
      student_id: student.id,
      course_id: courseId,
      predicted_grade_point: gradePrediction.predictedGrade,
      confidence: gradePrediction.confidence,
      at_risk: atRisk,
      model_type: 'Ensemble (Logistic + Random Forest)',
      factors: factors,
    });

    return new Response(
      JSON.stringify({
        predictedGrade: gradePrediction.predictedGrade,
        predictedLetterGrade: convertToLetterGrade(gradePrediction.predictedGrade),
        atRisk: atRisk,
        riskProbability: riskProbability,
        confidence: gradePrediction.confidence,
        factors: factors,
        recommendations: generateRecommendations(features, atRisk),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function predictAtRiskLogistic(features: StudentFeatures): { atRisk: boolean; probability: number } {
  const coefficients = {
    currentGpa: -1.2,
    courseDifficulty: 0.8,
    attendanceRate: -0.02,
    hasDisability: 0.4,
    credits: 0.1,
  };
  const intercept = 2.5;

  const z = 
    coefficients.currentGpa * features.currentGpa +
    coefficients.courseDifficulty * features.courseDifficulty +
    coefficients.attendanceRate * (features.attendanceRate / 100) +
    coefficients.hasDisability * features.hasDisability +
    coefficients.credits * features.credits +
    intercept;

  const probability = 1 / (1 + Math.exp(-z));
  const atRisk = probability > 0.5;

  return { atRisk, probability };
}

function predictAtRiskRandomForest(features: StudentFeatures): { atRisk: boolean; probability: number } {
  let riskScore = 0;
  let treeCount = 0;

  if (features.currentGpa < 2.5) {
    riskScore += 1;
  }
  treeCount++;

  if (features.courseDifficulty >= 4 && features.currentGpa < 3.0) {
    riskScore += 1;
  }
  treeCount++;

  if (features.attendanceRate < 80) {
    riskScore += 1;
  }
  treeCount++;

  if (features.hasDisability === 1 && features.courseDifficulty >= 4) {
    riskScore += 1;
  }
  treeCount++;

  if (features.currentGpa < 2.0 || (features.courseDifficulty >= 4 && features.currentGpa < 2.5)) {
    riskScore += 1;
  }
  treeCount++;

  const probability = riskScore / treeCount;
  const atRisk = probability > 0.5;

  return { atRisk, probability };
}

function predictGradeRandomForest(features: StudentFeatures): { predictedGrade: number; confidence: number } {
  const predictions: number[] = [];

  predictions.push(features.currentGpa - (features.courseDifficulty - 3) * 0.3);

  const attendanceFactor = (features.attendanceRate - 80) / 20;
  predictions.push(features.currentGpa + attendanceFactor * 0.4 - (features.courseDifficulty - 3) * 0.2);

  if (features.hasDisability === 1) {
    predictions.push(features.currentGpa - (features.courseDifficulty - 2.5) * 0.4);
  } else {
    predictions.push(features.currentGpa - (features.courseDifficulty - 3) * 0.25);
  }

  const creditLoadFactor = (features.credits - 3) * 0.05;
  predictions.push(features.currentGpa - (features.courseDifficulty - 3) * 0.3 - creditLoadFactor);

  if (features.currentGpa >= 3.5 && features.attendanceRate >= 90) {
    predictions.push(features.currentGpa - (features.courseDifficulty - 3) * 0.2);
  } else {
    predictions.push(features.currentGpa - (features.courseDifficulty - 3) * 0.35);
  }

  const predictedGrade = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
  const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred - predictedGrade, 2), 0) / predictions.length;
  const confidence = Math.max(0.5, Math.min(0.95, 1 - Math.sqrt(variance)));

  return {
    predictedGrade: Math.max(0, Math.min(4.0, predictedGrade)),
    confidence,
  };
}

function analyzeContributingFactors(features: StudentFeatures, atRisk: boolean): any {
  const factors: any = {
    gpa_impact: features.currentGpa < 2.5 ? 'negative' : features.currentGpa >= 3.5 ? 'positive' : 'neutral',
    difficulty_impact: features.courseDifficulty >= 4 ? 'high_challenge' : features.courseDifficulty <= 2 ? 'manageable' : 'moderate',
    attendance_impact: features.attendanceRate < 80 ? 'concerning' : features.attendanceRate >= 95 ? 'excellent' : 'good',
    disability_consideration: features.hasDisability === 1 ? 'requires_accommodation' : 'none',
  };

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (features.currentGpa >= 3.5) strengths.push('Strong academic record');
  if (features.attendanceRate >= 95) strengths.push('Excellent attendance');
  if (features.courseDifficulty <= 2) strengths.push('Appropriate course difficulty');

  if (features.currentGpa < 2.5) concerns.push('GPA below recommended threshold');
  if (features.attendanceRate < 80) concerns.push('Low attendance rate');
  if (features.courseDifficulty >= 4 && features.currentGpa < 3.0) concerns.push('Course difficulty may be challenging');
  if (features.hasDisability === 1) concerns.push('Ensure accessibility accommodations are in place');

  factors.strengths = strengths;
  factors.concerns = concerns;

  return factors;
}

function generateRecommendations(features: StudentFeatures, atRisk: boolean): string[] {
  const recommendations: string[] = [];

  if (atRisk) {
    recommendations.push('Consider meeting with an academic advisor');
    recommendations.push('Utilize tutoring services and study groups');
    
    if (features.attendanceRate < 90) {
      recommendations.push('Improve class attendance to enhance learning');
    }
    
    if (features.courseDifficulty >= 4) {
      recommendations.push('Allocate extra study time for this challenging course');
    }
    
    if (features.hasDisability === 1) {
      recommendations.push('Confirm accessibility accommodations are properly set up');
    }
  } else {
    recommendations.push('You appear well-prepared for this course');
    recommendations.push('Maintain consistent study habits and attendance');
    
    if (features.currentGpa >= 3.5) {
      recommendations.push('Consider taking on leadership roles in study groups');
    }
  }

  return recommendations;
}

function convertToLetterGrade(gradePoint: number): string {
  if (gradePoint >= 3.85) return 'A';
  if (gradePoint >= 3.50) return 'A-';
  if (gradePoint >= 3.15) return 'B+';
  if (gradePoint >= 2.85) return 'B';
  if (gradePoint >= 2.50) return 'B-';
  if (gradePoint >= 2.15) return 'C+';
  if (gradePoint >= 1.85) return 'C';
  if (gradePoint >= 1.50) return 'C-';
  if (gradePoint >= 1.00) return 'D';
  return 'F';
}