import { useEffect, useState } from 'react';
import { CheckCircle, Lock, PlayCircle, AlertCircle, Upload } from 'lucide-react';
import { supabase, Module, UserProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigate } from '../hooks/useNavigate';
import { useEntitlement } from '../hooks/useEntitlement';
import { Sidebar } from '../components/Sidebar';
import { ProgressBar } from '../components/ProgressBar';
import { PaymentRequired } from '../components/PaymentRequired';

type PhaseUnlock = {
  id: string;
  phase_number: number;
  approved: boolean | null;
  uploaded_at: string | null;
};

export function Dashboard() {
  const { user, profile } = useAuth();
  const { refreshProgress } = useProgress();
  const navigate = useNavigate();
  const { hasAccess, loading: entitlementLoading } = useEntitlement();
  const [modules, setModules] = useState<(Module & { progress?: UserProgress })[]>([]);
  const [phaseUnlocks, setPhaseUnlocks] = useState<PhaseUnlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    refreshProgress();

    const handleFocus = () => {
      loadDashboardData();
      refreshProgress();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  async function loadDashboardData() {
    if (!user) {
      console.log('No user found, skipping data load');
      return;
    }

    console.log('Loading dashboard data for user:', user.id);

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true });

    console.log('MODULES:', data, 'ERROR:', error);

    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const { data: phaseUnlocksData } = await supabase
      .from('phase_unlocks')
      .select('id, phase_number, approved, uploaded_at')
      .eq('user_id', user.id);

    console.log('PROGRESS:', progressData, 'ERROR:', progressError);
    console.log('User ID:', user.id);

    if (!data || data.length === 0) {
      console.error('No modules found. Error:', error);
      setModules([]);
      setLoading(false);
      return;
    }

    const modulesWithProgress = data.map((module) => ({
      ...module,
      progress: progressData?.find((p) => p.module_id === module.id),
    }));
    console.log('Modules with progress:', modulesWithProgress);
    setModules(modulesWithProgress);
    setPhaseUnlocks(phaseUnlocksData || []);

    setLoading(false);
  }

  function getModuleStatus(module: Module & { progress?: UserProgress }) {
    if (!module.progress) {
      return { icon: Lock, text: 'Locked', color: 'text-gray-400' };
    }
    if (module.progress.is_completed) {
      return { icon: CheckCircle, text: 'Completed', color: 'text-green-600' };
    }
    if (module.progress.is_unlocked) {
      return { icon: PlayCircle, text: 'Continue', color: 'text-blue-600' };
    }
    return { icon: Lock, text: 'Locked', color: 'text-gray-400' };
  }

  function getLockReason(module: Module & { progress?: UserProgress }): string | null {
    if (module.progress?.is_unlocked) return null;

    const phaseNumber = module.phase_number;
    const previousPhaseNumber = phaseNumber - 1;

    if (phaseNumber === 1) {
      return null;
    }

    if (phaseNumber > 4) {
      const unlock = phaseUnlocks.find((u) => u.phase_number === previousPhaseNumber);

      if (!unlock || !unlock.uploaded_at) {
        return `Complete Phase ${previousPhaseNumber} exam and upload your proof to unlock this phase.`;
      }

      if (unlock.approved === null) {
        return 'Your exam proof is under review. You will be notified once approved.';
      }

      if (unlock.approved === false) {
        return 'Your exam proof was not approved. Please upload a valid proof.';
      }
    }

    return `Complete the previous phase to unlock this phase.`;
  }

  const continueModule = modules.find(
    (m) => m.progress?.is_unlocked && !m.progress?.is_completed
  );

  function handleModuleClick(module: Module & { progress?: UserProgress }) {
    const isLocked = !module.progress?.is_unlocked;
    if (isLocked) return;

    // Check if user has paid before accessing any content
    if (!hasAccess) {
      setShowPaymentModal(true);
      return;
    }

    navigate({ type: 'module', id: module.id });
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name}
            </h1>
            <p className="text-gray-600">Continue your Medicare learning journey</p>
          </div>

          <ProgressBar />

          {continueModule && (
            <div
              onClick={() => handleModuleClick(continueModule)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90 mb-1">Continue where you left off</p>
                  <h3 className="text-xl font-semibold">{continueModule.title}</h3>
                </div>
                <PlayCircle size={32} />
              </div>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Modules</h2>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No modules available. Please contact support.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {modules.map((module) => {
              const status = getModuleStatus(module);
              const StatusIcon = status.icon;
              const isLocked = !module.progress?.is_unlocked;
              const lockReason = getLockReason(module);
              const needsUpload = module.phase_number > 4 &&
                !phaseUnlocks.find((u) => u.phase_number === module.phase_number - 1)?.uploaded_at;

              return (
                <div
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className={`bg-white rounded-lg border border-gray-200 p-6 ${
                    isLocked ? 'opacity-60' : 'cursor-pointer hover:border-blue-300 hover:shadow-md'
                  } transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                          <StatusIcon size={16} />
                          {status.text}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{module.description}</p>

                      {lockReason && (
                        <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-yellow-800">{lockReason}</p>
                            {needsUpload && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate({ type: 'phase-unlock' });
                                }}
                                className="mt-2 flex items-center gap-2 text-sm font-medium text-yellow-700 hover:text-yellow-900"
                              >
                                <Upload size={16} />
                                Upload Exam Proof
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentRequired onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
}
