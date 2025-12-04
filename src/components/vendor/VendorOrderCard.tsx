'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, MapPin, User } from 'lucide-react';
import type { Order } from '@/lib/types/checkout';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

interface VendorOrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  READY: 'bg-green-100 text-green-800 border-green-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'New Order',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function VendorOrderCard({ order }: VendorOrderCardProps) {
  const orderDate = new Date(order.createdAt);
  const estimatedTime = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime)
    : null;

  // Calculate time since order was placed
  const minutesAgo = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60));
  const timeAgoText = minutesAgo < 60 
    ? `${minutesAgo}m ago` 
    : `${Math.floor(minutesAgo / 60)}h ago`;

  return (
    <Link
      href={`/vendor/orders/${order.id}`}
      className="block bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-gray-500" />
            <p className="text-base font-bold text-gray-900">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <span className="text-sm text-gray-500">• {timeAgoText}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Customer ID: {order.customerId.slice(0, 8)}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${
            statusColors[order.status] || statusColors.PENDING
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
          {order.items.slice(0, 4).map((item) => (
            <div
              key={item.productId}
              className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
            >
              {item.productImage && (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes={imageSizes.orderItem}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={generateBlurDataURL()}
                  quality={80}
                />
              )}
              <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs font-bold px-1.5 py-0.5 rounded-tl">
                ×{item.quantity}
              </div>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <p className="text-sm font-bold text-gray-600">
                +{order.items.length - 4}
              </p>
            </div>
          )}
        </div>
        
        {/* Item names */}
        <div className="text-sm text-gray-700">
          {order.items.slice(0, 2).map((item, idx) => (
            <span key={item.productId}>
              {item.quantity}× {item.productName}
              {idx < Math.min(order.items.length, 2) - 1 && ', '}
            </span>
          ))}
          {order.items.length > 2 && (
            <span className="text-gray-500"> +{order.items.length - 2} more</span>
          )}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-2 flex-1">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-0.5">
              {order.deliveryMode === 'DELIVERY' ? 'Delivery' : 'Pickup'}
            </p>
            <p className="text-gray-600">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </p>
            {order.deliveryAddress.instructions && (
              <p className="text-gray-500 text-xs mt-1">
                Note: {order.deliveryAddress.instructions}
              </p>
            )}
          </div>
        </div>
        
        {estimatedTime && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-gray-600 text-xs">Due by</p>
              <p className="font-semibold text-blue-600">
                {estimatedTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Order Total</p>
          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}
