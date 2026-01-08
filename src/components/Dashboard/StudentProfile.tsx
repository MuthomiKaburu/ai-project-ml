import { useState, useEffect } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function StudentProfile({ student, onUpdate }: { student: any; onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    major: '',
    academic_level: 'Freshman',
    current_gpa: 0,
    has_disability: false,
  });
  const [disabilities, setDisabilities] = useState({
    disability_type: '',
    preferred_interaction_mode: '',
    support_requirements: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        email: student.email || '',
        major: student.major || '',
        academic_level: student.academic_level || 'Freshman',
        current_gpa: student.current_gpa || 0,
        has_disability: student.has_disability || false,
      });
      loadDisabilities();
    }
  }, [student]);

  const loadDisabilities = async () => {
    if (!student) return;

    try {
      const { data } = await supabase
        .from('disabilities')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle();

      if (data) {
        setDisabilities({
          disability_type: data.disability_type || '',
          preferred_interaction_mode: data.preferred_interaction_mode || '',
          support_requirements: data.support_requirements || '',
        });
      }
    } catch (error) {
      console.error('Error loading disabilities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const { error: studentError } = await supabase
        .from('students')
        .update({
          full_name: formData.full_name,
          major: formData.major,
          academic_level: formData.academic_level,
          current_gpa: formData.current_gpa,
          has_disability: formData.has_disability,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      if (studentError) throw studentError;

      if (formData.has_disability && disabilities.disability_type) {
        const { data: existingDisability } = await supabase
          .from('disabilities')
          .select('id')
          .eq('student_id', student.id)
          .maybeSingle();

        if (existingDisability) {
          const { error: disabilityError } = await supabase
            .from('disabilities')
            .update({
              disability_type: disabilities.disability_type,
              preferred_interaction_mode: disabilities.preferred_interaction_mode,
              support_requirements: disabilities.support_requirements,
            })
            .eq('student_id', student.id);

          if (disabilityError) throw disabilityError;
        } else {
          const { error: disabilityError } = await supabase
            .from('disabilities')
            .insert({
              student_id: student.id,
              disability_type: disabilities.disability_type,
              preferred_interaction_mode: disabilities.preferred_interaction_mode,
              support_requirements: disabilities.support_requirements,
            });

          if (disabilityError) throw disabilityError;
        }
      }

      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Student Profile</h2>
            <p className="text-slate-600">Manage your academic information and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-slate-700 mb-2">
                Major
              </label>
              <input
                id="major"
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label htmlFor="academic_level" className="block text-sm font-medium text-slate-700 mb-2">
                Academic Level
              </label>
              <select
                id="academic_level"
                value={formData.academic_level}
                onChange={(e) => setFormData({ ...formData, academic_level: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div>
              <label htmlFor="current_gpa" className="block text-sm font-medium text-slate-700 mb-2">
                Current GPA (0.0 - 4.0)
              </label>
              <input
                id="current_gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.current_gpa}
                onChange={(e) => setFormData({ ...formData, current_gpa: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                id="has_disability"
                type="checkbox"
                checked={formData.has_disability}
                onChange={(e) => setFormData({ ...formData, has_disability: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="has_disability" className="text-sm font-medium text-slate-700">
                I have accessibility needs or a disability
              </label>
            </div>

            {formData.has_disability && (
              <div className="pl-8 space-y-4">
                <div>
                  <label htmlFor="disability_type" className="block text-sm font-medium text-slate-700 mb-2">
                    Disability Type
                  </label>
                  <select
                    id="disability_type"
                    value={disabilities.disability_type}
                    onChange={(e) => setDisabilities({ ...disabilities, disability_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select type</option>
                    <option value="Visual">Visual</option>
                    <option value="Hearing">Hearing</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Learning">Learning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferred_interaction_mode" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Learning Mode
                  </label>
                  <input
                    id="preferred_interaction_mode"
                    type="text"
                    value={disabilities.preferred_interaction_mode}
                    onChange={(e) => setDisabilities({ ...disabilities, preferred_interaction_mode: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="e.g., Audio materials, Extra time on exams"
                  />
                </div>

                <div>
                  <label htmlFor="support_requirements" className="block text-sm font-medium text-slate-700 mb-2">
                    Support Requirements
                  </label>
                  <textarea
                    id="support_requirements"
                    value={disabilities.support_requirements}
                    onChange={(e) => setDisabilities({ ...disabilities, support_requirements: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={3}
                    placeholder="Describe any specific support or accommodations you need"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Profile saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
