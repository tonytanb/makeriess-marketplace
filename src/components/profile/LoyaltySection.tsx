'use client';

import { useState } from 'react';
import type { LoyaltyTransaction } from '@/lib/api/profile';

interface LoyaltySectionProps {
  loyaltyPoints: { balance: number; dollarValue: string } | undefined;
  loyaltyHistory: LoyaltyTransaction[] | undefined;
  isLoading: boolean;
}

export function LoyaltySection({ loyaltyPoints, loyaltyHistory, isLoading }: LoyaltySectionProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Loyalty Points</h2>

      {/* Points Balance */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90 mb-1">Available Points</p>
            <p className="text-4xl font-bold">{loyaltyPoints?.balance || 0}</p>
            <p className="text-sm opacity-90 mt-1">
              Worth ${loyaltyPoints?.dollarValue || '0.00'}
            </p>
          </div>
          <div className="text-right">
            <svg
              className="w-16 h-16 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Points Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">
          Earn 1 point for every dollar spent. Redeem 100 points for $1 off your next order.
        </p>
      </div>

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full text-left flex justify-between items-center text-emerald-600 hover:text-emerald-700 font-medium"
      >
        <span>View Points History</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${showHistory ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* History List */}
      {showHistory && (
        <div className="mt-4 space-y-3">
          {loyaltyHistory && loyaltyHistory.length > 0 ? (
            loyaltyHistory.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="flex justify-between items-start py-3 border-b border-gray-200 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === 'EARNED'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'EARNED' ? '+' : ''}
                    {transaction.points}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No points history yet. Start shopping to earn points!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
