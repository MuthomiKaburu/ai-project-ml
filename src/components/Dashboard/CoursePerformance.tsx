import { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  difficulty_level: number;
}

interface Prediction {
  predictedGrade: number;
  predictedLetterGrade: string;
  atRisk: boolean;
  riskProbability: number;
  confidence: number;
  factors: any;
  recommendations: string[];
}

export function CoursePerformance({ student }: { student: any }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const predictPerformance = async (courseId: string) => {
    setLoading(true);
    setPrediction(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-performance`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to predict performance');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error predicting performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    predictPerformance(courseId);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Select a Course</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className={`w-full text-left p-4 rounded-lg transition ${
                  selectedCourse === course.id
                    ? 'bg-blue-50 border-2 border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                }`}
              >
                <div className="font-semibold text-slate-900">{course.course_code}</div>
                <div className="text-sm text-slate-600 line-clamp-2">{course.course_name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-white rounded text-slate-600">
                    {course.department}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white rounded text-slate-600">
                    Level {course.difficulty_level}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {!selectedCourse && !loading && !prediction && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Performance Prediction
            </h3>
            <p className="text-slate-600">
              Select a course to see your predicted performance and receive personalized recommendations.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Analyzing your performance data...</p>
          </div>
        )}

        {prediction && selectedCourse && (
          <div className="space-y-6">
            <div
              className={`rounded-2xl p-8 text-white ${
                prediction.atRisk
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {prediction.atRisk ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
                <h2 className="text-2xl font-bold">
                  {prediction.atRisk ? 'At-Risk Alert' : 'Good Standing'}
                </h2>
              </div>
              <p className="text-white/90">
                {prediction.atRisk
                  ? 'Our analysis suggests you may face challenges in this course. Review the recommendations below.'
                  : 'You appear well-prepared for this course based on your academic profile.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Predicted Grade</h3>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold text-slate-900">
                    {prediction.predictedLetterGrade}
                  </div>
                  <div className="text-xl text-slate-600 mb-1">
                    ({prediction.predictedGrade.toFixed(2)}/4.0)
                  </div>
                </div>
                <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(prediction.predictedGrade / 4.0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Prediction Confidence</h3>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold text-slate-900">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {prediction.factors && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contributing Factors</h3>

                {prediction.factors.strengths && prediction.factors.strengths.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {prediction.factors.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <span className="text-green-600 font-bold mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {prediction.factors.concerns && prediction.factors.concerns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Areas of Concern
                    </h4>
                    <ul className="space-y-2">
                      {prediction.factors.concerns.map((concern: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <span className="text-orange-600 font-bold mt-1">!</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recommendations</h3>
                <ul className="space-y-3">
                  {prediction.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
