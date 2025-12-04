'use client';

import {
  usePaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from '@/lib/hooks/useProfile';

interface PaymentMethodsSectionProps {
  userId: string;
}

export function PaymentMethodsSection({ userId }: PaymentMethodsSectionProps) {
  const { data: paymentMethods, isLoading } = usePaymentMethods(userId);
  const deletePaymentMethod = useDeletePaymentMethod(userId);
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod(userId);

  const handleDelete = async (paymentMethodId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod.mutateAsync(paymentMethodId);
      } catch (error) {
        console.error('Failed to delete payment method:', error);
      }
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(paymentMethodId);
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    }
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower === 'visa') return '💳';
    if (brandLower === 'mastercard') return '💳';
    if (brandLower === 'amex' || brandLower === 'american express') return '💳';
    if (brandLower === 'discover') return '💳';
    return '💳';
  };

  const formatBrand = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower === 'amex') return 'American Express';
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Payment methods are securely stored and encrypted. Add new payment methods during checkout.
      </p>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods && paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border-2 ${
                method.isDefault ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getCardIcon(method.brand)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatBrand(method.brand)} •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        disabled={setDefaultPaymentMethod.isPending}
                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(method.id)}
                  disabled={deletePaymentMethod.isPending}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <p className="text-sm text-gray-500 mb-2">No saved payment methods yet</p>
            <p className="text-xs text-gray-400">
              Add a payment method during your next checkout
            </p>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="text-xs font-medium text-blue-900">Secure Payment Storage</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Your payment information is encrypted and securely stored by Stripe. We never see your full card details.
          </p>
        </div>
      </div>
    </div>
  );
}
