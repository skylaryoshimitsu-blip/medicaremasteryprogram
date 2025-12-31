import { useEffect, useState } from 'react';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { supabase, Module, UserProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { useEntitlement } from '../hooks/useEntitlement';
import { Sidebar } from '../components/Sidebar';
import { PaymentRequired } from '../components/PaymentRequired';

export function ModulesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasAccess } = useEntitlement();
  const [modules, setModules] = useState<(Module & { progress?: UserProgress })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadModules();
  }, [user]);

  async function loadModules() {
    if (!user) return;

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true });

    console.log('ModulesList - MODULES:', data, 'ERROR:', error);

    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    console.log('ModulesList - PROGRESS:', progressData, 'ERROR:', progressError);

    if (!data || data.length === 0) {
      console.error('ModulesList - No modules found');
      setModules([]);
      setLoading(false);
      return;
    }

    const modulesWithProgress = data.map((module) => ({
      ...module,
      progress: progressData?.find((p) => p.module_id === module.id),
    }));
    setModules(modulesWithProgress);

    setLoading(false);
  }

  function getModuleStatus(module: Module & { progress?: UserProgress }) {
    if (!module.progress) {
      return { icon: Lock, text: 'Locked', color: 'text-gray-400', bgColor: 'bg-gray-50' };
    }
    if (module.progress.is_completed) {
      return { icon: CheckCircle, text: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    if (module.progress.is_unlocked) {
      return { icon: PlayCircle, text: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
    return { icon: Lock, text: 'Locked', color: 'text-gray-400', bgColor: 'bg-gray-50' };
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Modules</h1>
            <p className="text-gray-600">Complete each phase to unlock the next</p>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No modules available. Please contact support.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {modules.map((module) => {
              const status = getModuleStatus(module);
              const StatusIcon = status.icon;
              const isLocked = !module.progress?.is_unlocked;

              return (
                <div
                  key={module.id}
                  onClick={() => {
                    if (isLocked) {
                      alert('Complete previous phases first.');
                    } else if (!hasAccess) {
                      setShowPaymentModal(true);
                    } else {
                      navigate({ type: 'module', id: module.id });
                    }
                  }}
                  className={`bg-white rounded-lg border-2 overflow-hidden ${
                    isLocked
                      ? 'border-gray-200 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow-lg'
                  } transition-all relative`}
                >
                  <div className="flex">
                    <div className={`w-2 ${isLocked ? 'bg-gray-300' : module.progress?.is_completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500 mb-1 block">
                            Phase {module.phase_number}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900">{module.title}</h3>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor}`}>
                          <StatusIcon size={18} className={status.color} />
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{module.description}</p>
                      {isLocked && (
                        <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                          <Lock size={16} />
                          <span>Complete previous phases to unlock</span>
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
