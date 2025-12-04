# Demo Mode - MVP Testing Guide

## Overview

Demo Mode allows you to test the complete Makeriess marketplace MVP without deploying the AWS backend. It uses realistic mock data to simulate the full user experience.

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Demo

Open your browser and visit:
- **Demo Homepage**: http://localhost:3000/demo
- **Main App**: http://localhost:3000

Demo mode is **enabled by default** on first load!

### 3. Toggle Between Modes

Look for the floating toggle in the bottom-right corner:
- **Purple Badge** = Demo Mode (mock data)
- **Blue Badge** = Live Mode (requires AWS backend)

## What's Included in Demo Mode

### Mock Data
- ✅ **5 Products** - Various categories with images, prices, ratings
- ✅ **3 Vendors** - Complete profiles with locations
- ✅ **3 Orders** - Different statuses (delivered, in transit, processing)
- ✅ **1 User** - Demo account with addresses and favorites
- ✅ **3 Reviews** - Product reviews with ratings
- ✅ **2 Promotions** - Active discounts and offers

### Working Features
- ✅ Product browsing and search
- ✅ Vendor profiles and maps
- ✅ Shopping cart (localStorage)
- ✅ Order history
- ✅ Favorites management
- ✅ User profile
- ✅ Reviews and ratings
- ✅ Promotions
- ✅ All UI components
- ✅ Performance optimizations
- ✅ PWA features
- ✅ Loading skeletons
- ✅ Error boundaries

### Not Working (Requires Backend)
- ❌ Real authentication (Cognito)
- ❌ Payment processing (Stripe)
- ❌ Real-time updates
- ❌ Push notifications
- ❌ POS integrations
- ❌ Analytics tracking

## Testing Scenarios

### 1. Browse Products

```
Visit: http://localhost:3000
- See trending products
- Search for "cookies"
- Filter by category
- Sort by price/rating
```

### 2. View Product Details

```
Click any product
- See full description
- View multiple images
- Read reviews
- Add to cart
```

### 3. Explore Vendors

```
Visit: http://localhost:3000/map
- See vendors on map
- Click vendor markers
- View vendor profiles
- Browse vendor products
```

### 4. Manage Cart

```
Add items to cart
- Update quantities
- Remove items
- See total price
- Proceed to checkout
```

### 5. View Orders

```
Visit: http://localhost:3000/orders
- See order history
- Track order status
- View order details
```

### 6. Manage Favorites

```
Visit: http://localhost:3000/favorites
- See saved products
- Remove favorites
- Quick add to cart
```

## Demo Mode API

The mock API simulates real backend behavior:

```typescript
import { mockAPI, isDemoMode, enableDemoMode } from '@/lib/mock/api';

// Check if demo mode is active
if (isDemoMode()) {
  // Use mock data
  const products = await mockAPI.searchProducts({ query: 'cookies' });
}

// Enable demo mode programmatically
enableDemoMode();
```

## Mock Data Structure

### Products
```typescript
{
  id: 'product-1',
  vendorId: 'vendor-1',
  name: 'Chocolate Chip Cookies',
  price: 12.99,
  images: ['url'],
  rating: 4.9,
  inStock: true,
  trending: true,
}
```

### Vendors
```typescript
{
  id: 'vendor-1',
  name: 'Sweet Treats Bakery',
  location: { latitude, longitude, address },
  rating: 4.8,
  isOpen: true,
}
```

### Orders
```typescript
{
  id: 'order-1',
  status: 'delivered',
  items: [...],
  total: 58.98,
  createdAt: '2025-11-20T10:30:00Z',
}
```

## Customizing Mock Data

Edit the mock data files:

```bash
src/lib/mock/data.ts      # Add/modify mock data
src/lib/mock/api.ts        # Customize API behavior
```

Example - Add a new product:

```typescript
// src/lib/mock/data.ts
export const mockProducts = [
  // ... existing products
  {
    id: 'product-6',
    vendorId: 'vendor-1',
    name: 'Your New Product',
    price: 19.99,
    // ... other fields
  },
];
```

## Performance Testing

Demo mode includes all performance optimizations:

### Run Lighthouse Audit

```bash
# Build production version
npm run build
npm start

# In another terminal
npm run lighthouse
```

### Check Bundle Size

```bash
npm run analyze
```

### Monitor Performance

Open DevTools Console to see:
- Web Vitals metrics (LCP, FID, CLS)
- Page load times
- Resource loading

## Switching to Live Mode

When ready to use the real backend:

### 1. Deploy Backend

```bash
npm run amplify:sandbox  # For testing
# or
npm run amplify:deploy   # For production
```

### 2. Switch Mode

Click the toggle in bottom-right corner and select "Switch to Live Mode"

### 3. Configure

The app will automatically use AWS Amplify configuration when available.

## Troubleshooting

### Demo Mode Not Working

1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Refresh the page
4. Re-enable demo mode from toggle

### Mock Data Not Showing

1. Verify demo mode is enabled: `localStorage.getItem('demoMode')`
2. Check that mock data files exist in `src/lib/mock/`
3. Look for console errors

### Toggle Not Visible

The toggle auto-hides after dismissing. Refresh the page to see it again.

## Demo Mode vs Live Mode

| Feature | Demo Mode | Live Mode |
|---------|-----------|-----------|
| Data Source | Mock data (local) | AWS Backend |
| Authentication | Bypassed | Cognito |
| Payments | Simulated | Stripe |
| Database | localStorage | DynamoDB |
| Real-time | No | Yes |
| Cost | Free | AWS charges |
| Setup Time | Instant | 10-15 min |

## Best Practices

### For Development
- ✅ Use demo mode for UI/UX testing
- ✅ Test all user flows with mock data
- ✅ Verify performance optimizations
- ✅ Check responsive design

### For Demos
- ✅ Start with demo homepage (/demo)
- ✅ Show key features with mock data
- ✅ Explain demo vs live mode
- ✅ Highlight performance metrics

### For Testing
- ✅ Test edge cases with custom mock data
- ✅ Verify error handling
- ✅ Check loading states
- ✅ Test offline functionality (PWA)

## Next Steps

1. **Test the MVP** - Explore all features in demo mode
2. **Customize Data** - Add your own mock products/vendors
3. **Deploy Backend** - When ready for production
4. **Switch to Live** - Connect to real AWS services

## Support

For issues or questions:
1. Check this documentation
2. Review mock data in `src/lib/mock/`
3. Check browser console for errors
4. Verify demo mode is enabled

---

**Happy Testing! 🚀**

The demo mode provides a complete MVP experience without any backend setup. Perfect for testing, demos, and development!
