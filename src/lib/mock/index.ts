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
export const mockUtils = {
  // Get random products
  getRandomProducts: (count: number = 5) => {
    const { mockProducts } = require('./data');
    const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  // Get products by category
  getProductsByCategory: (category: string) => {
    const { mockProducts } = require('./data');
    return mockProducts.filter((p: any) => p.category === category);
  },

  // Get trending products
  getTrendingProducts: () => {
    const { mockProducts } = require('./data');
    return mockProducts.filter((p: any) => p.trending);
  },

  // Get vendors by category
  getVendorsByCategory: (category: string) => {
    const { mockVendors } = require('./data');
    return mockVendors.filter((v: any) => v.category === category);
  },

  // Get active promotions
  getActivePromotions: () => {
    const { mockPromotions } = require('./data');
    const now = new Date();
    return mockPromotions.filter((p: any) => 
      p.isActive && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    );
  },

  // Search products
  searchProducts: (query: string) => {
    const { mockProducts } = require('./data');
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter((p: any) => 
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
export default {
  api: require('./api').mockAPI,
  data: {
    products: require('./data').mockProducts,
    vendors: require('./data').mockVendors,
    orders: require('./data').mockOrders,
    reviews: require('./data').mockReviews,
    stories: require('./data').mockStories,
    promotions: require('./data').mockPromotions
  },
  utils: mockUtils,
  isDemoMode
};
