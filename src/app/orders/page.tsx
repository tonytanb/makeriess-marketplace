'use client';

import { useState, useEffect } from 'react';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { OrderCard } from '@/components/customer/OrderCard';
import { useOrderHistory } from '@/lib/hooks/useOrders';
import { useOrderSubscription } from '@/lib/hooks/useOrderSubscription';
import type { Order } from '@/lib/types/checkout';

export default function OrdersPage() {
  const [customerId, setCustomerId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Get customer ID from auth (mock for now)
  useEffect(() => {
    // In production, get from Amplify Auth
    const mockCustomerId = 'mock-customer-id';
    setCustomerId(mockCustomerId);
  }, []);

  // Fetch order history
  const { data: orders = [], isLoading, error, refetch } = useOrderHistory(customerId);

  // Subscribe to real-time order updates
  const { latestUpdate } = useOrderSubscription(customerId, !!customerId);

  // Refetch when we get a real-time update
  useEffect(() => {
    if (latestUpdate) {
      refetch();
    }
  }, [latestUpdate, refetch]);

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    if (filter === 'active') {
      return !['COMPLETED', 'CANCELLED'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['COMPLETED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t load your orders. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start exploring and place your first order!'
                : `You don't have any ${filter} orders at the moment.`}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
