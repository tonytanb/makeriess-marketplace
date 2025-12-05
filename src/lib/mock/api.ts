/**
 * Mock API Service
 * Simulates backend API calls with realistic delays and responses
 */

import {
  mockVendors,
  mockProducts,
  mockOrders,
  mockUser,
  mockReviews,
  mockPromotions,
  mockSyncLogs,
  mockVendorAnalytics,
} from './data';
import {
  mockProductToReal,
  mockVendorToReal,
  mockProductsToReal,
  mockVendorsToReal
} from './converters';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Check if demo mode is enabled
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('demoMode') === 'true';
};

export const enableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoMode', 'true');
  }
};

export const disableDemoMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demoMode');
  }
};

// Mock API functions
export const mockAPI = {
  // Products
  async searchProducts(params: { query?: string; category?: string; limit?: number }) {
    await delay();
    let results = [...mockProducts];
    
    if (params.query) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(params.query!.toLowerCase()) ||
        p.description.toLowerCase().includes(params.query!.toLowerCase())
      );
    }
    
    if (params.category) {
      results = results.filter(p => p.category === params.category);
    }
    
    if (params.limit) {
      results = results.slice(0, params.limit);
    }
    
    // Convert mock products to real products
    const convertedProducts = mockProductsToReal(results);
    return { products: convertedProducts, total: convertedProducts.length };
  },

  async getProduct(id: string) {
    await delay();
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return mockProductToReal(product);
  },

  async getTrendingProducts(limit: number = 6) {
    await delay();
    const trending = mockProducts.filter(p => p.trending).slice(0, limit);
    return mockProductsToReal(trending);
  },

  // Vendors
  async getNearbyVendors(params: { latitude: number; longitude: number; radiusMiles: number }) {
    await delay();
    // In a real app, this would calculate distance
    return mockVendorsToReal(mockVendors);
  },

  async getVendor(id: string) {
    await delay();
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) throw new Error('Vendor not found');
    return mockVendorToReal(vendor);
  },

  async getVendorProducts(vendorId: string) {
    await delay();
    const products = mockProducts.filter(p => p.vendorId === vendorId);
    return mockProductsToReal(products);
  },

  // Orders
  async getOrders() {
    await delay();
    return mockOrders;
  },

  async getOrder(id: string) {
    await delay();
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async createOrder(orderData: Record<string, unknown>) {
    await delay(1000);
    const newOrder = {
      id: `order-${Date.now()}`,
      ...orderData,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    return newOrder;
  },

  // User
  async getCurrentUser() {
    await delay();
    return mockUser;
  },

  async updateUser(updates: Partial<typeof mockUser>) {
    await delay();
    return { ...mockUser, ...updates };
  },

  // Favorites
  async getFavorites() {
    await delay();
    return mockProducts.filter(p => mockUser.favorites.includes(p.id));
  },

  async addFavorite(productId: string) {
    await delay(300);
    if (!mockUser.favorites.includes(productId)) {
      mockUser.favorites.push(productId);
    }
    return { success: true };
  },

  async removeFavorite(productId: string) {
    await delay(300);
    const index = mockUser.favorites.indexOf(productId);
    if (index > -1) {
      mockUser.favorites.splice(index, 1);
    }
    return { success: true };
  },

  // Reviews
  async getProductReviews(productId: string) {
    await delay();
    return mockReviews.filter(r => r.productId === productId);
  },

  async createReview(reviewData: Record<string, unknown>) {
    await delay(800);
    const newReview = {
      id: `review-${Date.now()}`,
      ...reviewData,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    return newReview;
  },

  // Promotions
  async getActivePromotions(vendorId?: string) {
    await delay();
    let promos = mockPromotions.filter(p => p.isActive);
    if (vendorId) {
      promos = promos.filter(p => p.vendorId === vendorId);
    }
    return promos;
  },

  // Cart (stored in localStorage)
  async getCart() {
    await delay(200);
    if (typeof window === 'undefined') return { items: [], total: 0 };
    const cart = localStorage.getItem('mockCart');
    return cart ? JSON.parse(cart) : { items: [], total: 0 };
  },

  async addToCart(item: { productId: string; quantity: number; price: number; [key: string]: unknown }) {
    await delay(300);
    if (typeof window === 'undefined') return;
    const cart = await this.getCart();
    const existingItem = cart.items.find((i: { productId: string }) => i.productId === item.productId);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    
    cart.total = cart.items.reduce((sum: number, i: { price: number; quantity: number }) => sum + (i.price * i.quantity), 0);
    localStorage.setItem('mockCart', JSON.stringify(cart));
    return cart;
  },

  async removeFromCart(productId: string) {
    await delay(300);
    if (typeof window === 'undefined') return;
    const cart = await this.getCart();
    cart.items = cart.items.filter((i: { productId: string }) => i.productId !== productId);
    cart.total = cart.items.reduce((sum: number, i: { price: number; quantity: number }) => sum + (i.price * i.quantity), 0);
    localStorage.setItem('mockCart', JSON.stringify(cart));
    return cart;
  },

  async clearCart() {
    await delay(200);
    if (typeof window === 'undefined') return;
    localStorage.removeItem('mockCart');
    return { items: [], total: 0 };
  },

  // POS Connections
  async getPOSConnection(vendorId: string) {
    await delay();
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor?.posConnection) return null;
    return vendor.posConnection;
  },

  async connectPOS(params: { vendorId: string; provider: string; authCode: string }) {
    await delay(1500);
    // Simulate successful connection
    return {
      success: true,
      message: `Successfully connected to ${params.provider}`,
      connection: {
        provider: params.provider,
        accountId: `${params.provider.toLowerCase()}_demo_${Date.now()}`,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'success',
        productsCount: 0,
      },
    };
  },

  async disconnectPOS(_vendorId: string) {
    await delay(800);
    return { success: true };
  },

  async syncPOSProducts(_vendorId: string) {
    await delay(2000);
    // Simulate sync results
    const productsAdded = Math.floor(Math.random() * 5);
    const productsUpdated = Math.floor(Math.random() * 20);
    const productsRemoved = Math.floor(Math.random() * 3);
    
    return {
      success: true,
      productsAdded,
      productsUpdated,
      productsRemoved,
      errors: [],
    };
  },

  async getSyncLogs(vendorId: string) {
    await delay();
    return mockSyncLogs.filter(log => log.vendorId === vendorId);
  },

  // Vendor Analytics
  async getVendorAnalytics(vendorId: string, _params?: { startDate?: string; endDate?: string }) {
    await delay();
    const analytics = mockVendorAnalytics[vendorId as keyof typeof mockVendorAnalytics];
    if (!analytics) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
        revenueByDay: [],
      };
    }
    return analytics;
  },

  async getVendorDashboard(vendorId: string) {
    await delay();
    const vendorOrders = mockOrders.filter(o => o.vendorId === vendorId);
    const pendingOrders = vendorOrders.filter(o => o.status === 'processing');
    const todayRevenue = vendorOrders
      .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.total, 0);
    
    return {
      pendingOrders: pendingOrders.length,
      todayRevenue,
      totalProducts: mockProducts.filter(p => p.vendorId === vendorId).length,
      averageRating: mockVendors.find(v => v.id === vendorId)?.rating || 0,
      recentOrders: vendorOrders.slice(0, 5),
    };
  },

  // Vendor Profile Management
  async updateVendorProfile(vendorId: string, updates: Record<string, unknown>) {
    await delay(800);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error('Vendor not found');
    return { ...vendor, ...updates };
  },

  async toggleVendorStatus(vendorId: string) {
    await delay(500);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error('Vendor not found');
    vendor.isOpen = !vendor.isOpen;
    return { success: true, isOpen: vendor.isOpen };
  },

  // Reels / Social Content
  async getReels(params?: { limit?: number; vendorId?: string }) {
    await delay();
    const reels = [
      {
        id: 'reel-1',
        vendorId: 'vendor-1',
        vendorName: 'Sweet Treats Bakery',
        videoUrl: 'https://example.com/reel1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400',
        caption: 'Watch us make our famous chocolate chip cookies! 🍪',
        likes: 1234,
        views: 5678,
        productIds: ['product-1'],
        createdAt: '2025-12-03T14:30:00Z',
      },
      {
        id: 'reel-2',
        vendorId: 'vendor-2',
        vendorName: 'Handmade Pottery Studio',
        videoUrl: 'https://example.com/reel2.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
        caption: 'Creating magic on the pottery wheel ✨',
        likes: 892,
        views: 3421,
        productIds: ['product-3'],
        createdAt: '2025-12-02T10:15:00Z',
      },
    ];

    let filtered = [...reels];
    if (params?.vendorId) {
      filtered = filtered.filter(r => r.vendorId === params.vendorId);
    }
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  },

  async trackStoryView(_storyId: string) {
    await delay(200);
    return { success: true };
  },

  async interactWithStory(_storyId: string, _action: 'like' | 'share') {
    await delay(300);
    return { success: true };
  },

  // Notifications
  async getNotifications(_userId: string) {
    await delay();
    return [
      {
        id: 'notif-1',
        type: 'order_update',
        title: 'Order Delivered',
        message: 'Your order from Sweet Treats Bakery has been delivered!',
        read: false,
        createdAt: '2025-12-04T11:30:00Z',
      },
      {
        id: 'notif-2',
        type: 'promotion',
        title: 'New Promotion',
        message: '20% off all cookies this weekend at Sweet Treats Bakery',
        read: false,
        createdAt: '2025-12-04T09:00:00Z',
      },
    ];
  },

  async markNotificationRead(_notificationId: string) {
    await delay(200);
    return { success: true };
  },
};
