import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface StudentFeatures {
  studentGpa: number;
  courseDifficulty: number;
  hasDisability: number;
  credits: number;
  avgPreviousGrade: number;
}

interface CourseRecommendation {
  courseId: string;
  courseName: string;
  courseCode: string;
  department: string;
  difficulty: number;
  recommendationScore: number;
  predictedGrade: number;
  reasoning: string[];
  modelType: string;
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

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (studentError || !student) {
      throw new Error('Student profile not found');
    }

    const { data: grades } = await supabase
      .from('grades')
      .select('course_id, grade_point')
      .eq('student_id', student.id);

    const takenCourseIds = grades?.map(g => g.course_id) || [];
    const avgGrade = grades?.length ? grades.reduce((sum, g) => sum + g.grade_point, 0) / grades.length : 2.5;

    const { data: availableCourses } = await supabase
      .from('courses')
      .select('*')
      .not('id', 'in', `(${takenCourseIds.join(',') || 'null'})`);

    if (!availableCourses || availableCourses.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: 'No available courses found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recommendations: CourseRecommendation[] = [];

    for (const course of availableCourses) {
      const features: StudentFeatures = {
        studentGpa: student.current_gpa || 2.5,
        courseDifficulty: course.difficulty_level,
        hasDisability: student.has_disability ? 1 : 0,
        credits: course.credits,
        avgPreviousGrade: avgGrade,
      };

      const knnScore = calculateKNNScore(features);
      const dtScore = calculateDecisionTreeScore(features);
      const ensembleScore = (knnScore + dtScore) / 2;

      const predictedGrade = predictGradePoint(features);

      const reasoning = generateReasoning(features, course, knnScore, dtScore);

      recommendations.push({
        courseId: course.id,
        courseName: course.course_name,
        courseCode: course.course_code,
        department: course.department,
        difficulty: course.difficulty_level,
        recommendationScore: ensembleScore,
        predictedGrade: predictedGrade,
        reasoning: reasoning,
        modelType: 'Ensemble (KNN + Decision Tree)',
      });

      await supabase.from('course_recommendations').insert({
        student_id: student.id,
        course_id: course.id,
        recommendation_score: ensembleScore,
        model_type: 'Ensemble',
        reasoning: { factors: reasoning },
        predicted_grade: predictedGrade,
        risk_level: predictedGrade < 2.0 ? 'High' : predictedGrade < 3.0 ? 'Medium' : 'Low',
      });
    }

    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    const topRecommendations = recommendations.slice(0, 10);

    return new Response(
      JSON.stringify({ recommendations: topRecommendations }),
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

function calculateKNNScore(features: StudentFeatures): number {
  const gpaWeight = 0.35;
  const difficultyWeight = 0.25;
  const gradeHistoryWeight = 0.30;
  const creditsWeight = 0.10;

  const gpaScore = features.studentGpa / 4.0;
  const difficultyScore = 1 - (features.courseDifficulty - 1) / 4;
  const gradeHistoryScore = features.avgPreviousGrade / 4.0;
  const creditsScore = Math.max(0, 1 - (features.credits - 3) / 3);

  const difficultyPenalty = Math.abs(features.studentGpa - (5 - features.courseDifficulty)) / 4;
  
  let score = (
    gpaScore * gpaWeight +
    difficultyScore * difficultyWeight +
    gradeHistoryScore * gradeHistoryWeight +
    creditsScore * creditsWeight
  ) - difficultyPenalty * 0.1;

  if (features.hasDisability === 1 && features.courseDifficulty >= 4) {
    score *= 0.9;
  }

  return Math.max(0, Math.min(1, score));
}

function calculateDecisionTreeScore(features: StudentFeatures): number {
  if (features.studentGpa >= 3.5) {
    if (features.courseDifficulty <= 3) {
      return 0.95;
    } else if (features.avgPreviousGrade >= 3.0) {
      return 0.85;
    } else {
      return 0.70;
    }
  } else if (features.studentGpa >= 2.5) {
    if (features.courseDifficulty <= 2) {
      return 0.85;
    } else if (features.courseDifficulty <= 3) {
      return 0.75;
    } else if (features.avgPreviousGrade >= 2.5) {
      return 0.65;
    } else {
      return 0.50;
    }
  } else {
    if (features.courseDifficulty <= 2) {
      return 0.70;
    } else if (features.courseDifficulty <= 3 && features.avgPreviousGrade >= 2.0) {
      return 0.55;
    } else {
      return 0.40;
    }
  }
}

function predictGradePoint(features: StudentFeatures): number {
  const baseGrade = features.avgPreviousGrade;
  const difficultyAdjustment = (3 - features.courseDifficulty) * 0.2;
  const gpaInfluence = (features.studentGpa - features.avgPreviousGrade) * 0.3;
  
  let predictedGrade = baseGrade + difficultyAdjustment + gpaInfluence;

  if (features.hasDisability === 1) {
    predictedGrade -= 0.1;
  }

  return Math.max(0, Math.min(4.0, predictedGrade));
}

function generateReasoning(
  features: StudentFeatures,
  course: any,
  knnScore: number,
  dtScore: number
): string[] {
  const reasoning: string[] = [];

  if (features.studentGpa >= 3.5) {
    reasoning.push('Strong academic performance (GPA >= 3.5)');
  } else if (features.studentGpa >= 2.5) {
    reasoning.push('Good academic standing (GPA >= 2.5)');
  } else {
    reasoning.push('Consider building foundational skills');
  }

  const gpaDifficultyMatch = Math.abs(features.studentGpa - (5 - features.courseDifficulty));
  if (gpaDifficultyMatch < 1.0) {
    reasoning.push('Course difficulty well-matched to your ability');
  } else if (features.courseDifficulty > features.studentGpa) {
    reasoning.push('This course may be challenging - ensure adequate preparation');
  }

  if (features.avgPreviousGrade >= 3.0) {
    reasoning.push('Your grade history suggests success in similar courses');
  }

  if (features.hasDisability === 1 && course.accessibility_features) {
    reasoning.push('Course includes accessibility accommodations');
  }

  if (knnScore > 0.8 && dtScore > 0.8) {
    reasoning.push('High confidence recommendation from both models');
  } else if ((knnScore + dtScore) / 2 > 0.7) {
    reasoning.push('Models show good fit for this course');
  }

  return reasoning;
}