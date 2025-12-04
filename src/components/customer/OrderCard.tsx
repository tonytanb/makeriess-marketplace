'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/types/checkout';

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.createdAt);
  const estimatedTime = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime)
    : null;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <p className="text-sm text-gray-600">{order.vendorName}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            statusColors[order.status] || statusColors.PENDING
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Order Items Preview */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.productId}
            className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
          >
            {item.productImage && (
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-xs font-medium text-gray-600">
              +{order.items.length - 3}
            </p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-gray-600">
              {orderDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          {estimatedTime && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <div className="flex items-center gap-1 text-blue-600">
              <Clock className="w-4 h-4" />
              <p className="font-medium">
                {estimatedTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
