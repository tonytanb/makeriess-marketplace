import { useQuery } from '@tanstack/react-query';
import { productService, type SearchProductsParams } from '@/lib/api/products';
import type { Location } from '@/lib/types/customer';
import { isDemoMode, mockAPI } from '@/lib/mock/api';

export function useProductSearch(params: SearchProductsParams) {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: async () => {
      if (isDemoMode()) {
        const result = await mockAPI.searchProducts({
          query: params.query,
          category: params.category,
          limit: params.limit,
        });
        return {
          items: result.products,
          total: result.total,
          nextToken: undefined,
        };
      }
      return productService.search(params);
    },
    enabled: !!params.location.latitude && !!params.location.longitude,
  });
}

export function useRecommendedProducts(customerId: string, location: Location, limit = 10) {
  return useQuery({
    queryKey: ['products', 'recommended', customerId, location, limit],
    queryFn: async () => {
      if (isDemoMode()) {
        return mockAPI.getTrendingProducts(limit);
      }
      return productService.getRecommended(customerId, location, limit);
    },
    enabled: !!customerId && !!location.latitude && !!location.longitude,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => {
      if (isDemoMode()) {
        return mockAPI.getProduct(id);
      }
      return productService.getById(id);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
}
