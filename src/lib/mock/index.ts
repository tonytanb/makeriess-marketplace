/**
 * Mock data system entry point
 * Provides a clean interface for accessing mock data with proper types
 */

// Export all mock types
export type * from './types';

// Export mock data
export {
  mockProducts,
  mockVendors,
  mockOrders,
  mockReviews,
  mockStories,
  mockPromotions,
  // Backward compatibility aliases
  type Product,
  type Vendor,
  type Order,
  type Review,
  type Story,
  type Promotion
} from './data';

// Export mock API
export { mockAPI } from './api';

// Export type converters
export {
  mockProductToReal,
  mockVendorToReal,
  mockProductsToReal,
  mockVendorsToReal,
  ensureRealProduct,
  ensureRealVendor,
  isMockProduct,
  isRealProduct,
  isMockVendor,
  isRealVendor,
  type RealProduct,
  type RealVendor
} from './converters';

// Export type guards from types
export {
  isMockProduct as isValidMockProduct,
  isMockVendor as isValidMockVendor,
  isMockOrder as isValidMockOrder
} from './types';

// Utility functions for common operations
import { mockProducts as _mockProducts, mockVendors as _mockVendors, mockPromotions as _mockPromotions } from './data';

export const mockUtils = {
  // Get random products
  getRandomProducts: (count: number = 5) => {
    const shuffled = [..._mockProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  // Get products by category
  getProductsByCategory: (category: string) => {
    return _mockProducts.filter(p => p.category === category);
  },

  // Get trending products
  getTrendingProducts: () => {
    return _mockProducts.filter(p => p.trending);
  },

  // Get vendors by category
  getVendorsByCategory: (category: string) => {
    return _mockVendors.filter(v => v.category === category);
  },

  // Get active promotions
  getActivePromotions: () => {
    const now = new Date();
    return _mockPromotions.filter(p => 
      p.isActive && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  },

  // Search products
  searchProducts: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return _mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  }
};

// Environment detection
export const isDemoMode = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('demo') ||
           localStorage.getItem('DEMO_MODE') === 'true';
  }
  return process.env.NODE_ENV === 'development' || 
         process.env.DEMO_MODE === 'true';
};

// Default export for convenience
import { mockAPI as _mockAPI } from './api';
import { 
  mockProducts as _products, 
  mockVendors as _vendors, 
  mockOrders as _orders,
  mockReviews as _reviews,
  mockStories as _stories,
  mockPromotions as _promotions
} from './data';

export default {
  api: _mockAPI,
  data: {
    products: _products,
    vendors: _vendors,
    orders: _orders,
    reviews: _reviews,
    stories: _stories,
    promotions: _promotions
  },
  utils: mockUtils,
  isDemoMode
};
