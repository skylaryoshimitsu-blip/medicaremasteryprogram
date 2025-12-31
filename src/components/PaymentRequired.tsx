import { useState } from 'react';
import { Lock, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useEntitlement } from '../hooks/useEntitlement';

interface PaymentRequiredProps {
  onClose?: () => void;
}

export function PaymentRequired({ onClose }: PaymentRequiredProps) {
  const { createCheckoutSession } = useEntitlement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      await createCheckoutSession();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock Full Access
          </h2>
          <p className="text-gray-600">
            Complete your enrollment to access all course content and materials.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-blue-600 font-medium mb-1">One-time payment</p>
          <p className="text-4xl font-bold text-gray-900">$97</p>
          <p className="text-sm text-gray-600 mt-1">Lifetime access</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Full access to all course phases</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Interactive quizzes and assessments</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Flashcards and study materials</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Exam simulation practice</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Certificate upon completion</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Enroll Now - $97
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Maybe Later
          </button>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
