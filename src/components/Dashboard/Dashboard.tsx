import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, GraduationCap, Settings, Award, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CourseRecommendations } from './CourseRecommendations';
import { StudentProfile } from './StudentProfile';
import { CoursePerformance } from './CoursePerformance';
import { StudentGrades } from './StudentGrades';
import { StudentPreferences } from './StudentPreferences';

type View = 'recommendations' | 'profile' | 'performance' | 'grades' | 'preferences';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>('recommendations');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [user]);

  const loadStudent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Course Recommender</h1>
                <p className="text-sm text-slate-600">AI-Powered Academic Guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{student?.full_name}</p>
                <p className="text-xs text-slate-500">GPA: {student?.current_gpa?.toFixed(2) || 'N/A'}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex gap-2 mb-8 flex-wrap" role="tablist" aria-label="Dashboard sections">
          <button
            onClick={() => setView('recommendations')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              view === 'recommendations'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            role="tab"
            aria-selected={view === 'recommendations'}
          >
            <BookOpen className="w-5 h-5" />
            <span>Recommendations</span>
          </button>
          <button
            onClick={() => setView('performance')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              view === 'performance'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            role="tab"
            aria-selected={view === 'performance'}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Performance</span>
          </button>
          <button
            onClick={() => setView('grades')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              view === 'grades'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            role="tab"
            aria-selected={view === 'grades'}
          >
            <Award className="w-5 h-5" />
            <span>Grades</span>
          </button>
          <button
            onClick={() => setView('preferences')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              view === 'preferences'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            role="tab"
            aria-selected={view === 'preferences'}
          >
            <Heart className="w-5 h-5" />
            <span>Preferences</span>
          </button>
          <button
            onClick={() => setView('profile')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              view === 'profile'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            role="tab"
            aria-selected={view === 'profile'}
          >
            <Settings className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </nav>

        <div role="tabpanel">
          {view === 'recommendations' && <CourseRecommendations student={student} />}
          {view === 'performance' && <CoursePerformance student={student} />}
          {view === 'grades' && <StudentGrades student={student} />}
          {view === 'preferences' && <StudentPreferences student={student} />}
          {view === 'profile' && <StudentProfile student={student} onUpdate={loadStudent} />}
        </div>
      </div>
    </div>
  );
}
