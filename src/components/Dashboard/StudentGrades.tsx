import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Grade {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  grade: string;
  grade_point: number;
  semester: string;
  year: number;
  attendance_rate: number;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

const gradeOptions = [
  { label: 'A', value: 4.0 },
  { label: 'A-', value: 3.7 },
  { label: 'B+', value: 3.3 },
  { label: 'B', value: 3.0 },
  { label: 'B-', value: 2.7 },
  { label: 'C+', value: 2.3 },
  { label: 'C', value: 2.0 },
  { label: 'C-', value: 1.7 },
  { label: 'D', value: 1.0 },
  { label: 'F', value: 0.0 },
];

export function StudentGrades({ student }: { student: any }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    course_id: '',
    grade: 'B',
    grade_point: 3.0,
    semester: 'Fall',
    year: new Date().getFullYear(),
    attendance_rate: 90,
  });

  useEffect(() => {
    loadData();
  }, [student]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: coursesData } = await supabase.from('courses').select('id, course_code, course_name').order('course_code');
      setCourses(coursesData || []);

      if (student) {
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*, courses!inner(course_code, course_name)')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        if (gradesData) {
          setGrades(
            gradesData.map((g: any) => ({
              id: g.id,
              course_id: g.course_id,
              course_name: g.courses.course_name,
              course_code: g.courses.course_code,
              grade: g.grade,
              grade_point: g.grade_point,
              semester: g.semester,
              year: g.year,
              attendance_rate: g.attendance_rate,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase.from('grades').insert({
        student_id: student.id,
        course_id: formData.course_id,
        grade: gradeOptions.find((g) => g.value === formData.grade_point)?.label || 'B',
        grade_point: formData.grade_point,
        semester: formData.semester,
        year: formData.year,
        attendance_rate: formData.attendance_rate,
      });

      if (error) {
        if (error.message.includes('Duplicate')) {
          alert('You already have a grade for this course in that semester. Please update it instead.');
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        setFormData({
          course_id: '',
          grade: 'B',
          grade_point: 3.0,
          semester: 'Fall',
          year: new Date().getFullYear(),
          attendance_rate: 90,
        });
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);

      if (error) throw error;

      setGrades(grades.filter((g) => g.id !== gradeId));
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Failed to delete grade.');
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    return (grades.reduce((sum, g) => sum + g.grade_point, 0) / grades.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading grades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Grades</h2>
        <p className="text-blue-100">
          Add your course grades to improve recommendation accuracy
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 font-medium">Grade added successfully!</p>
        </div>
      )}

      {grades.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Grade Summary</h3>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">Average GPA</div>
              <div className="text-3xl font-bold text-blue-600">{calculateAverage()}</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              Based on {grades.length} course{grades.length !== 1 ? 's' : ''} in your history
            </p>
          </div>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add a Grade</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Grade</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="course_id" className="block text-sm font-medium text-slate-700 mb-2">
                Course
              </label>
              <select
                id="course_id"
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-2">
                  Grade
                </label>
                <select
                  id="grade"
                  value={formData.grade_point}
                  onChange={(e) => {
                    const gradePoint = parseFloat(e.target.value);
                    const gradeLabel = gradeOptions.find((g) => g.value === gradePoint)?.label || 'B';
                    setFormData({ ...formData, grade_point: gradePoint, grade: gradeLabel });
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {gradeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.value.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="attendance" className="block text-sm font-medium text-slate-700 mb-2">
                  Attendance Rate (%)
                </label>
                <input
                  id="attendance"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance_rate}
                  onChange={(e) => setFormData({ ...formData, attendance_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-slate-700 mb-2">
                  Semester
                </label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-2">
                  Year
                </label>
                <input
                  id="year"
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {grades.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Grade History</h3>
          {grades.map((grade) => (
            <div key={grade.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{grade.course_code} - {grade.course_name}</h4>
                <p className="text-sm text-slate-600">
                  {grade.semester} {grade.year} • Attendance: {grade.attendance_rate}%
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{grade.grade}</div>
                  <div className="text-xs text-slate-500">{grade.grade_point.toFixed(1)}</div>
                </div>
                <button
                  onClick={() => handleDelete(grade.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete grade"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {grades.length === 0 && !showForm && (
        <div className="bg-slate-50 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No grades yet</h3>
          <p className="text-slate-600 mb-6">
            Add your course grades to get more accurate recommendations
          </p>
        </div>
      )}
    </div>
  );
}
