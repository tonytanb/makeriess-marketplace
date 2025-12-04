'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Eye,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useVendorAnalytics } from '@/lib/hooks/useAnalytics';
import { AnalyticsMetricCard } from '@/components/vendor/AnalyticsMetricCard';
import { SalesTrendChart } from '@/components/vendor/SalesTrendChart';
import { TopProductsTable } from '@/components/vendor/TopProductsTable';
import { EngagementMetricsChart } from '@/components/vendor/EngagementMetricsChart';

// TODO: Get vendorId from auth context
const VENDOR_ID = 'vendor_123';

type PeriodOption = 'daily' | 'weekly' | 'monthly';
type DateRangeOption = 'last7days' | 'last30days' | 'last90days' | 'custom';

export default function VendorAnalyticsPage() {
  const [period, setPeriod] = useState<PeriodOption>('daily');
  const [dateRange, setDateRange] = useState<DateRangeOption>('last30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    let start = new Date();

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }

    switch (dateRange) {
      case 'last7days':
        start.setDate(end.getDate() - 7);
        break;
      case 'last30days':
        start.setDate(end.getDate() - 30);
        break;
      case 'last90days':
        start.setDate(end.getDate() - 90);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [dateRange, customStartDate, customEndDate]);

  const { data: analytics, isLoading, error, refetch } = useVendorAnalytics({
    vendorId: VENDOR_ID,
    startDate,
    endDate,
    period,
  });

  const handleExportData = () => {
    if (!analytics) return;

    // Create CSV content
    const csvContent = [
      ['Date', 'Revenue', 'Orders', 'Product Views', 'Profile Views', 'Favorites', 'Cart Adds'],
      ...analytics.dailyMetrics.map((metric) => [
        metric.date,
        metric.revenue.toFixed(2),
        metric.orders,
        metric.productViews,
        metric.profileViews,
        metric.productFavorites,
        metric.cartAdds,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl text-gray-900 mb-4">Failed to load analytics</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Insights and performance metrics for your business
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            {/* Period Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as PeriodOption[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                      period === p
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={analytics.summary.revenue}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          format="currency"
          changeLabel={`Avg order: $${analytics.summary.avgOrderValue.toFixed(2)}`}
        />

        <AnalyticsMetricCard
          title="Total Orders"
          value={analytics.summary.orders}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          changeLabel={`${analytics.summary.completedOrders} completed`}
        />

        <AnalyticsMetricCard
          title="Total Views"
          value={analytics.summary.productViews + analytics.summary.profileViews}
          icon={Eye}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          changeLabel={`${analytics.summary.productViews} product views`}
        />

        <AnalyticsMetricCard
          title="Conversion Rate"
          value={analytics.summary.conversionRate}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          format="percentage"
          changeLabel={`${analytics.summary.completionRate.toFixed(1)}% completion`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesTrendChart data={analytics.dailyMetrics} period={period} />
        <EngagementMetricsChart data={analytics.dailyMetrics} />
      </div>

      {/* Top Products Table */}
      <div className="mb-8">
        <TopProductsTable products={analytics.topProducts} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Cart Add Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.summary.productViews > 0
              ? ((analytics.summary.cartAdds / analytics.summary.productViews) * 100).toFixed(1)
              : '0.0'}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.summary.cartAdds.toLocaleString()} cart additions
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Favorite Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.summary.productViews > 0
              ? ((analytics.summary.productFavorites / analytics.summary.productViews) * 100).toFixed(1)
              : '0.0'}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.summary.productFavorites.toLocaleString()} favorites
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Order Completion</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.summary.completionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analytics.summary.completedOrders} of {analytics.summary.orders} orders
          </p>
        </div>
      </div>
    </div>
  );
}
