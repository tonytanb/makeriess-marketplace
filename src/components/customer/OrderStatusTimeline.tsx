'use client';

import { Check, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/lib/types/checkout';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  estimatedDeliveryTime?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: Check },
  { status: 'PREPARING', label: 'Preparing', icon: Package },
  { status: 'READY', label: 'Ready', icon: CheckCircle },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle },
];

const statusOrder: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
];

export function OrderStatusTimeline({
  currentStatus,
  estimatedDeliveryTime,
}: OrderStatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Order Cancelled</h3>
            <p className="text-sm text-red-700">
              This order has been cancelled. If you have any questions, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
        {estimatedDeliveryTime && currentStatus !== 'COMPLETED' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Est. delivery:{' '}
              <span className="font-medium text-gray-900">
                {new Date(estimatedDeliveryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div
          className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
          style={{
            height: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
          }}
        />

        {/* Status Steps */}
        <div className="space-y-8">
          {statusSteps.map((step) => {
            const stepIndex = statusOrder.indexOf(step.status);
            const isCompleted = stepIndex <= currentIndex;
            const isCurrent = step.status === currentStatus;
            const Icon = step.icon;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Label */}
                <div className="flex-1 pt-2">
                  <p
                    className={`font-medium ${
                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-blue-600 mt-1">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStatus === 'COMPLETED' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Order delivered successfully!
          </p>
        </div>
      )}
    </div>
  );
}
