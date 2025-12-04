'use client';

import { ShoppingBag, Clock, Truck } from 'lucide-react';
import type { CartItem } from '@/lib/types/customer';

interface OrderSummaryProps {
  vendorGroups: Map<string, { vendorName: string; subtotal: number; items: CartItem[] }>;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  promoDiscount: number;
  loyaltyDiscount: number;
  total: number;
  deliveryMode: 'DELIVERY' | 'PICKUP';
  scheduledTime: Date | null;
}

export function OrderSummary({
  vendorGroups,
  subtotal,
  deliveryFee,
  platformFee,
  tax,
  promoDiscount,
  loyaltyDiscount,
  total,
  deliveryMode,
  scheduledTime,
}: OrderSummaryProps) {
  const totalDiscount = promoDiscount + loyaltyDiscount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
        <ShoppingBag className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      </div>

      {/* Delivery Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {deliveryMode === 'DELIVERY' ? (
            <>
              <Truck className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Delivery</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Pickup</span>
            </>
          )}
        </div>
        {scheduledTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              Scheduled for {scheduledTime.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Vendor Groups */}
      <div className="space-y-4">
        {Array.from(vendorGroups.entries()).map(([vendorId, group]) => (
          <div key={vendorId} className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">{group.vendorName}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {deliveryMode === 'DELIVERY' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="text-gray-900 font-medium">${deliveryFee.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Fee</span>
          <span className="text-gray-900 font-medium">${platformFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (estimated)</span>
          <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
        </div>

        {totalDiscount > 0 && (
          <>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Promo Discount</span>
                <span className="text-green-600 font-medium">
                  -${promoDiscount.toFixed(2)}
                </span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Loyalty Points</span>
                <span className="text-green-600 font-medium">
                  -${loyaltyDiscount.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💳 You&apos;ll be charged when you complete your order
        </p>
      </div>
    </div>
  );
}
