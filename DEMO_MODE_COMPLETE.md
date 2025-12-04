# Demo Mode - Complete Implementation

This document provides an overview of the complete demo mode implementation for the Makeriess marketplace.

## Overview

Demo mode allows you to test the entire Makeriess marketplace without requiring a backend, database, or external services. All API calls are intercepted and served with realistic mock data.

## What's Included

### 📚 Documentation
- **[DEMO_MODE_ENDPOINTS.md](docs/DEMO_MODE_ENDPOINTS.md)** - Complete API reference with all 30+ endpoints
- **[TOAST_POS_DEMO_DATA.md](docs/TOAST_POS_DEMO_DATA.md)** - Toast POS integration demo data and credentials
- **[DEMO_MODE_TESTING_GUIDE.md](docs/DEMO_MODE_TESTING_GUIDE.md)** - Step-by-step testing scenarios

### 🎭 Mock Data
Located in `src/lib/mock/data.ts`:
- **3 Vendors** (2 with POS connections)
- **5 Products** across multiple categories
- **3 Orders** in different states
- **1 Demo User** with addresses and favorites
- **3 Product Reviews**
- **2 Active Promotions**
- **4 POS Sync Logs**
- **Vendor Analytics** with revenue data
- **2 Social Reels**
- **2 Notifications**

### 🔌 Mock API
Located in `src/lib/mock/api.ts`:
- **30+ Endpoints** covering all features
- **Realistic Network Delays** (200ms - 2000ms)
- **localStorage Persistence** for cart
- **Error Handling** for invalid requests

## Quick Start

### Enable Demo Mode

**Option 1: Via URL**
```
https://your-app.com/?demo=true
```

**Option 2: Via Demo Page**
```
Navigate to /demo
```

**Option 3: Programmatically**
```typescript
import { enableDemoMode } from '@/lib/mock/api';
enableDemoMode();
```

### Verify Demo Mode

```typescript
import { isDemoMode } from '@/lib/mock/api';

if (isDemoMode()) {
  console.log('Demo mode is active!');
}
```

## Key Features

### 1. Complete Customer Experience
- Product browsing and search
- Shopping cart with persistence
- Order creation and tracking
- Favorites management
- Product reviews
- Promotions and discounts

### 2. Vendor Management
- Dashboard with metrics
- Order management
- Product management
- Analytics and reporting
- Profile settings

### 3. POS Integrations
- **Toast POS** (vendor-1: Sweet Treats Bakery)
  - Account ID: `toast_demo_restaurant_001`
  - Restaurant GUID: `demo-guid-123`
  - 24 products synced
  - Full sync history
  
- **Square POS** (vendor-3: Farm Fresh Produce)
  - Account ID: `sq0idp-demo-merchant-001`
  - 45 products synced
  - Active connection

### 4. Social Features
- Video reels/stories
- View tracking
- Like and share interactions
- Product tagging

### 5. Analytics
- Revenue tracking
- Order metrics
- Top products
- Daily trends

## Demo Credentials

### Toast POS Setup
```
Client ID: toast_demo_client_abc123
Client Secret: toast_demo_secret_xyz789
Restaurant GUID: demo-guid-123
```

### Demo User
```
Email: demo@makeriess.com
Name: Demo User
Phone: (614) 555-0100
```

## Testing Scenarios

### Scenario 1: Customer Shopping
1. Browse products on homepage
2. Search for "cookies"
3. View product details
4. Add to cart
5. Proceed to checkout
6. Create order
7. Track order status

**Pages**: `/`, `/product/[id]`, `/cart`, `/checkout`, `/orders/[id]`

### Scenario 2: Vendor with Toast POS
1. View vendor dashboard
2. Check POS connection status
3. Review sync logs
4. Trigger manual sync
5. View analytics
6. Manage products

**Pages**: `/vendor/dashboard`, `/vendor/pos`, `/vendor/analytics`, `/vendor/products`

### Scenario 3: Social Discovery
1. Browse reels feed
2. Watch vendor stories
3. Like and share content
4. Navigate to vendor profile
5. View tagged products
6. Add to cart

**Pages**: `/reels`, `/vendor/[id]`, `/product/[id]`

## API Endpoints Summary

### Products (5 endpoints)
- Search products
- Get product details
- Get trending products
- Get vendor products
- Get product reviews

### Vendors (6 endpoints)
- Get nearby vendors
- Get vendor details
- Get vendor products
- Update vendor profile
- Toggle vendor status
- Get vendor dashboard

### Orders (3 endpoints)
- Get orders
- Get order details
- Create order

### Cart (4 endpoints)
- Get cart
- Add to cart
- Remove from cart
- Clear cart

### POS Integration (4 endpoints)
- Get POS connection
- Connect POS
- Disconnect POS
- Sync products
- Get sync logs

### Analytics (2 endpoints)
- Get vendor analytics
- Get vendor dashboard

### Social (3 endpoints)
- Get reels
- Track story view
- Interact with story

### Other (8 endpoints)
- User profile management
- Favorites management
- Reviews
- Promotions
- Notifications

## Data Persistence

| Data Type | Storage | Persists? |
|-----------|---------|-----------|
| Cart | localStorage | ✅ Yes |
| Demo Mode Flag | localStorage | ✅ Yes |
| Favorites | In-memory | ❌ No |
| Orders | In-memory | ❌ No |
| User Profile | In-memory | ❌ No |
| All Other Data | In-memory | ❌ No |

## Network Delays

Realistic delays simulate real-world conditions:

| Operation Type | Delay | Examples |
|----------------|-------|----------|
| Fast | 200-300ms | Cart, favorites, notifications |
| Standard | 500ms | Product search, vendor lookup |
| Slow | 800-1000ms | Profile updates, reviews |
| Very Slow | 1500-2000ms | POS connections, syncs |

## File Structure

```
src/lib/mock/
├── api.ts          # Mock API implementation (30+ endpoints)
└── data.ts         # Mock data (vendors, products, orders, etc.)

docs/
├── DEMO_MODE_ENDPOINTS.md       # Complete API reference
├── TOAST_POS_DEMO_DATA.md       # Toast POS demo data
└── DEMO_MODE_TESTING_GUIDE.md   # Testing scenarios

DEMO_MODE_COMPLETE.md            # This file
```

## Usage in Code

### Check Demo Mode
```typescript
import { isDemoMode, mockAPI } from '@/lib/mock/api';

if (isDemoMode()) {
  // Use mock API
  const products = await mockAPI.searchProducts({ query: 'cookies' });
} else {
  // Use real API
  const products = await realAPI.searchProducts({ query: 'cookies' });
}
```

### Enable/Disable Demo Mode
```typescript
import { enableDemoMode, disableDemoMode } from '@/lib/mock/api';

// Enable
enableDemoMode();

// Disable
disableDemoMode();
```

## Testing Checklist

### Customer Features
- [ ] Browse products
- [ ] Search products
- [ ] View product details
- [ ] Add to cart
- [ ] View cart
- [ ] Create order
- [ ] Track order
- [ ] Add favorites
- [ ] Write review
- [ ] View promotions

### Vendor Features
- [ ] View dashboard
- [ ] Manage orders
- [ ] Manage products
- [ ] View analytics
- [ ] Update profile
- [ ] Toggle status
- [ ] Connect POS
- [ ] Sync products
- [ ] View sync logs

### Social Features
- [ ] Browse reels
- [ ] Watch stories
- [ ] Like content
- [ ] Share content
- [ ] Navigate to vendor
- [ ] View tagged products

### POS Integration
- [ ] View Toast connection
- [ ] View Square connection
- [ ] Test Toast setup flow
- [ ] Trigger manual sync
- [ ] View sync history
- [ ] Check sync status

## Benefits

### For Development
- ✅ No backend required
- ✅ Fast iteration
- ✅ Consistent test data
- ✅ Offline development

### For Testing
- ✅ Predictable data
- ✅ All scenarios covered
- ✅ Easy to reproduce bugs
- ✅ Automated testing friendly

### For Demos
- ✅ Always available
- ✅ No setup required
- ✅ Realistic data
- ✅ Full feature coverage

## Next Steps

1. **Review Documentation**
   - Read [DEMO_MODE_ENDPOINTS.md](docs/DEMO_MODE_ENDPOINTS.md)
   - Review [TOAST_POS_DEMO_DATA.md](docs/TOAST_POS_DEMO_DATA.md)
   - Follow [DEMO_MODE_TESTING_GUIDE.md](docs/DEMO_MODE_TESTING_GUIDE.md)

2. **Test Features**
   - Enable demo mode
   - Test customer flow
   - Test vendor flow
   - Test POS integration

3. **Integrate with Real API**
   - Compare mock vs real endpoints
   - Ensure consistent interfaces
   - Add error handling
   - Test edge cases

4. **Automated Testing**
   - Write Playwright tests
   - Use mock data for CI/CD
   - Test all scenarios
   - Verify loading states

## Support

For questions or issues:
1. Check the documentation files
2. Review the mock data in `src/lib/mock/data.ts`
3. Review the API implementation in `src/lib/mock/api.ts`
4. Test with the scenarios in the testing guide

## Summary

Demo mode provides a complete, self-contained testing environment with:
- **30+ API endpoints**
- **3 vendors** (2 with POS integrations)
- **5 products** across categories
- **Full order lifecycle**
- **Social features**
- **Analytics data**
- **Realistic delays**
- **Comprehensive documentation**

Everything you need to test, demo, and develop the Makeriess marketplace without external dependencies.
