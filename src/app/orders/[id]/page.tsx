'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Loader2,
  MapPin,
  Clock,
  MessageCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderStatusTimeline } from '@/components/customer/OrderStatusTimeline';
import ReviewPromptModal from '@/components/customer/ReviewPromptModal';
import { useOrder } from '@/lib/hooks/useOrders';
import { useOrderSubscription } from '@/lib/hooks/useOrderSubscription';
import { useContactVendor } from '@/lib/hooks/useOrders';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [customerId, setCustomerId] = useState<string>('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get customer ID from auth (mock for now)
  useEffect(() => {
    // In production, get from Amplify Auth
    const mockCustomerId = 'mock-customer-id';
    setCustomerId(mockCustomerId);
  }, []);

  // Fetch order details
  const { data: order, isLoading, error, refetch } = useOrder(orderId);

  // Subscribe to real-time order updates
  const { latestUpdate } = useOrderSubscription(customerId, !!customerId);

  // Contact vendor mutation
  const contactVendor = useContactVendor();

  // Refetch when we get a real-time update for this order
  useEffect(() => {
    if (latestUpdate && latestUpdate.id === orderId) {
      refetch();
    }
  }, [latestUpdate, orderId, refetch]);

  const handleContactVendor = async () => {
    if (!contactMessage.trim()) return;

    try {
      await contactVendor.mutateAsync({
        orderId,
        message: contactMessage,
      });
      setContactMessage('');
      setShowContactModal(false);
      alert('Message sent to vendor!');
    } catch (err) {
      console.error('Failed to contact vendor:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this order. It may have been deleted or you don&apos;t have
            permission to view it.
          </p>
          <Link
            href="/orders"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-600">
                Placed on {orderDate.toLocaleDateString([], {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Order Status Timeline */}
        <OrderStatusTimeline
          currentStatus={order.status}
          estimatedDeliveryTime={order.estimatedDeliveryTime}
        />

        {/* Vendor Info & Contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {order.vendorName}
              </h2>
              <p className="text-sm text-gray-600">Vendor</p>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Vendor
            </button>
          </div>

          {/* Delivery Info */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {order.deliveryMode === 'DELIVERY' ? 'Delivery Address' : 'Pickup Location'}
                </p>
                <p className="text-sm text-gray-600">{order.deliveryAddress.street}</p>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                  {order.deliveryAddress.zipCode}
                </p>
                {order.deliveryAddress.instructions && (
                  <p className="text-sm text-gray-500 mt-1">
                    Note: {order.deliveryAddress.instructions}
                  </p>
                )}
              </div>
            </div>

            {order.estimatedDeliveryTime && order.status !== 'COMPLETED' && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Estimated {order.deliveryMode === 'DELIVERY' ? 'Delivery' : 'Pickup'} Time
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.estimatedDeliveryTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
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
            {order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Loyalty Points</span>
                <span className="text-green-600">
                  -{order.loyaltyPointsUsed} pts (-${(order.loyaltyPointsUsed / 100).toFixed(2)})
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Review Section - Show for completed orders */}
        {order.status === 'COMPLETED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">How was your order?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share your experience to help other customers make better decisions.
            </p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your order, you can contact the vendor directly or
            reach out to our support team.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Vendor
            </button>
            <Link
              href="/support"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {order && (
        <ReviewPromptModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          customerId={customerId}
          vendorId={order.vendorId}
          orderId={order.id}
          items={order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
          }))}
        />
      )}

      {/* Contact Vendor Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact {order.vendorName}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to the vendor about your order. They&apos;ll receive your message
              and respond as soon as possible.
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleContactVendor}
                disabled={!contactMessage.trim() || contactVendor.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactVendor.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
