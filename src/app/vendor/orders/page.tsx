'use client';

import { useState, useEffect } from 'react';
import { Package, Loader2, Filter, RefreshCw } from 'lucide-react';
import { VendorOrderCard } from '@/components/vendor/VendorOrderCard';
import { useVendorOrders } from '@/lib/hooks/useOrders';
import type { OrderStatus } from '@/lib/types/checkout';

const statusFilters: { value: OrderStatus | 'ALL'; label: string; count?: number }[] = [
  { value: 'ALL', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function VendorOrdersPage() {
  const [vendorId, setVendorId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');

  // Get vendor ID from auth (mock for now)
  useEffect(() => {
    // In production, get from Amplify Auth
    const mockVendorId = 'vendor_1';
    setVendorId(mockVendorId);
  }, []);

  // Fetch orders based on selected filter
  const statusFilter = selectedStatus === 'ALL' ? undefined : selectedStatus;
  const { data: orders, isLoading, error, refetch } = useVendorOrders(vendorId, statusFilter);

  // Calculate counts for each status
  const allOrders = useVendorOrders(vendorId).data || [];
  const statusCounts = {
    ALL: allOrders.length,
    PENDING: allOrders.filter(o => o.status === 'PENDING').length,
    PREPARING: allOrders.filter(o => o.status === 'PREPARING').length,
    READY: allOrders.filter(o => o.status === 'READY').length,
    OUT_FOR_DELIVERY: allOrders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    COMPLETED: allOrders.filter(o => o.status === 'COMPLETED').length,
  };

  // Group orders by status for better organization
  const activeOrders = orders?.filter(
    o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  ) || [];
  const completedOrders = orders?.filter(o => o.status === 'COMPLETED') || [];

  if (isLoading && !orders) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Failed to load orders</p>
          <p className="text-red-600 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your customer orders
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
          {statusFilters.map((filter) => {
            const count = statusCounts[filter.value as keyof typeof statusCounts] || 0;
            const isActive = selectedStatus === filter.value;
            
            return (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-blue-500' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-600">
            {selectedStatus === 'ALL'
              ? "You don't have any orders yet."
              : `No ${selectedStatus.toLowerCase()} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (selectedStatus === 'ALL' || selectedStatus !== 'COMPLETED') && (
            <div>
              {selectedStatus === 'ALL' && (
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Active Orders ({activeOrders.length})
                </h2>
              )}
              <div className="grid gap-4">
                {activeOrders.map((order) => (
                  <VendorOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Orders Section */}
          {completedOrders.length > 0 && (selectedStatus === 'ALL' || selectedStatus === 'COMPLETED') && (
            <div>
              {selectedStatus === 'ALL' && activeOrders.length > 0 && (
                <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-8">
                  Completed Orders ({completedOrders.length})
                </h2>
              )}
              <div className="grid gap-4">
                {completedOrders.map((order) => (
                  <VendorOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Footer */}
      {orders && orders.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Items Sold</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

