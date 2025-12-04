'use client';

import { useState, useEffect } from 'react';

interface Promotion {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  productIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  notificationSent: boolean;
}

interface PromotionCardProps {
  promotion: Promotion;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onSendNotifications: (id: string) => void;
}

export function PromotionCard({ promotion, onDelete, onToggleActive, onSendNotifications }: PromotionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);

      if (now < start) {
        setStatus('upcoming');
        const diff = start.getTime() - now.getTime();
        setTimeRemaining(formatTimeRemaining(diff));
      } else if (now >= start && now <= end) {
        setStatus('active');
        const diff = end.getTime() - now.getTime();
        setTimeRemaining(formatTimeRemaining(diff));
      } else {
        setStatus('ended');
        setTimeRemaining('Ended');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [promotion.startDate, promotion.endDate]);

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (!promotion.isActive) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    if (!promotion.isActive) return 'Inactive';
    switch (status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'ended':
        return 'Ended';
    }
  };

  const discountText = promotion.discountType === 'PERCENTAGE'
    ? `${promotion.discountValue}% OFF`
    : `$${promotion.discountValue.toFixed(2)} OFF`;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header with Status Badge */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{promotion.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-3xl font-bold">{discountText}</div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {promotion.description && (
          <p className="text-sm text-gray-600">{promotion.description}</p>
        )}

        {/* Countdown Timer */}
        {status !== 'ended' && promotion.isActive && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-900">
                {status === 'active' ? 'Ends in:' : 'Starts in:'}
              </span>
              <span className="text-lg font-bold text-orange-600">{timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {new Date(promotion.startDate).toLocaleString()} - {new Date(promotion.endDate).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Product Count */}
        <div className="text-xs text-gray-500">
          {promotion.productIds && promotion.productIds.length > 0 ? (
            <span>{promotion.productIds.length} product(s) selected</span>
          ) : (
            <span>Applies to all products</span>
          )}
        </div>

        {/* Notification Status */}
        {promotion.notificationSent && (
          <div className="flex items-center text-xs text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Notifications sent
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        {/* Send Notifications Button */}
        {status === 'active' && !promotion.notificationSent && promotion.isActive && (
          <button
            onClick={() => onSendNotifications(promotion.id)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Send Notifications
          </button>
        )}

        <div className="flex space-x-2">
          {/* Toggle Active */}
          <button
            onClick={() => onToggleActive(promotion.id, promotion.isActive)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              promotion.isActive
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {promotion.isActive ? 'Deactivate' : 'Activate'}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(promotion.id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
