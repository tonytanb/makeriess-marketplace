'use client';

import { Check, CreditCard, Plus } from 'lucide-react';
import type { SavedPaymentMethod } from '@/lib/types/checkout';

interface PaymentMethodSelectorProps {
  savedPaymentMethods: SavedPaymentMethod[];
  selectedPaymentMethod: SavedPaymentMethod | null;
  onPaymentMethodSelected: (method: SavedPaymentMethod) => void;
  onUseNewPaymentMethod: () => void;
}

export function PaymentMethodSelector({
  savedPaymentMethods,
  selectedPaymentMethod,
  onPaymentMethodSelected,
  onUseNewPaymentMethod,
}: PaymentMethodSelectorProps) {
  const getCardBrandIcon = () => {
    // In production, use actual card brand icons
    return <CreditCard className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="space-y-3">
      {/* Saved Payment Methods */}
      {savedPaymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onPaymentMethodSelected(method)}
          className={`w-full text-left p-4 border-2 rounded-lg transition ${
            selectedPaymentMethod?.id === method.id
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getCardBrandIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {method.card.brand} •••• {method.card.last4}
                </p>
                <p className="text-xs text-gray-600">
                  Expires {method.card.expMonth}/{method.card.expYear}
                </p>
                {method.isDefault && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    Default
                  </span>
                )}
              </div>
            </div>
            {selectedPaymentMethod?.id === method.id && (
              <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
          </div>
        </button>
      ))}

      {/* Add New Payment Method Button */}
      <button
        onClick={onUseNewPaymentMethod}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-blue-600 font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add New Payment Method
      </button>
    </div>
  );
}
