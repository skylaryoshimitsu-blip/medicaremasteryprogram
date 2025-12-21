import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stateCode, setStateCode] = useState('');
  const [syllabusData, setSyllabusData] = useState<any[]>([]);
  const [courseOutline, setCourseOutline] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadCourseOutline();
  }, [user]);

  useEffect(() => {
    if (stateCode) loadSyllabus();
  }, [stateCode]);

  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setStateCode(data.state_code || '');
    }
  }

  async function loadSyllabus() {
    const { data } = await supabase
      .from('state_syllabus')
      .select('*')
      .eq('state_code', stateCode)
      .order('topic');

    setSyllabusData(data || []);
  }

  async function loadCourseOutline() {
    const { data } = await supabase
      .from('course_materials')
      .select('*')
      .eq('material_type', 'course_outline')
      .maybeSingle();

    if (data) setCourseOutline(data);
  }

  async function handleSaveState() {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ state_code: stateCode })
      .eq('id', user?.id);

    setSaving(false);
    alert('State saved successfully!');
  }

  async function handlePasswordReset() {
    if (!user?.email) return;

    const confirmed = confirm(
      `Send password reset email to ${user.email}?`
    );

    if (!confirmed) return;

    setResettingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/auth'
    });

    setResettingPassword(false);

    if (error) {
      alert('Error sending password reset email: ' + error.message);
    } else {
      alert('Password reset email sent! Check your inbox.');
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg text-gray-900">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Testing State</label>
                <p className="text-lg text-gray-900">{stateCode || 'Not selected'}</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handlePasswordReset}
                  disabled={resettingPassword}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {resettingPassword ? 'Sending...' : 'Reset Password →'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Update Testing State</h2>
            <div className="flex gap-4">
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              >
                <option value="">Select your testing state...</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <button
                onClick={handleSaveState}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save State'}
              </button>
            </div>
          </div>

          {stateCode && syllabusData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">{stateCode} State Syllabus</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Topic</th>
                      <th className="px-4 py-2 text-left">Weight</th>
                      <th className="px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {syllabusData.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold">{item.topic}</td>
                        <td className="px-4 py-3">{item.weight}%</td>
                        <td className="px-4 py-3 text-gray-600">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Course Outline Syllabus</h2>
            {courseOutline ? (
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={courseOutline.file_url}
                  className="w-full h-full"
                  title="Course Outline"
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Course outline will be available soon. Contact your administrator for more information.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
