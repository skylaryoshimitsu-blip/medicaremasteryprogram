import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { useEntitlement } from '../hooks/useEntitlement';

export function Success() {
  const navigate = useNavigate();
  const { refresh, hasAccess } = useEntitlement();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Poll for entitlement update (webhook may take a moment)
    let attempts = 0;
    const maxAttempts = 10;

    const checkEntitlement = async () => {
      await refresh();
      attempts++;

      if (hasAccess || attempts >= maxAttempts) {
        setChecking(false);
      }
    };

    const interval = setInterval(checkEntitlement, 2000);
    checkEntitlement();

    return () => clearInterval(interval);
  }, [hasAccess]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-lg text-center">
        {checking ? (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for enrolling in the Medicare Mastery Program. You now have full access to all course content.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
