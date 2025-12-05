'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useOrder, useUpdateOrderStatus } from '@/lib/hooks/useOrders';
import type { OrderStatus } from '@/lib/types/checkout';

const statusFlow: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
];

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
  READY: 'Ready for Pickup/Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function VendorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<OrderStatus | null>(null);

  // Fetch order details
  const { data: order, isLoading, error, refetch } = useOrder(orderId);

  // Update order status mutation
  const updateStatus = useUpdateOrderStatus();

  // Get next possible statuses based on current status
  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1) return [];
    
    const nextStatuses: OrderStatus[] = [];
    
    // Can move to next status
    if (currentIndex < statusFlow.length - 1) {
      nextStatuses.push(statusFlow[currentIndex + 1]);
    }
    
    // Can skip to READY from PREPARING (for quick orders)
    if (currentStatus === 'PREPARING' && currentIndex < statusFlow.length - 2) {
      nextStatuses.push(statusFlow[currentIndex + 2]);
    }
    
    // Can mark as completed from READY or OUT_FOR_DELIVERY
    if (currentStatus === 'READY' || currentStatus === 'OUT_FOR_DELIVERY') {
      if (!nextStatuses.includes('COMPLETED')) {
        nextStatuses.push('COMPLETED');
      }
    }
    
    return nextStatuses;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        status: newStatus,
      });
      
      setShowStatusModal(false);
      setSelectedNewStatus(null);
      refetch();
      
      // Show success message
      alert(`Order status updated to ${statusLabels[newStatus]}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600">
            This order could not be found or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const estimatedTime = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime)
    : null;
  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Orders</span>
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Placed on {orderDate.toLocaleDateString([], {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 ${
            statusColors[order.status] || statusColors.PENDING
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Actions */}
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && nextStatuses.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
              <div className="flex flex-wrap gap-3">
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedNewStatus(status);
                      setShowStatusModal(true);
                    }}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.productImage && (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer ID</p>
                  <p className="text-sm text-gray-600">{order.customerId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">customer@example.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {order.deliveryMode === 'DELIVERY' ? 'Delivery' : 'Pickup'} Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress.street}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                    {order.deliveryAddress.zipCode}
                  </p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-gray-500 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="font-medium">Note:</span> {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
              
              {estimatedTime && order.status !== 'COMPLETED' && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Estimated {order.deliveryMode === 'DELIVERY' ? 'Delivery' : 'Pickup'} Time
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {estimatedTime.toLocaleString([], {
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

          {/* Order Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-500">
                    {orderDate.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {order.status !== 'PENDING' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Status</p>
                    <p className="text-xs text-gray-500">{statusLabels[order.status]}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      {showStatusModal && selectedNewStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Status Update
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to update this order status to{' '}
              <span className="font-semibold">{statusLabels[selectedNewStatus]}</span>?
              {selectedNewStatus === 'COMPLETED' && (
                <span className="block mt-2 text-sm text-blue-600">
                  The customer will be notified that their order is complete.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedNewStatus(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedNewStatus)}
                disabled={updateStatus.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatus.isPending ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

