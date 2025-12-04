import { client } from '@/lib/amplify/client';
import type { Product, SearchFilters, Location } from '@/lib/types/customer';

export interface SearchProductsParams extends SearchFilters {
  location: Location;
  radiusMiles: number;
  limit?: number;
  nextToken?: string;
}

export interface SearchProductsResult {
  items: Product[];
  total: number;
  nextToken?: string;
}

export const productService = {
  search: async (params: SearchProductsParams): Promise<SearchProductsResult> => {
    try {
      const { data, errors } = await client.queries.searchProducts({
        query: params.query,
        category: params.category,
        dietaryTags: params.dietaryTags,
        latitude: params.location.latitude,
        longitude: params.location.longitude,
        radiusMiles: params.radiusMiles,
        sortBy: params.sortBy,
        limit: params.limit || 20,
        nextToken: params.nextToken,
      });

      if (errors) {
        console.error('Search products errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to search products');
      }

      return {
        items: (data?.items as Product[]) || [],
        total: data?.total || 0,
        nextToken: data?.nextToken || undefined,
      };
    } catch (error) {
      console.error('Product search error:', error);
      throw error;
    }
  },

  getRecommended: async (customerId: string, location: Location, limit = 10): Promise<Product[]> => {
    try {
      const { data, errors } = await client.queries.getRecommendedProducts({
        customerId,
        latitude: location.latitude,
        longitude: location.longitude,
        limit,
      });

      if (errors) {
        console.error('Get recommended products errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get recommended products');
      }

      return (data as Product[]) || [];
    } catch (error) {
      console.error('Get recommended products error:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Product | null> => {
    try {
      const { data, errors } = await client.models.Product.get({ id });

      if (errors) {
        console.error('Get product errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get product');
      }

      return (data as unknown as Product) || null;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  },
};
