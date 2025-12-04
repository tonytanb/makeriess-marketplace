/**
 * Image Optimization Utilities
 * 
 * Provides utilities for optimized image loading with Next.js Image component
 */

/**
 * Generate a blur data URL for image placeholders
 * This creates a tiny base64-encoded image for blur-up effect
 */
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  // Create a simple gray gradient as placeholder
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  
  if (!canvas) {
    // Server-side fallback - return a simple gray base64 image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Get responsive image sizes based on component usage
 */
export const imageSizes = {
  // Product cards in grid
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  
  // Product detail page main image
  productDetail: '(max-width: 1024px) 100vw, 50vw',
  
  // Vendor cards
  vendorCard: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  
  // Vendor logos (circular)
  vendorLogo: '96px',
  vendorLogoSmall: '64px',
  vendorLogoTiny: '48px',
  
  // Thumbnails
  thumbnail: '80px',
  
  // Full width images
  fullWidth: '100vw',
  
  // Map mini cards
  miniCard: '320px',
  
  // Order item images
  orderItem: '80px',
} as const;

/**
 * Get optimized image props for Next.js Image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  className?: string;
}

/**
 * Generate optimized image props with defaults
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const {
    fill = false,
    width,
    height,
    sizes = imageSizes.productCard,
    priority = false,
    loading = 'lazy',
    placeholder = 'blur',
    quality = 85,
    className = 'object-cover',
  } = options;

  const props: OptimizedImageProps = {
    src,
    alt,
    className,
    quality,
    loading: priority ? 'eager' : loading,
  };

  // Add fill or width/height
  if (fill) {
    props.fill = true;
    props.sizes = sizes;
  } else if (width && height) {
    props.width = width;
    props.height = height;
  }

  // Add priority for above-the-fold images
  if (priority) {
    props.priority = true;
  }

  // Add blur placeholder
  if (placeholder === 'blur' && !src.endsWith('.svg')) {
    props.placeholder = 'blur';
    props.blurDataURL = generateBlurDataURL();
  }

  return props;
}

/**
 * Check if image should be lazy loaded based on position
 */
export function shouldLazyLoad(index: number, threshold: number = 4): boolean {
  // Load first few images eagerly (above the fold)
  return index >= threshold;
}

/**
 * Get placeholder image URL based on type
 */
export function getPlaceholderImage(type: 'product' | 'vendor' | 'user'): string {
  const placeholders = {
    product: '/placeholder-product.jpg',
    vendor: '/placeholder-vendor.jpg',
    user: '/placeholder-user.jpg',
  };
  
  return placeholders[type] || placeholders.product;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Image loading priorities for different sections
 */
export const imageLoadingPriority = {
  // Hero/banner images - load immediately
  hero: { priority: true, loading: 'eager' as const },
  
  // First product in grid - load immediately
  firstProduct: { priority: true, loading: 'eager' as const },
  
  // Products 2-4 - load eagerly but not priority
  earlyProducts: { priority: false, loading: 'eager' as const },
  
  // Products 5+ - lazy load
  laterProducts: { priority: false, loading: 'lazy' as const },
  
  // Thumbnails - always lazy
  thumbnail: { priority: false, loading: 'lazy' as const },
} as const;

/**
 * Get loading strategy based on image position
 */
export function getLoadingStrategy(index: number) {
  if (index === 0) return imageLoadingPriority.firstProduct;
  if (index < 4) return imageLoadingPriority.earlyProducts;
  return imageLoadingPriority.laterProducts;
}
