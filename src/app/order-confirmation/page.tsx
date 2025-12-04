'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Clock, Truck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReviewPromptModal from '@/components/customer/ReviewPromptModal';
import { trackReferralOrder } from '@/lib/hooks/useReferralTracking';
import type { Order } from '@/lib/types/checkout';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('paymentIntent');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  useEffect(() => {
    if (!paymentIntentId) {
      router.push('/');
      return;
    }

    // Fetch order details
    const fetchOrders = async () => {
      try {
        // In production, this would fetch from the backend
        // For now, we'll use mock data
        const mockOrders: Order[] = [
          {
            id: 'order_' + Math.random().toString(36).substr(2, 9),
            customerId: 'mock-customer-id',
            vendorId: 'vendor_1',
            vendorName: 'Sweet Treats Bakery',
            items: [
              {
                productId: 'prod_1',
                productName: 'Chocolate Croissant',
                productImage: '/placeholder-product.jpg',
                vendorId: 'vendor_1',
                vendorName: 'Sweet Treats Bakery',
                quantity: 2,
                price: 4.5,
                subtotal: 9.0,
              },
            ],
            subtotal: 9.0,
            deliveryFee: 3.99,
            platformFee: 0.54,
            tax: 0.72,
            discount: 0,
            total: 14.25,
            status: 'CONFIRMED',
            deliveryAddress: {
              street: '123 Main St',
              city: 'Columbus',
              state: 'OH',
              zipCode: '43201',
              label: 'home',
            },
            deliveryMode: 'DELIVERY',
            stripePaymentIntentId: paymentIntentId,
            createdAt: new Date().toISOString(),
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          },
        ];

        setOrders(mockOrders);
        
        // Track referral order if applicable
        const totalAmount = mockOrders.reduce((sum, order) => sum + order.total, 0);
        trackReferralOrder(mockOrders[0].id, totalAmount);
        
        // Send confirmation email (would be handled by backend in production)
        // await sendOrderConfirmationEmail(mockOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [paymentIntentId, router]);

  // Show review prompt after 5 seconds
  useEffect(() => {
    if (orders.length > 0 && orders[0].status === 'COMPLETED') {
      const timer = setTimeout(() => {
        setShowReviewPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'We couldn&apos;t find your order. Please check your email for confirmation.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const confirmationNumber = orders[0].id.slice(-8).toUpperCase();
  const estimatedDeliveryTime = orders[0].estimatedDeliveryTime
    ? new Date(orders[0].estimatedDeliveryTime)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-green-100 text-lg">
            Thank you for your order. We&apos;ve sent a confirmation email.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Confirmation Number */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
              <p className="text-lg font-bold text-gray-900">{confirmationNumber}</p>
            </div>

            {/* Estimated Delivery */}
            {estimatedDeliveryTime && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {estimatedDeliveryTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              {orders[0].deliveryMode === 'DELIVERY' ? (
                <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
              ) : (
                <Package className="w-5 h-5 text-gray-500 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {orders[0].deliveryMode === 'DELIVERY' ? 'Delivery Address' : 'Pickup'}
                </p>
                <p className="text-sm text-gray-600">
                  {orders[0].deliveryAddress.street}
                </p>
                <p className="text-sm text-gray-600">
                  {orders[0].deliveryAddress.city}, {orders[0].deliveryAddress.state}{' '}
                  {orders[0].deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Vendor */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              {/* Vendor Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{order.vendorName}</h2>
                  <p className="text-sm text-gray-600">Order #{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-gray-900">${order.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Track Order
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your order, please contact us or reach out to the vendor directly.
          </p>
          <div className="flex gap-4">
            <Link
              href="/support"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
            <Link
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Order Details
            </Link>
          </div>
        </div>
      </div>

      {/* Review Prompt Modal */}
      {orders.length > 0 && (
        <ReviewPromptModal
          isOpen={showReviewPrompt}
          onClose={() => setShowReviewPrompt(false)}
          customerId={orders[0].customerId}
          vendorId={orders[0].vendorId}
          orderId={orders[0].id}
          items={orders[0].items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
          }))}
        />
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
