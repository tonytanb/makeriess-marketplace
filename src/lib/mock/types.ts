/**
 * Mock Data Types
 * Separate types for mock data to avoid conflicts with real Amplify types
 */

export interface MockLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MockPOSConnection {
  provider: 'TOAST' | 'SQUARE' | 'SHOPIFY';
  accountId: string;
  restaurantGuid?: string;
  lastSyncAt: string;
  syncStatus: 'success' | 'partial' | 'error';
  productsCount: number;
}

export interface MockVendor {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  location: MockLocation;
  hours: string;
  phone: string;
  email: string;
  isOpen: boolean;
  deliveryRadius: number;
  posConnection?: MockPOSConnection;
}

export interface MockProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  inventory: number;
  tags: string[];
  trending: boolean;
}

export interface MockOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface MockAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface MockOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  status: 'processing' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  total: number;
  items: MockOrderItem[];
  createdAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  deliveryAddress: MockAddress;
}

export interface MockUserAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  latitude: number;
  longitude: number;
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  addresses: MockUserAddress[];
  favorites: string[];
  favoriteVendors: string[];
}

export interface MockReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface MockPromotion {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  discountPercent?: number;
  freeDelivery?: boolean;
  minimumOrder?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MockSyncLog {
  id: string;
  vendorId: string;
  provider: 'TOAST' | 'SQUARE' | 'SHOPIFY';
  status: 'success' | 'partial' | 'error';
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  errors?: string[];
  startedAt: string;
  completedAt: string;
  duration: number;
}

export interface MockVendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface MockCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorId: string;
  vendorName: string;
}

export interface MockCart {
  items: MockCartItem[];
  total: number;
}

export interface MockReel {
  id: string;
  vendorId: string;
  vendorName: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  likes: number;
  views: number;
  productIds: string[];
  createdAt: string;
}

export interface MockNotification {
  id: string;
  type: 'order_update' | 'promotion' | 'message';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
