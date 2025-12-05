/**
 * Type conversion utilities between mock types and real application types
 * This allows us to maintain type safety while using simplified mock data
 */

import type {
  MockProduct,
  MockVendor
} from './types';

// These would be your real types from Amplify/GraphQL
// For now, we'll create interfaces that match what the app expects

export interface RealProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  inventory: number;
  tags: string[];
  // Additional fields that real products have
  isVisible: boolean;
  isAvailable: boolean;
  viewCount: number;
  favoriteCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RealVendor {
  id: string;
  email: string;
  businessName: string;
  phone: string;
  description: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  operatingHours: Record<string, { open: string; close: string; isOpen: boolean }>;
  // Additional fields that real vendors have
  address: string;
  categories: string[];
  minimumOrder: number;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}

// Conversion functions
export function mockProductToReal(mockProduct: MockProduct): RealProduct {
  return {
    ...mockProduct,
    // Add missing required fields with sensible defaults
    isVisible: true,
    isAvailable: mockProduct.inStock,
    viewCount: Math.floor(Math.random() * 1000),
    favoriteCount: Math.floor(Math.random() * 100),
    orderCount: Math.floor(Math.random() * 50),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function mockVendorToReal(mockVendor: MockVendor): RealVendor {
  return {
    id: mockVendor.id,
    email: `contact@${mockVendor.name.toLowerCase().replace(/\s+/g, '')}.com`,
    businessName: mockVendor.name,
    phone: mockVendor.phone,
    description: mockVendor.description,
    logo: mockVendor.logo,
    coverImage: mockVendor.coverImage,
    rating: mockVendor.rating,
    reviewCount: mockVendor.reviewCount,
    location: mockVendor.location,
    operatingHours: mockVendor.operatingHours,
    // Add missing required fields
    address: mockVendor.location.address,
    categories: mockVendor.categories || [mockVendor.category],
    minimumOrder: mockVendor.minimumOrder || 0,
    isPaused: mockVendor.isPaused || false,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Batch conversion functions
export function mockProductsToReal(mockProducts: MockProduct[]): RealProduct[] {
  return mockProducts.map(mockProductToReal);
}

export function mockVendorsToReal(mockVendors: MockVendor[]): RealVendor[] {
  return mockVendors.map(mockVendorToReal);
}

// Type guards to check if we're dealing with mock or real data
export function isMockProduct(product: unknown): product is MockProduct {
  return typeof product === 'object' && 
         product !== null && 
         'id' in product && 
         'name' in product && 
         'price' in product &&
         !('isVisible' in product); // Mock products don't have this field
}

export function isRealProduct(product: unknown): product is RealProduct {
  return typeof product === 'object' && 
         product !== null && 
         'id' in product && 
         'name' in product && 
         'price' in product &&
         'isVisible' in product; // Real products have this field
}

export function isMockVendor(vendor: unknown): vendor is MockVendor {
  return typeof vendor === 'object' && 
         vendor !== null && 
         'id' in vendor && 
         'name' in vendor &&
         !('businessName' in vendor); // Mock vendors use 'name', real vendors use 'businessName'
}

export function isRealVendor(vendor: unknown): vendor is RealVendor {
  return typeof vendor === 'object' && 
         vendor !== null && 
         'id' in vendor && 
         'businessName' in vendor; // Real vendors have businessName
}

// Utility to automatically convert mock data to real data when needed
export function ensureRealProduct(product: MockProduct | RealProduct): RealProduct {
  if (isRealProduct(product)) {
    return product;
  }
  return mockProductToReal(product as MockProduct);
}

export function ensureRealVendor(vendor: MockVendor | RealVendor): RealVendor {
  if (isRealVendor(vendor)) {
    return vendor;
  }
  return mockVendorToReal(vendor as MockVendor);
}
