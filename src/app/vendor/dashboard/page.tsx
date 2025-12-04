'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Eye,
  TrendingUp,
  BarChart3,
  Pause,
  Play,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useVendorDashboard, useToggleVendorStatus } from '@/lib/hooks/useVendors';
import { DashboardMetricCard } from '@/components/vendor/DashboardMetricCard';
import { RecentOrdersList } from '@/components/vendor/RecentOrdersList';
import { TopProductsList } from '@/components/vendor/TopProductsList';

// TODO: Get vendorId from auth context
const VENDOR_ID = 'vendor_123';

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading, error } = useVendorDashboard(VENDOR_ID);
  const toggleStatus = useToggleVendorStatus();
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleToggleStatus = async () => {
    if (!dashboard || isTogglingStatus) return;

    setIsTogglingStatus(true);
    try {
      await toggleStatus.mutateAsync({
        vendorId: VENDOR_ID,
        isPaused: !dashboard.isPaused,
      });
    } catch (error) {
      console.error('Failed to toggle vendor status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-xl text-gray-900 mb-4">Failed to load dashboard</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your business overview</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              {dashboard.isPaused ? (
                <span className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                  Orders Paused
                </span>
              ) : dashboard.isOpen ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Open Now
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  Currently Closed
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                dashboard.isPaused
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isTogglingStatus ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : dashboard.isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
              <span>{dashboard.isPaused ? 'Resume Orders' : 'Pause Orders'}</span>
            </button>

            <button
              onClick={() => router.push('/vendor/analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </button>

            <button
              onClick={() => router.push('/vendor/settings')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardMetricCard
            title="Today's Sales"
            value={`$${dashboard.todaySales.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle={`${dashboard.todayOrders} order${dashboard.todayOrders !== 1 ? 's' : ''}`}
          />

          <DashboardMetricCard
            title="Pending Orders"
            value={dashboard.pendingOrders}
            icon={ShoppingBag}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            subtitle="Needs attention"
          />

          <DashboardMetricCard
            title="Total Products"
            value={dashboard.totalProducts}
            icon={Package}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            subtitle={`${dashboard.visibleProducts} visible`}
          />

          <DashboardMetricCard
            title="Store Status"
            value={dashboard.isOpen ? 'Open' : 'Closed'}
            icon={Eye}
            iconColor={dashboard.isOpen ? 'text-green-600' : 'text-gray-600'}
            iconBgColor={dashboard.isOpen ? 'bg-green-100' : 'bg-gray-100'}
            subtitle={dashboard.isPaused ? 'Orders paused' : 'Accepting orders'}
          />
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => router.push('/vendor/orders')}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <RecentOrdersList orders={dashboard.recentOrders} />
          </div>

          {/* Top Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
              <button
                onClick={() => router.push('/vendor/products')}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <TopProductsList products={dashboard.topProducts} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/vendor/products')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">Add or edit your products</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/vendor/orders')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-600">Manage customer orders</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/vendor/analytics')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View detailed insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
