/**
 * GraphQL Type Definitions
 * 
 * These types provide additional type safety for GraphQL operations
 * They complement the auto-generated types from Amplify
 */

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'OUT_FOR_DELIVERY' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type DeliveryMode = 'DELIVERY' | 'PICKUP';

export type POSProvider = 'SQUARE' | 'TOAST' | 'SHOPIFY';

export type ProductSortOption = 
  | 'DISTANCE' 
  | 'PRICE_LOW_TO_HIGH' 
  | 'PRICE_HIGH_TO_LOW' 
  | 'POPULARITY' 
  | 'RATING';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
  instructions?: string;
}

export interface SearchProductsInput {
  query?: string;
  category?: string;
  dietaryTags?: string[];
  latitude: number;
  longitude: number;
  radiusMiles: number;
  sortBy?: ProductSortOption;
  limit?: number;
  nextToken?: string;
}

export interface SearchProductsResult {
  items: any[];
  total: number;
  nextToken?: string | null;
}

export interface GetNearbyVendorsInput {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  category?: string;
  limit?: number;
}

export interface GetRecommendedProductsInput {
  customerId: string;
  latitude: number;
  longitude: number;
  limit?: number;
}

export interface ConnectPOSInput {
  vendorId: string;
  provider: POSProvider;
  authCode: string;
}

export interface ConnectPOSResult {
  success: boolean;
  message: string;
  vendor: any | null;
}

export interface SyncPOSProductsInput {
  vendorId: string;
}

export interface SyncPOSProductsResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  errors: string[];
}

export interface CheckoutItem {
  productId: string;
  vendorId: string;
  quantity: number;
}

export interface CreateCheckoutSessionInput {
  customerId: string;
  items: CheckoutItem[];
  deliveryAddress: Address;
  deliveryMode: DeliveryMode;
  scheduledFor?: string;
  promoCode?: string;
}

export interface CreateCheckoutSessionResult {
  sessionId: string | null;
  clientSecret: string | null;
  orders: any[];
  total: number | null;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed: boolean;
}

export interface DeliveryZone {
  name: string;
  radiusMiles: number;
  fee: number;
  minimumOrder: number;
}

export interface POSSystem {
  provider: POSProvider;
  accountId: string;
  lastSyncAt?: string;
  syncStatus: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED';
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}
