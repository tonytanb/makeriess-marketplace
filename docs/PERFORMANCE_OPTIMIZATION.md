# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Makeriess marketplace and how to maintain optimal performance.

## Overview

The application is optimized to achieve:
- **Lighthouse Performance Score**: 90+ on mobile
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s
- **Total Bundle Size**: < 500KB (initial load)

## Implemented Optimizations

### 1. Code Splitting & Lazy Loading

**Route-based Code Splitting**
- Next.js automatically splits code by route
- Each page loads only the JavaScript it needs
- Reduces initial bundle size significantly

**Dynamic Imports**
```typescript
// Heavy components are loaded on-demand
const MapView = dynamic(() => import('@/components/customer/MapView'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
```

**Lazy-loaded Components**:
- Map components (Mapbox GL)
- Video player (Reels)
- Chart libraries (Analytics)
- Heavy UI components

### 2. Image Optimization

**Next.js Image Component**
- Automatic WebP conversion
- Responsive image sizes
- Lazy loading below the fold
- Blur placeholder during load

```typescript
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**Configuration** (next.config.js):
- Device sizes: 320w, 640w, 750w, 828w, 1080w, 1200w, 1920w
- Image formats: WebP (automatic)
- Cache TTL: 60 seconds

### 3. Bundle Optimization

**Tree Shaking**
- Removes unused code during build
- Configured in webpack optimization

**Minification**
- SWC minifier (faster than Terser)
- Removes console logs in production (except errors/warnings)

**Package Optimization**
```javascript
experimental: {
  optimizePackageImports: ['lucide-react', '@aws-amplify/ui-react'],
}
```

### 4. Loading States & Skeletons

**Route-level Loading**
- Each route has a `loading.tsx` file
- Shows skeleton UI while data loads
- Improves perceived performance

**Component-level Skeletons**
- ProductCardSkeleton
- VendorCardSkeleton
- OrderCardSkeleton
- ProductDetailSkeleton

### 5. Error Boundaries

**Global Error Boundary**
- Catches errors at app level
- Prevents white screen of death
- Provides user-friendly error messages

**Route-level Error Pages**
- Custom error UI per route
- Contextual error messages
- Recovery actions (retry, go back)

### 6. Performance Monitoring

**Web Vitals Tracking**
- Monitors Core Web Vitals (LCP, FID, CLS)
- Reports to CloudWatch in production
- Console logging in development

**Custom Metrics**
- Page load time
- Resource loading time
- Long task monitoring
- API response times

### 7. Caching Strategy

**Static Assets**
- CloudFront CDN with edge caching
- 1-year cache for immutable assets
- Versioned filenames for cache busting

**API Responses**
- React Query with stale-while-revalidate
- 5-minute cache for product searches
- 10-minute cache for product details

**Service Worker**
- Caches critical assets offline
- Precaches app shell
- Runtime caching for API responses

## Performance Testing

### Running Lighthouse Audits

```bash
# Build the app first
npm run build

# Start production server
npm start

# In another terminal, run Lighthouse
npm run lighthouse
```

This will:
1. Audit key pages (home, product, vendor, cart, etc.)
2. Generate HTML and JSON reports
3. Display performance scores
4. Save reports to `lighthouse-reports/` directory

### Bundle Size Analysis

```bash
# Analyze bundle composition
npm run analyze
```

This opens an interactive visualization showing:
- Bundle size by route
- Package sizes
- Duplicate dependencies
- Optimization opportunities

### Size Limits

```bash
# Check if bundle sizes are within limits
npm run size
```

Configured limits:
- Home page: 150 KB
- Product page: 100 KB
- Vendor page: 100 KB
- Total bundle: 500 KB

## Best Practices

### 1. Images

✅ **DO**:
- Use Next.js Image component
- Provide width and height
- Use appropriate image sizes
- Lazy load below-the-fold images

❌ **DON'T**:
- Use `<img>` tags directly
- Load full-resolution images
- Forget alt text
- Use unoptimized formats

### 2. JavaScript

✅ **DO**:
- Use dynamic imports for heavy components
- Implement code splitting
- Remove unused dependencies
- Use tree-shakeable libraries

❌ **DON'T**:
- Import entire libraries when you need one function
- Load all components upfront
- Include large polyfills unnecessarily
- Use blocking scripts

### 3. CSS

✅ **DO**:
- Use Tailwind's purge feature
- Inline critical CSS
- Use CSS modules for component styles
- Minimize custom CSS

❌ **DON'T**:
- Import entire CSS frameworks
- Use inline styles excessively
- Create unused CSS classes
- Forget to purge unused styles

### 4. Data Fetching

✅ **DO**:
- Use React Query for caching
- Implement pagination
- Prefetch on hover
- Use optimistic updates

❌ **DON'T**:
- Fetch all data at once
- Make redundant API calls
- Forget loading states
- Block rendering on data

### 5. Third-party Scripts

✅ **DO**:
- Load scripts asynchronously
- Use next/script with strategy
- Defer non-critical scripts
- Self-host when possible

❌ **DON'T**:
- Block rendering with scripts
- Load unnecessary analytics
- Use synchronous scripts
- Forget to optimize third-party code

## Monitoring in Production

### CloudWatch Metrics

Performance metrics are automatically sent to CloudWatch:
- Web Vitals (LCP, FID, CLS, TTFB)
- Custom metrics (page load, API latency)
- Error rates
- Resource timing

### Alerts

Set up CloudWatch alarms for:
- Performance score drops below 85
- LCP exceeds 3 seconds
- Error rate exceeds 5%
- Bundle size increases by 20%

### Regular Audits

Schedule regular performance audits:
- Weekly: Automated Lighthouse CI
- Monthly: Manual performance review
- Quarterly: Comprehensive optimization sprint

## Optimization Checklist

Before deploying:

- [ ] Run Lighthouse audit (score 90+)
- [ ] Check bundle size (within limits)
- [ ] Test on slow 3G network
- [ ] Verify images are optimized
- [ ] Check for console errors
- [ ] Test error boundaries
- [ ] Verify loading states
- [ ] Test offline functionality
- [ ] Check accessibility score
- [ ] Review Core Web Vitals

## Common Issues & Solutions

### Issue: Large Bundle Size

**Solution**:
1. Run `npm run analyze` to identify large packages
2. Use dynamic imports for heavy components
3. Check for duplicate dependencies
4. Consider lighter alternatives

### Issue: Slow LCP

**Solution**:
1. Optimize hero images
2. Preload critical resources
3. Reduce server response time
4. Use CDN for static assets

### Issue: High CLS

**Solution**:
1. Set explicit dimensions for images
2. Reserve space for dynamic content
3. Avoid inserting content above existing content
4. Use CSS aspect-ratio

### Issue: Long TTI

**Solution**:
1. Reduce JavaScript execution time
2. Code split large bundles
3. Defer non-critical JavaScript
4. Optimize third-party scripts

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)

## Support

For performance issues or questions:
1. Check this documentation
2. Review Lighthouse reports
3. Analyze bundle composition
4. Contact the development team
