'use client';

import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { checkoutService } from '@/lib/api/checkout';
import type { PromoCode } from '@/lib/types/checkout';

interface PromoCodeInputProps {
  subtotal: number;
  appliedPromoCode: PromoCode | null;
  onPromoCodeApplied: (code: PromoCode) => void;
  onPromoCodeRemoved: () => void;
}

export function PromoCodeInput({
  subtotal,
  appliedPromoCode,
  onPromoCodeApplied,
  onPromoCodeRemoved,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCode = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const validatedCode = await checkoutService.validatePromoCode(code.trim(), subtotal);
      if (validatedCode) {
        onPromoCodeApplied(validatedCode);
        setCode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCode = () => {
    onPromoCodeRemoved();
    setError(null);
  };

  if (appliedPromoCode) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                {appliedPromoCode.code}
              </p>
              <p className="text-xs text-green-700">
                {appliedPromoCode.discountType === 'PERCENTAGE'
                  ? `${appliedPromoCode.discountValue}% off`
                  : `$${appliedPromoCode.discountValue.toFixed(2)} off`}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCode}
            className="p-2 hover:bg-green-100 rounded-full transition"
            aria-label="Remove promo code"
          >
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyCode();
              }
            }}
            placeholder="Enter promo code"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            disabled={isValidating}
          />
        </div>
        <button
          onClick={handleApplyCode}
          disabled={!code.trim() || isValidating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Validating...' : 'Apply'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="text-xs text-gray-500">
        <p>Try: WELCOME10 or SAVE5</p>
      </div>
    </div>
  );
}
