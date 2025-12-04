'use client';

import { useState } from 'react';
import { Gift, Minus, Plus } from 'lucide-react';
import type { LoyaltyPoints } from '@/lib/types/checkout';

interface LoyaltyPointsRedemptionProps {
  loyaltyPoints: LoyaltyPoints;
  maxRedeemable: number;
  onPointsChanged: (points: number) => void;
}

export function LoyaltyPointsRedemption({
  loyaltyPoints,
  maxRedeemable,
  onPointsChanged,
}: LoyaltyPointsRedemptionProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const handleIncrement = () => {
    const increment = 100; // Redeem in increments of 100 points ($1)
    const newPoints = Math.min(pointsToRedeem + increment, maxRedeemable);
    setPointsToRedeem(newPoints);
    onPointsChanged(newPoints);
  };

  const handleDecrement = () => {
    const decrement = 100;
    const newPoints = Math.max(0, pointsToRedeem - decrement);
    setPointsToRedeem(newPoints);
    onPointsChanged(newPoints);
  };

  const handleRedeemAll = () => {
    setPointsToRedeem(maxRedeemable);
    onPointsChanged(maxRedeemable);
  };

  const handleRedeemNone = () => {
    setPointsToRedeem(0);
    onPointsChanged(0);
  };

  const dollarValue = pointsToRedeem / 100;

  return (
    <div className="space-y-4">
      {/* Balance Display */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Available Points</p>
            <p className="text-xs text-gray-600">
              {loyaltyPoints.balance.toLocaleString()} points = ${(loyaltyPoints.balance / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Redemption Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Redeem Points</span>
          <button
            onClick={handleRedeemAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Use Maximum
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDecrement}
            disabled={pointsToRedeem === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease points"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {pointsToRedeem.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              points = ${dollarValue.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleIncrement}
            disabled={pointsToRedeem >= maxRedeemable}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase points"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {pointsToRedeem > 0 && (
          <button
            onClick={handleRedeemNone}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
          >
            Clear Redemption
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 Redeem in increments of 100 points ($1). Maximum redemption: {maxRedeemable.toLocaleString()} points (${(maxRedeemable / 100).toFixed(2)})
        </p>
      </div>
    </div>
  );
}
