'use client';

import { useMemo } from 'react';
import { VendorMetrics } from '@/lib/hooks/useAnalytics';

interface SalesTrendChartProps {
  data: VendorMetrics[];
  period: 'daily' | 'weekly' | 'monthly';
}

export function SalesTrendChart({ data, period }: SalesTrendChartProps) {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map((d) => d.revenue), 1);
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return dateStr;
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend</h3>
      
      <div className="space-y-2">
        {data.map((metric, index) => (
          <div key={metric.date} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 flex-shrink-0">
              {formatDate(metric.date)}
            </div>
            
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${(metric.revenue / maxRevenue) * 100}%`,
                    minWidth: metric.revenue > 0 ? '2%' : '0%',
                  }}
                >
                  {metric.revenue > 0 && (
                    <span className="text-xs font-medium text-white">
                      ${metric.revenue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-20 text-sm text-gray-600 text-right flex-shrink-0">
              {metric.orders} {metric.orders === 1 ? 'order' : 'orders'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
          </div>
          <div className="text-gray-600">
            Total: <span className="font-semibold text-gray-900">
              ${data.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
