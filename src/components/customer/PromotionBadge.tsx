'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/hooks/usePromotions';

interface Promotion {
  id: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  endDate: string;
}

interface PromotionBadgeProps {
  promotion: Promotion;
  showCountdown?: boolean;
}

export function PromotionBadge({ promotion, showCountdown = true }: PromotionBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(promotion.endDate));

  useEffect(() => {
    if (!showCountdown) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(promotion.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [promotion.endDate, showCountdown]);

  const discountText = promotion.discountType === 'PERCENTAGE'
    ? `${promotion.discountValue}% OFF`
    : `$${promotion.discountValue.toFixed(2)} OFF`;

  const formatTime = () => {
    const { days, hours, minutes, seconds, total } = timeRemaining;
    
    if (total <= 0) return 'Ended';
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div className="flex flex-col">
          <span className="text-xs font-bold">{discountText}</span>
          {showCountdown && timeRemaining.total > 0 && (
            <span className="text-xs opacity-90">{formatTime()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
