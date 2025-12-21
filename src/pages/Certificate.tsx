import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { Sidebar } from '../components/Sidebar';

export function Certificate() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [allCompleted, setAllCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCompletion();
  }, [user]);

  async function checkCompletion() {
    if (!user) return;

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const { data: modulesData } = await supabase.from('modules').select('id');

    if (progressData && modulesData) {
      const completedCount = progressData.filter((p) => p.is_completed).length;
      setAllCompleted(completedCount === modulesData.length && modulesData.length === 6);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  if (!allCompleted) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Complete all modules to earn your certificate</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border-4 border-blue-600 p-12 text-center shadow-lg">
            <Award className="mx-auto mb-6 text-blue-600" size={80} />

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Certificate of Completion
            </h1>

            <div className="my-8 py-8 border-t-2 border-b-2 border-gray-200">
              <p className="text-gray-600 mb-4">This certifies that</p>
              <p className="text-3xl font-bold text-gray-900 mb-4">{profile?.full_name}</p>
              <p className="text-gray-600 mb-4">has successfully completed the</p>
              <p className="text-2xl font-semibold text-blue-600 mb-4">
                Medicare Mastery Program
              </p>
              <p className="text-gray-600">including all six phases of training</p>
            </div>

            <div className="mt-8">
              <p className="text-gray-600">Date of Completion</p>
              <p className="text-lg font-semibold text-gray-900">{completionDate}</p>
            </div>

            <div className="mt-12 flex gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Print Certificate
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
