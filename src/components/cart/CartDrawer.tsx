'use client';

import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const cartItems = useStore((state) => state.cartItems);
  const getVendorSubtotals = useStore((state) => state.getVendorSubtotals);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const clearCart = useStore((state) => state.clearCart);

  const vendorGroups = getVendorSubtotals();
  const cartTotal = getCartTotal();
  const isEmpty = cartItems.length === 0;

  // Platform fee (6% average)
  const platformFee = cartTotal * 0.06;
  
  // Estimated delivery fee per vendor (simplified - would be calculated based on zones)
  const deliveryFeePerVendor = 3.99;
  const totalDeliveryFee = vendorGroups.size * deliveryFeePerVendor;
  
  // Estimated tax (8%)
  const tax = cartTotal * 0.08;
  
  const grandTotal = cartTotal + platformFee + totalDeliveryFee + tax;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <span className="text-sm text-gray-500">
                ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close cart"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some delicious items from local vendors to get started!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {/* Vendor Groups */}
                {Array.from(vendorGroups.entries()).map(([vendorId, group]) => (
                  <div key={vendorId} className="space-y-3">
                    {/* Vendor Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        {group.vendorName}
                      </h3>
                      <span className="text-sm font-medium text-gray-700">
                        ${group.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Vendor Minimum Warning */}
                    {group.subtotal < 15 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-900">
                            Minimum order not met
                          </p>
                          <p className="text-amber-700">
                            Add ${(15 - group.subtotal).toFixed(2)} more to reach the $15.00 minimum
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cart Items */}
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <CartItem key={item.productId} item={item} />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Footer - Cart Summary */}
          {!isEmpty && (
            <div className="border-t border-gray-200 bg-gray-50">
              <CartSummary
                subtotal={cartTotal}
                deliveryFee={totalDeliveryFee}
                platformFee={platformFee}
                tax={tax}
                total={grandTotal}
              />
              
              <div className="p-4 space-y-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-white text-gray-700 text-center font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
