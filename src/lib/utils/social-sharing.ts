/**
 * Social Sharing Utilities
 * 
 * Provides functions for sharing products and vendors via Web Share API
 * and generating shareable URLs with Open Graph metadata.
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ProductShareData {
  id: string;
  name: string;
  price: number;
  vendorName: string;
  imageUrl?: string;
  description?: string;
}

export interface VendorShareData {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  rating?: number;
}

/**
 * Check if Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Generate shareable URL for a product with referral tracking
 */
export function generateProductShareUrl(
  productId: string,
  referrerId?: string
): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://makeriess.com';
  
  const url = new URL(`/product/${productId}`, baseUrl);
  
  if (referrerId) {
    url.searchParams.set('ref', referrerId);
  }
  
  return url.toString();
}

/**
 * Generate shareable URL for a vendor with referral tracking
 */
export function generateVendorShareUrl(
  vendorId: string,
  referrerId?: string
): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://makeriess.com';
  
  const url = new URL(`/vendor/${vendorId}`, baseUrl);
  
  if (referrerId) {
    url.searchParams.set('ref', referrerId);
  }
  
  return url.toString();
}

/**
 * Share a product using Web Share API or fallback to clipboard
 */
export async function shareProduct(
  product: ProductShareData,
  referrerId?: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }> {
  const url = generateProductShareUrl(product.id, referrerId);
  const shareData: ShareData = {
    title: `${product.name} - ${product.vendorName}`,
    text: `Check out ${product.name} from ${product.vendorName} for $${product.price.toFixed(2)} on Makeriess!`,
    url,
  };

  // Try Web Share API first (mobile devices)
  if (isWebShareSupported()) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'none' };
      }
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, method: 'none' };
  }
}

/**
 * Share a vendor using Web Share API or fallback to clipboard
 */
export async function shareVendor(
  vendor: VendorShareData,
  referrerId?: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }> {
  const url = generateVendorShareUrl(vendor.id, referrerId);
  const ratingText = vendor.rating ? ` (${vendor.rating.toFixed(1)} ⭐)` : '';
  const shareData: ShareData = {
    title: `${vendor.businessName} on Makeriess`,
    text: `Check out ${vendor.businessName}${ratingText} on Makeriess! ${vendor.description || 'Discover amazing local products.'}`,
    url,
  };

  // Try Web Share API first (mobile devices)
  if (isWebShareSupported()) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'none' };
      }
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, method: 'none' };
  }
}

/**
 * Extract referrer ID from URL query parameters
 */
export function getReferrerFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

/**
 * Track share event for analytics
 */
export function trackShareEvent(
  type: 'product' | 'vendor',
  id: string,
  method: 'native' | 'clipboard' | 'none'
): void {
  // This would integrate with your analytics service
  // For now, we'll just log it
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      content_type: type,
      content_id: id,
      method: method,
    });
  }
  
  console.log('Share event:', { type, id, method });
}

/**
 * Generate Open Graph metadata for a product
 */
export function generateProductMetadata(product: ProductShareData) {
  return {
    title: `${product.name} - ${product.vendorName} | Makeriess`,
    description: product.description || `${product.name} from ${product.vendorName} for $${product.price.toFixed(2)}`,
    openGraph: {
      title: `${product.name} - ${product.vendorName}`,
      description: product.description || `Get ${product.name} from ${product.vendorName} for $${product.price.toFixed(2)} on Makeriess`,
      images: product.imageUrl ? [
        {
          url: product.imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ] : [],
      type: 'product',
      siteName: 'Makeriess',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${product.vendorName}`,
      description: product.description || `Get ${product.name} from ${product.vendorName} for $${product.price.toFixed(2)}`,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

/**
 * Generate Open Graph metadata for a vendor
 */
export function generateVendorMetadata(vendor: VendorShareData) {
  const ratingText = vendor.rating ? ` - ${vendor.rating.toFixed(1)} ⭐` : '';
  
  return {
    title: `${vendor.businessName}${ratingText} | Makeriess`,
    description: vendor.description || `Discover amazing products from ${vendor.businessName} on Makeriess`,
    openGraph: {
      title: `${vendor.businessName}${ratingText}`,
      description: vendor.description || `Discover amazing products from ${vendor.businessName} on Makeriess`,
      images: vendor.logoUrl ? [
        {
          url: vendor.logoUrl,
          width: 1200,
          height: 630,
          alt: vendor.businessName,
        }
      ] : [],
      type: 'website',
      siteName: 'Makeriess',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vendor.businessName}${ratingText}`,
      description: vendor.description || `Discover amazing products from ${vendor.businessName}`,
      images: vendor.logoUrl ? [vendor.logoUrl] : [],
    },
  };
}
