import { useState, useEffect } from 'react';
import { Save, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Preferences {
  career_interests: string[];
  preferred_learning_styles: string[];
  course_time_preferences: string[];
  preferred_course_formats: string[];
  interests: string[];
  goals: string;
}

const careerOptions = [
  'Software Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Web Development',
  'Mobile Development',
  'Cybersecurity',
  'Cloud Computing',
  'Game Development',
  'Business Analysis',
  'Academia',
  'Research',
  'Entrepreneurship',
];

const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];
const timePreferences = ['Morning', 'Afternoon', 'Evening'];
const courseFormats = ['In-person', 'Online', 'Hybrid'];

const interestOptions = [
  'Programming',
  'Algorithms',
  'Database Design',
  'Web Technologies',
  'Mobile Apps',
  'Machine Learning',
  'Cloud Infrastructure',
  'DevOps',
  'UI/UX Design',
  'Product Management',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Psychology',
  'Philosophy',
  'History',
  'Art',
  'Music',
];

export function StudentPreferences({ student }: { student: any }) {
  const [preferences, setPreferences] = useState<Preferences>({
    career_interests: [],
    preferred_learning_styles: [],
    course_time_preferences: [],
    preferred_course_formats: [],
    interests: [],
    goals: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [student]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      if (student) {
        const { data } = await supabase
          .from('student_preferences')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle();

        if (data) {
          setPreferences({
            career_interests: data.career_interests || [],
            preferred_learning_styles: data.preferred_learning_styles || [],
            course_time_preferences: data.course_time_preferences || [],
            preferred_course_formats: data.preferred_course_formats || [],
            interests: data.interests || [],
            goals: data.goals || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const { data: existing } = await supabase
        .from('student_preferences')
        .select('id')
        .eq('student_id', student.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('student_preferences')
          .update({
            career_interests: preferences.career_interests,
            preferred_learning_styles: preferences.preferred_learning_styles,
            course_time_preferences: preferences.course_time_preferences,
            preferred_course_formats: preferences.preferred_course_formats,
            interests: preferences.interests,
            goals: preferences.goals,
            updated_at: new Date().toISOString(),
          })
          .eq('student_id', student.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('student_preferences').insert({
          student_id: student.id,
          career_interests: preferences.career_interests,
          preferred_learning_styles: preferences.preferred_learning_styles,
          course_time_preferences: preferences.course_time_preferences,
          preferred_course_formats: preferences.preferred_course_formats,
          interests: preferences.interests,
          goals: preferences.goals,
        });

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (category: keyof Preferences, item: string) => {
    const items = preferences[category] as string[];
    if (items.includes(item)) {
      setPreferences({
        ...preferences,
        [category]: items.filter((i) => i !== item),
      });
    } else {
      setPreferences({
        ...preferences,
        [category]: [...items, item],
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Preferences</h2>
        <p className="text-blue-100">
          Tell us about your learning goals and preferences to get better recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700 font-medium">Preferences saved successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Career Interests</h3>
          <p className="text-sm text-slate-600 mb-4">Select all that apply</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {careerOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={preferences.career_interests.includes(option)}
                  onChange={() => toggleItem('career_interests', option)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Preferred Learning Styles</h3>
          <p className="text-sm text-slate-600 mb-4">How do you learn best?</p>
          <div className="grid md:grid-cols-2 gap-3">
            {learningStyles.map((style) => (
              <label
                key={style}
                className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_learning_styles.includes(style)}
                  onChange={() => toggleItem('preferred_learning_styles', style)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{style}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Course Time Preferences</h3>
          <p className="text-sm text-slate-600 mb-4">When do you prefer to take classes?</p>
          <div className="grid md:grid-cols-3 gap-3">
            {timePreferences.map((time) => (
              <label
                key={time}
                className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={preferences.course_time_preferences.includes(time)}
                  onChange={() => toggleItem('course_time_preferences', time)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Preferred Course Formats</h3>
          <p className="text-sm text-slate-600 mb-4">What delivery method works best for you?</p>
          <div className="grid md:grid-cols-3 gap-3">
            {courseFormats.map((format) => (
              <label
                key={format}
                className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={preferences.preferred_course_formats.includes(format)}
                  onChange={() => toggleItem('preferred_course_formats', format)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{format}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Areas of Interest</h3>
          <p className="text-sm text-slate-600 mb-4">What subjects interest you?</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {interestOptions.map((interest) => (
              <label
                key={interest}
                className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={preferences.interests.includes(interest)}
                  onChange={() => toggleItem('interests', interest)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Academic & Career Goals</h3>
          <textarea
            value={preferences.goals}
            onChange={(e) => setPreferences({ ...preferences, goals: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows={4}
            placeholder="Describe your academic and career goals. What are you hoping to achieve?"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
