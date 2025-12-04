'use client';

import { useMemo } from 'react';
import { VendorMetrics } from '@/lib/hooks/useAnalytics';
import { Eye, Heart, ShoppingCart } from 'lucide-react';

interface EngagementMetricsChartProps {
  data: VendorMetrics[];
}

export function EngagementMetricsChart({ data }: EngagementMetricsChartProps) {
  const totals = useMemo(() => {
    return data.reduce(
      (acc, metric) => ({
        views: acc.views + metric.productViews + metric.profileViews,
        favorites: acc.favorites + metric.productFavorites,
        cartAdds: acc.cartAdds + metric.cartAdds,
      }),
      { views: 0, favorites: 0, cartAdds: 0 }
    );
  }, [data]);

  const maxValue = useMemo(() => {
    return Math.max(totals.views, totals.favorites, totals.cartAdds, 1);
  }, [totals]);

  const metrics = [
    {
      label: 'Total Views',
      value: totals.views,
      icon: Eye,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'Favorites',
      value: totals.favorites,
      icon: Heart,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-100',
      textColor: 'text-pink-700',
    },
    {
      label: 'Cart Adds',
      value: totals.cartAdds,
      icon: ShoppingCart,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Engagement</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No engagement data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Engagement</h3>
      
      <div className="space-y-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = (metric.value / maxValue) * 100;
          
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.lightColor}`}>
                    <Icon className={`w-4 h-4 ${metric.textColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${metric.color} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Favorite Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {totals.views > 0 ? ((totals.favorites / totals.views) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Cart Add Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {totals.views > 0 ? ((totals.cartAdds / totals.views) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
