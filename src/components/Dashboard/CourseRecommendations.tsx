import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Course {
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

export function CourseRecommendations({ student }: { student: any }) {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-course-recommendations`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [student]);

  const getRiskColor = (predictedGrade: number) => {
    if (predictedGrade >= 3.0) return 'text-green-700 bg-green-50';
    if (predictedGrade >= 2.0) return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  const getRiskIcon = (predictedGrade: number) => {
    if (predictedGrade >= 3.0) return <CheckCircle className="w-4 h-4" />;
    if (predictedGrade >= 2.0) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Analyzing courses and generating personalized recommendations...</p>
        <p className="text-sm text-slate-500 mt-2">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Recommendations</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadRecommendations}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Recommendations Available</h3>
        <p className="text-slate-600 mb-6">
          Complete your profile and add some grades to get personalized course recommendations.
        </p>
        <button
          onClick={loadRecommendations}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Refresh Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Personalized Course Recommendations</h2>
        <p className="text-blue-100">
          Based on your academic performance, interests, and learning profile, we've identified {recommendations.length} courses that match your needs.
        </p>
      </div>

      <div className="grid gap-6">
        {recommendations.map((course, index) => (
          <div
            key={course.courseId}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{course.courseName}</h3>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {course.courseCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.department}
                      </span>
                      <span title={`Difficulty: ${course.difficulty}/5`}>
                        {getDifficultyStars(course.difficulty)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(course.recommendationScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500">Match Score</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${getRiskColor(course.predictedGrade)}`}>
                  {getRiskIcon(course.predictedGrade)}
                  <div>
                    <div className="text-xs font-medium opacity-75">Predicted Grade</div>
                    <div className="font-bold">{course.predictedGrade.toFixed(2)} / 4.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-50">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-xs font-medium text-slate-600">Model</div>
                    <div className="font-bold text-slate-900 text-sm">{course.modelType}</div>
                  </div>
                </div>
              </div>

              {course.reasoning && course.reasoning.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Why this course?</h4>
                  <ul className="space-y-2">
                    {course.reasoning.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
