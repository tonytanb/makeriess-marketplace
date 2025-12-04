'use client';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  platformFee,
  tax,
  total,
}: CartSummaryProps) {
  return (
    <div className="p-4 space-y-2">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      {/* Delivery Fee */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Delivery Fee</span>
        <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
      </div>

      {/* Platform Fee */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Service Fee</span>
        <span className="font-medium text-gray-900">${platformFee.toFixed(2)}</span>
      </div>

      {/* Tax */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Tax (estimated)</span>
        <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 pt-2 mt-2" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
