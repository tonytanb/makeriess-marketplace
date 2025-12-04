// Cache Manager for Products and Vendors

import { cacheUrls } from './service-worker-registration';

interface CacheableProduct {
  id: string;
  name: string;
  images: string[];
  vendorId: string;
}

interface CacheableVendor {
  id: string;
  businessName: string;
  logo?: string;
  coverImage?: string;
}

// Cache product data for offline access
export function cacheProduct(product: CacheableProduct) {
  if (typeof window === 'undefined') {
    return;
  }

  const urlsToCache: string[] = [
    `/product/${product.id}`,
    ...product.images.filter(Boolean),
  ];

  cacheUrls(urlsToCache);
  
  // Store product data in localStorage for offline access
  try {
    const cachedProducts = getCachedProducts();
    cachedProducts[product.id] = {
      ...product,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem('cached-products', JSON.stringify(cachedProducts));
  } catch (error) {
    console.error('Failed to cache product data:', error);
  }
}

// Cache vendor data for offline access
export function cacheVendor(vendor: CacheableVendor) {
  if (typeof window === 'undefined') {
    return;
  }

  const urlsToCache: string[] = [
    `/vendor/${vendor.id}`,
    vendor.logo,
    vendor.coverImage,
  ].filter(Boolean) as string[];

  cacheUrls(urlsToCache);
  
  // Store vendor data in localStorage for offline access
  try {
    const cachedVendors = getCachedVendors();
    cachedVendors[vendor.id] = {
      ...vendor,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem('cached-vendors', JSON.stringify(cachedVendors));
  } catch (error) {
    console.error('Failed to cache vendor data:', error);
  }
}

// Get cached products
export function getCachedProducts(): Record<string, CacheableProduct & { cachedAt: number }> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const cached = localStorage.getItem('cached-products');
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Failed to get cached products:', error);
    return {};
  }
}

// Get cached vendors
export function getCachedVendors(): Record<string, CacheableVendor & { cachedAt: number }> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const cached = localStorage.getItem('cached-vendors');
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Failed to get cached vendors:', error);
    return {};
  }
}

// Get single cached product
export function getCachedProduct(productId: string): (CacheableProduct & { cachedAt: number }) | null {
  const products = getCachedProducts();
  return products[productId] || null;
}

// Get single cached vendor
export function getCachedVendor(vendorId: string): (CacheableVendor & { cachedAt: number }) | null {
  const vendors = getCachedVendors();
  return vendors[vendorId] || null;
}

// Clear old cached data (older than 7 days)
export function clearOldCache() {
  if (typeof window === 'undefined') {
    return;
  }

  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();

  try {
    // Clear old products
    const products = getCachedProducts();
    const freshProducts: Record<string, CacheableProduct & { cachedAt: number }> = {};
    
    Object.entries(products).forEach(([id, data]: [string, CacheableProduct & { cachedAt: number }]) => {
      if (now - data.cachedAt < MAX_AGE) {
        freshProducts[id] = data;
      }
    });
    
    localStorage.setItem('cached-products', JSON.stringify(freshProducts));

    // Clear old vendors
    const vendors = getCachedVendors();
    const freshVendors: Record<string, CacheableVendor & { cachedAt: number }> = {};
    
    Object.entries(vendors).forEach(([id, data]: [string, CacheableVendor & { cachedAt: number }]) => {
      if (now - data.cachedAt < MAX_AGE) {
        freshVendors[id] = data;
      }
    });
    
    localStorage.setItem('cached-vendors', JSON.stringify(freshVendors));

    console.log('Old cache cleared');
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
}

// Auto-cache products when viewed
export function setupAutoCaching() {
  if (typeof window === 'undefined') {
    return;
  }

  // Clear old cache on startup
  clearOldCache();

  // Setup periodic cleanup (once per day)
  setInterval(clearOldCache, 24 * 60 * 60 * 1000);
}
