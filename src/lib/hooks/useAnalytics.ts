import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/amplify/client';

export interface VendorAnalyticsParams {
  vendorId: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface VendorMetrics {
  date: string;
  productViews: number;
  profileViews: number;
  productFavorites: number;
  cartAdds: number;
  orders: number;
  completedOrders: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  productName?: string;
  views: number;
  favorites: number;
  cartAdds: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}

export interface AnalyticsSummary {
  productViews: number;
  profileViews: number;
  productFavorites: number;
  cartAdds: number;
  orders: number;
  completedOrders: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
  completionRate: number;
}

export interface VendorAnalyticsData {
  vendorId: string;
  startDate: string;
  endDate: string;
  period: 'daily' | 'weekly' | 'monthly';
  summary: AnalyticsSummary;
  dailyMetrics: VendorMetrics[];
  topProducts: TopProduct[];
  historicalTrends: Array<{ date: string; value: number; [key: string]: unknown }> | null;
}

export function useVendorAnalytics(params: VendorAnalyticsParams) {
  return useQuery({
    queryKey: ['vendor-analytics', params],
    queryFn: async () => {
      const { data, errors } = await client.queries.getVendorAnalytics({
        vendorId: params.vendorId,
        startDate: params.startDate,
        endDate: params.endDate,
        period: params.period || 'daily',
      });

      if (errors) {
        console.error('Get vendor analytics errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get vendor analytics');
      }

      return data as VendorAnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.vendorId,
  });
}
