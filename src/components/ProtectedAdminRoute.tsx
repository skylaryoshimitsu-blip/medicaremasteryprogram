import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { isAdmin } from '../lib/supabase';

type ProtectedAdminRouteProps = {
  children: ReactNode;
};

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function validateAccess() {
      if (authLoading) {
        return;
      }

      if (!profile) {
        navigate('/dashboard');
        return;
      }

      const adminStatus = await isAdmin();

      if (!adminStatus) {
        navigate('/dashboard');
        return;
      }

      setHasAccess(true);
      setIsValidating(false);
    }

    validateAccess();
  }, [profile, authLoading, navigate]);

  if (authLoading || isValidating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
