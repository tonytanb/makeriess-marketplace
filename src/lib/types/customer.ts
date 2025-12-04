// Customer-facing types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
  instructions?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Product {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number; // Original price before promotion
  images: string[];
  category: string;
  dietaryTags?: string[];
  isVisible: boolean;
  isAvailable: boolean;
  inventory?: number;
  posProductId?: string; // POS system product ID
  badges?: string[];
  trendScore?: number;
  viewCount: number;
  favoriteCount: number;
  orderCount: number;
  rating?: number;
  reviewCount: number;
  distance?: number; // Calculated distance from user
  updatedAt?: string; // Last updated timestamp
  createdAt?: string; // Created timestamp
}

export interface Vendor {
  id: string;
  email: string;
  businessName: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  address: Address;
  location: Location;
  categories: string[];
  operatingHours?: OperatingHours[];
  deliveryZones?: DeliveryZone[];
  minimumOrder: number;
  isPaused: boolean;
  rating?: number;
  reviewCount: number;
  distance?: number; // Calculated distance from user
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

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export type DeliveryMode = 'DELIVERY' | 'PICKUP';

export type ProductSortOption = 'DISTANCE' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'POPULARITY' | 'RATING';

export interface SearchFilters {
  query?: string;
  category?: string;
  dietaryTags?: string[];
  sortBy?: ProductSortOption;
}

export interface Review {
  id: string;
  customerId: string;
  customerName?: string;
  productId: string;
  vendorId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
  vendorResponse?: string;
  vendorResponseDate?: string;
  createdAt: string;
}
