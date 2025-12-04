# Image Optimization Guide

This document describes the image optimization implementation for the Makeriess marketplace platform.

## Overview

The platform uses Next.js Image component with comprehensive optimization strategies to ensure fast page loads, minimal bandwidth usage, and excellent user experience across all devices.

## Key Features

### 1. Automatic WebP Conversion
- All images are automatically converted to WebP format
- WebP provides 25-35% better compression than JPEG
- Fallback to original format for browsers that don't support WebP
- Configured in `next.config.js`

### 2. Responsive Image Sizes
Images are generated in multiple sizes to match device viewports:
- **Device sizes**: 320w, 640w, 750w, 828w, 1080w, 1200w, 1920w, 2048w, 3840w
- **Image sizes**: 16px, 32px, 48px, 64px, 96px, 128px, 256px, 384px

### 3. Lazy Loading
- Images below the fold are lazy-loaded by default
- First 4 products in grid are loaded eagerly for better perceived performance
- Hero images and critical content use `priority` flag

### 4. Blur Placeholders
- Low-quality image placeholders (LQIP) shown during load
- Smooth blur-to-sharp transition
- Reduces layout shift and improves perceived performance

### 5. Optimized Quality Settings
Different quality levels based on image type:
- **Product detail images**: 90% quality
- **Product cards**: 85% quality
- **Thumbnails**: 75-80% quality
- **Vendor logos**: 90% quality (higher quality for brand representation)

## Configuration

### Next.js Config (`next.config.js`)

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
};
```

### Image Sizes Utility

Predefined responsive sizes for different use cases:

```typescript
import { imageSizes } from '@/lib/utils/image-optimization';

// Product cards in grid
sizes={imageSizes.productCard}
// "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

// Product detail page
sizes={imageSizes.productDetail}
// "(max-width: 1024px) 100vw, 50vw"

// Vendor logos
sizes={imageSizes.vendorLogo}
// "96px"
```

## Usage Examples

### Product Card with Lazy Loading

```tsx
import Image from 'next/image';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

<Image
  src={product.image}
  alt={product.name}
  fill
  className="object-cover"
  sizes={imageSizes.productCard}
  loading={index < 4 ? 'eager' : 'lazy'}
  priority={index < 4}
  placeholder="blur"
  blurDataURL={generateBlurDataURL()}
  quality={85}
/>
```

### Hero Image with Priority Loading

```tsx
<Image
  src={heroImage}
  alt="Hero"
  fill
  className="object-cover"
  sizes="100vw"
  priority
  placeholder="blur"
  blurDataURL={generateBlurDataURL()}
  quality={90}
/>
```

### Thumbnail with Lazy Loading

```tsx
<Image
  src={thumbnail}
  alt="Thumbnail"
  width={80}
  height={80}
  className="object-cover"
  loading="lazy"
  placeholder="blur"
  blurDataURL={generateBlurDataURL()}
  quality={75}
/>
```

### Vendor Logo (Fixed Size)

```tsx
<Image
  src={vendor.logo}
  alt={vendor.name}
  fill
  className="object-cover"
  sizes={imageSizes.vendorLogo}
  loading="lazy"
  placeholder="blur"
  blurDataURL={generateBlurDataURL()}
  quality={90}
/>
```

## Components

### OptimizedImage Component

A wrapper component with automatic error handling and loading states:

```tsx
import { OptimizedImage } from '@/components/shared/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Product"
  fill
  fallbackSrc="/placeholder-product.jpg"
  showLoadingSpinner
  className="object-cover"
/>
```

Features:
- Automatic blur placeholder
- Error handling with fallback image
- Loading spinner (optional)
- Smooth transitions

## Loading Strategies

### Priority Loading (Above the Fold)
- First 4 products in grid
- Hero images
- Product detail main image
- Uses `priority` flag and `loading="eager"`

### Lazy Loading (Below the Fold)
- Products 5+ in grid
- Thumbnails
- Vendor logos in lists
- Uses `loading="lazy"`

### Implementation in ProductGrid

```tsx
{products.map((product, index) => (
  <ProductCard 
    key={product.id} 
    product={product} 
    index={index}
    priority={index < 4}
  />
))}
```

## Performance Metrics

### Target Metrics
- **Lighthouse Performance Score**: 90+
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Results
- **WebP Conversion**: 25-35% smaller file sizes
- **Responsive Images**: Serve appropriate size for device
- **Lazy Loading**: Reduce initial page load by 40-60%
- **Blur Placeholders**: Eliminate layout shift

## Best Practices

### 1. Always Use Next.js Image Component
```tsx
// ✅ Good
import Image from 'next/image';
<Image src={url} alt="..." fill />

// ❌ Bad
<img src={url} alt="..." />
```

### 2. Provide Appropriate Sizes
```tsx
// ✅ Good - Responsive sizes
<Image sizes="(max-width: 768px) 100vw, 50vw" />

// ❌ Bad - No sizes specified for fill images
<Image fill />
```

### 3. Use Priority for Above-the-Fold Images
```tsx
// ✅ Good - Hero image
<Image priority />

// ❌ Bad - All images with priority
<Image priority /> // everywhere
```

### 4. Add Alt Text for Accessibility
```tsx
// ✅ Good
<Image alt="Fresh croissants from Baker's Delight" />

// ❌ Bad
<Image alt="" />
```

### 5. Use Appropriate Quality Settings
```tsx
// ✅ Good - Different quality for different uses
<Image quality={90} /> // Product detail
<Image quality={85} /> // Product cards
<Image quality={75} /> // Thumbnails

// ❌ Bad - Always max quality
<Image quality={100} />
```

## Troubleshooting

### Images Not Loading
1. Check remote patterns in `next.config.js`
2. Verify image URL is accessible
3. Check browser console for errors

### Slow Image Loading
1. Verify images are using WebP format
2. Check if appropriate sizes are specified
3. Ensure lazy loading is enabled for below-fold images

### Layout Shift Issues
1. Always specify `fill` or `width`/`height`
2. Use blur placeholders
3. Reserve space with aspect-ratio CSS

### Blur Placeholder Not Showing
1. Ensure `placeholder="blur"` is set
2. Verify `blurDataURL` is provided
3. Check that image is not SVG (blur not supported for SVG)

## File Structure

```
src/
├── lib/
│   └── utils/
│       └── image-optimization.ts    # Utilities and helpers
├── components/
│   └── shared/
│       └── OptimizedImage.tsx       # Wrapper component
└── public/
    ├── placeholder-product.jpg      # Product fallback
    └── placeholder-vendor.jpg       # Vendor fallback
```

## CDN and Caching

### CloudFront Configuration
- Images served through CloudFront CDN
- Edge caching for global distribution
- Automatic compression
- Cache TTL: 1 year for static assets

### Browser Caching
- Immutable cache headers for optimized images
- Service worker caching for offline support
- IndexedDB for critical images

## Monitoring

### Metrics to Track
1. **Image Load Time**: Average time to load images
2. **WebP Adoption**: Percentage of WebP vs original format
3. **Cache Hit Rate**: CDN cache effectiveness
4. **Bandwidth Usage**: Total image bandwidth per user

### Tools
- Lighthouse CI for automated testing
- Chrome DevTools Network tab
- CloudWatch for CDN metrics
- Real User Monitoring (RUM)

## Future Enhancements

### Planned Improvements
1. **AVIF Support**: Next-gen format with better compression
2. **Adaptive Quality**: Adjust quality based on network speed
3. **Smart Cropping**: AI-powered focal point detection
4. **Progressive Loading**: Load images in multiple passes
5. **Image CDN**: Dedicated image optimization service

### Experimental Features
- Client hints for optimal image selection
- HTTP/3 for faster image delivery
- Edge computing for dynamic image optimization

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [WebP Format](https://developers.google.com/speed/webp)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

## Support

For issues or questions about image optimization:
1. Check this documentation
2. Review Next.js Image documentation
3. Check browser console for errors
4. Contact the development team
