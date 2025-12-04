import { client } from '@/lib/amplify/client';
import type { Vendor, Location, Product } from '@/lib/types/customer';

export interface GetNearbyVendorsParams {
  location: Location;
  radiusMiles: number;
  category?: string;
  limit?: number;
}

export interface VendorDashboardData {
  vendorId: string;
  todaySales: number;
  todayOrders: number;
  pendingOrders: number;
  totalProducts: number;
  visibleProducts: number;
  recentOrders: Array<{ id: string; status: string; total: number; createdAt: string; [key: string]: unknown }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    revenue: number;
  }>;
  isOpen: boolean;
  isPaused: boolean;
}

export interface ConnectPOSParams {
  vendorId: string;
  provider: 'SQUARE' | 'TOAST' | 'SHOPIFY';
  authCode: string;
}

export interface ConnectPOSResult {
  success: boolean;
  message: string;
}

export interface SyncPOSResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  errors: string[];
}

export interface POSConnection {
  provider: 'SQUARE' | 'TOAST' | 'SHOPIFY';
  accountId: string;
  lastSyncAt?: string;
  syncStatus: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED';
}

export interface SyncLog {
  timestamp: string;
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  errors: string[];
}

export const vendorService = {
  getNearby: async (params: GetNearbyVendorsParams): Promise<Vendor[]> => {
    try {
      const { data, errors } = await client.queries.getNearbyVendors({
        latitude: params.location.latitude,
        longitude: params.location.longitude,
        radiusMiles: params.radiusMiles,
        category: params.category,
        limit: params.limit || 20,
      });

      if (errors) {
        console.error('Get nearby vendors errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get nearby vendors');
      }

      return (data as Vendor[]) || [];
    } catch (error) {
      console.error('Get nearby vendors error:', error);
      throw error;
    }
  },

  getById: async (vendorId: string): Promise<Vendor | null> => {
    try {
      const { data, errors } = await client.models.Vendor.get({ id: vendorId });

      if (errors) {
        console.error('Get vendor by ID errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get vendor');
      }

      return data as Vendor | null;
    } catch (error) {
      console.error('Get vendor by ID error:', error);
      throw error;
    }
  },

  getProducts: async (vendorId: string): Promise<Product[]> => {
    try {
      const { data, errors } = await client.models.Product.list({
        filter: {
          vendorId: { eq: vendorId },
          isVisible: { eq: true },
        },
      });

      if (errors) {
        console.error('Get vendor products errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get vendor products');
      }

      // Transform the data to match Product type
      const products = (data || []).map((item) => ({
        id: item.id,
        vendorId: item.vendorId,
        name: item.name,
        description: item.description || undefined,
        price: item.price,
        images: item.images || [],
        category: item.category,
        dietaryTags: item.dietaryTags || undefined,
        isVisible: item.isVisible,
        isAvailable: item.isAvailable,
        inventory: item.inventory || undefined,
        badges: item.badges || undefined,
        trendScore: item.trendScore || undefined,
        viewCount: item.viewCount || 0,
        favoriteCount: item.favoriteCount || 0,
        orderCount: item.orderCount || 0,
        rating: item.rating || undefined,
        reviewCount: item.reviewCount || 0,
      })) as Product[];

      return products;
    } catch (error) {
      console.error('Get vendor products error:', error);
      throw error;
    }
  },

  getDashboard: async (vendorId: string): Promise<VendorDashboardData> => {
    try {
      const { data, errors } = await client.queries.getVendorDashboard({
        vendorId,
      });

      if (errors) {
        console.error('Get vendor dashboard errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get vendor dashboard');
      }

      return data as VendorDashboardData;
    } catch (error) {
      console.error('Get vendor dashboard error:', error);
      throw error;
    }
  },

  toggleStatus: async (vendorId: string, isPaused: boolean): Promise<Vendor> => {
    try {
      const { data, errors } = await client.models.Vendor.update({
        id: vendorId,
        isPaused,
        pausedUntil: isPaused ? undefined : null,
      });

      if (errors) {
        console.error('Toggle vendor status errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to toggle vendor status');
      }

      return data as Vendor;
    } catch (error) {
      console.error('Toggle vendor status error:', error);
      throw error;
    }
  },

  connectPOS: async (params: ConnectPOSParams): Promise<ConnectPOSResult> => {
    try {
      const { data, errors } = await client.queries.connectPOS({
        vendorId: params.vendorId,
        provider: params.provider,
        authCode: params.authCode,
      });

      if (errors) {
        console.error('Connect POS errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to connect POS system');
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Unknown error',
      };
    } catch (error) {
      console.error('Connect POS error:', error);
      throw error;
    }
  },

  syncPOSProducts: async (vendorId: string): Promise<SyncPOSResult> => {
    try {
      const { data, errors } = await client.queries.syncPOSProducts({
        vendorId,
      });

      if (errors) {
        console.error('Sync POS products errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to sync POS products');
      }

      return {
        success: data?.success || false,
        productsAdded: data?.productsAdded || 0,
        productsUpdated: data?.productsUpdated || 0,
        productsRemoved: data?.productsRemoved || 0,
        errors: data?.errors || [],
      };
    } catch (error) {
      console.error('Sync POS products error:', error);
      throw error;
    }
  },

  getPOSConnection: async (vendorId: string): Promise<POSConnection | null> => {
    try {
      const vendor = await vendorService.getById(vendorId);
      if (!vendor || !vendor.posSystem) {
        return null;
      }

      return {
        provider: vendor.posSystem.provider as 'SQUARE' | 'TOAST' | 'SHOPIFY',
        accountId: vendor.posSystem.accountId,
        lastSyncAt: vendor.posSystem.lastSyncAt,
        syncStatus: vendor.posSystem.syncStatus as 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED',
      };
    } catch (error) {
      console.error('Get POS connection error:', error);
      throw error;
    }
  },

  getSyncLogs: async (vendorId: string, limit: number = 10): Promise<SyncLog[]> => {
    try {
      // Query DynamoDB for sync logs
      // This would need a custom query implementation
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Get sync logs error:', error);
      throw error;
    }
  },

  disconnectPOS: async (vendorId: string): Promise<void> => {
    try {
      // Update vendor to remove POS connection
      const { errors } = await client.models.Vendor.update({
        id: vendorId,
        posConnected: false,
        posSystem: null,
      });

      if (errors) {
        console.error('Disconnect POS errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to disconnect POS system');
      }
    } catch (error) {
      console.error('Disconnect POS error:', error);
      throw error;
    }
  },
};
