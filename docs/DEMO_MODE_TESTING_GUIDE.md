# Demo Mode Testing Guide

Quick guide for testing the Makeriess marketplace in demo mode.

## Quick Start

1. **Enable Demo Mode**
   - Visit `/demo` or add `?demo=true` to any URL
   - Or programmatically: `localStorage.setItem('demoMode', 'true')`

2. **Verify Demo Mode**
   - Look for "Demo Mode" indicator in the UI
   - Check console: `localStorage.getItem('demoMode')` should return `'true'`

---

## Test Scenarios

### 1. Customer Shopping Flow

**Goal**: Test the complete customer experience from discovery to checkout.

```typescript
// 1. Browse products
const products = await mockAPI.searchProducts({ category: 'Baked Goods' });
// Expected: 2 products from Sweet Treats Bakery

// 2. View product details
const product = await mockAPI.getProduct('product-1');
// Expected: Chocolate Chip Cookies with 4.9 rating

// 3. Add to cart
await mockAPI.addToCart({
  productId: 'product-1',
  name: 'Chocolate Chip Cookies (Dozen)',
  quantity: 2,
  price: 12.99
});

// 4. View cart
const cart = await mockAPI.getCart();
// Expected: 2 items, total $25.98

// 5. Create order
const order = await mockAPI.createOrder({
  items: cart.items,
  total: cart.total,
  deliveryAddress: mockUser.addresses[0]
});
// Expected: New order with 'processing' status

// 6. Track order
const orderDetails = await mockAPI.getOrder(order.id);
// Expected: Order details with status timeline
```

**UI Pages to Test**:
- `/` - Homepage with trending products
- `/product/product-1` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/orders` - Order history
- `/orders/[id]` - Order tracking

---

### 2. Vendor with Toast POS

**Goal**: Test vendor dashboard and Toast POS integration.

```typescript
// 1. Get vendor details
const vendor = await mockAPI.getVendor('vendor-1');
// Expected: Sweet Treats Bakery with Toast connection

// 2. Check POS connection
const posConnection = await mockAPI.getPOSConnection('vendor-1');
// Expected: Toast POS, account ID: toast_demo_restaurant_001

// 3. View sync logs
const syncLogs = await mockAPI.getSyncLogs('vendor-1');
// Expected: 3 sync logs (2 success, 1 partial)

// 4. Trigger manual sync
const syncResult = await mockAPI.syncPOSProducts('vendor-1');
// Expected: Random sync results (takes 2 seconds)

// 5. View analytics
const analytics = await mockAPI.getVendorAnalytics('vendor-1');
// Expected: $12,450.50 revenue, 156 orders

// 6. Get dashboard summary
const dashboard = await mockAPI.getVendorDashboard('vendor-1');
// Expected: Pending orders, today's revenue, product count
```

**UI Pages to Test**:
- `/vendor/pos` - POS connections page
- `/vendor/pos/toast-setup` - Toast setup form
- `/vendor/analytics` - Analytics dashboard
- `/vendor/dashboard` - Vendor dashboard
- `/vendor/products` - Product management

**Demo Credentials for Toast**:
```
Client ID: toast_demo_client_abc123
Client Secret: toast_demo_secret_xyz789
Restaurant GUID: demo-guid-123
```

---

### 3. Social Discovery (Reels)

**Goal**: Test social content discovery and engagement.

```typescript
// 1. Get reels feed
const reels = await mockAPI.getReels({ limit: 10 });
// Expected: 2 reels (bakery and pottery)

// 2. Track view
await mockAPI.trackStoryView('reel-1');
// Expected: Success

// 3. Like reel
await mockAPI.interactWithStory('reel-1', 'like');
// Expected: Success

// 4. View vendor from reel
const vendor = await mockAPI.getVendor('vendor-1');
// Expected: Sweet Treats Bakery details

// 5. View products from reel
const products = await mockAPI.getVendorProducts('vendor-1');
// Expected: 2 products including cookies
```

**UI Pages to Test**:
- `/reels` - Reels feed
- `/vendor/[id]` - Vendor profile from reel
- `/product/[id]` - Product from reel

---

### 4. Favorites & Personalization

**Goal**: Test user favorites and personalized recommendations.

```typescript
// 1. Get current favorites
const favorites = await mockAPI.getFavorites();
// Expected: 3 products (cookies, mugs, strawberries)

// 2. Add new favorite
await mockAPI.addFavorite('product-2');
// Expected: Success

// 3. Get updated favorites
const updatedFavorites = await mockAPI.getFavorites();
// Expected: 4 products

// 4. Remove favorite
await mockAPI.removeFavorite('product-2');
// Expected: Success

// 5. Get trending products
const trending = await mockAPI.getTrendingProducts(6);
// Expected: 3 trending products
```

**UI Pages to Test**:
- `/favorites` - Favorites page
- `/profile` - User profile with favorites
- `/` - Homepage with personalized recommendations

---

### 5. Reviews & Ratings

**Goal**: Test product review system.

```typescript
// 1. Get product reviews
const reviews = await mockAPI.getProductReviews('product-1');
// Expected: 2 reviews (5-star and 4-star)

// 2. Create new review
const newReview = await mockAPI.createReview({
  productId: 'product-1',
  rating: 5,
  comment: 'Amazing cookies! Best I\'ve ever had.',
  userId: 'user-1',
  userName: 'Demo User'
});
// Expected: New review with ID and timestamp

// 3. Get updated reviews
const updatedReviews = await mockAPI.getProductReviews('product-1');
// Expected: 3 reviews including new one
```

**UI Pages to Test**:
- `/product/[id]` - Product page with reviews
- `/orders/[id]` - Order page with review prompt

---

### 6. Promotions & Notifications

**Goal**: Test promotional features and notifications.

```typescript
// 1. Get active promotions
const promotions = await mockAPI.getActivePromotions();
// Expected: 2 promotions (cookies discount, free delivery)

// 2. Get vendor-specific promotions
const vendorPromos = await mockAPI.getActivePromotions('vendor-1');
// Expected: 1 promotion (20% off cookies)

// 3. Get notifications
const notifications = await mockAPI.getNotifications('user-1');
// Expected: 2 notifications (delivery, promotion)

// 4. Mark notification as read
await mockAPI.markNotificationRead('notif-1');
// Expected: Success
```

**UI Pages to Test**:
- `/` - Homepage with promotion banners
- `/vendor/[id]` - Vendor page with active promotions
- `/profile` - Profile with notifications

---

### 7. Location & Map

**Goal**: Test location-based vendor discovery.

```typescript
// 1. Get nearby vendors
const nearbyVendors = await mockAPI.getNearbyVendors({
  latitude: 39.9612,
  longitude: -82.9988,
  radiusMiles: 10
});
// Expected: 3 vendors in Columbus area

// 2. Get vendor with location
const vendor = await mockAPI.getVendor('vendor-1');
// Expected: Vendor with lat/lng and delivery radius

// 3. Check delivery availability
const isInRange = calculateDistance(
  userLocation,
  vendor.location
) <= vendor.deliveryRadius;
// Expected: Boolean indicating delivery availability
```

**UI Pages to Test**:
- `/map` - Map view with vendor markers
- `/` - Homepage with nearby vendors
- `/vendor/[id]` - Vendor page with map

---

### 8. Vendor Management

**Goal**: Test vendor profile and settings management.

```typescript
// 1. Get vendor dashboard
const dashboard = await mockAPI.getVendorDashboard('vendor-1');
// Expected: Summary with pending orders, revenue, etc.

// 2. Update vendor profile
const updated = await mockAPI.updateVendorProfile('vendor-1', {
  hours: 'Mon-Sat: 8am-8pm, Sun: 9am-6pm',
  phone: '(614) 555-9999'
});
// Expected: Updated vendor object

// 3. Toggle vendor status
const statusResult = await mockAPI.toggleVendorStatus('vendor-1');
// Expected: { success: true, isOpen: false }

// 4. Toggle back
const statusResult2 = await mockAPI.toggleVendorStatus('vendor-1');
// Expected: { success: true, isOpen: true }
```

**UI Pages to Test**:
- `/vendor/dashboard` - Vendor dashboard
- `/vendor/settings` - Vendor settings
- `/vendor/orders` - Order management
- `/vendor/products` - Product management

---

## Testing Tips

### Network Delays
All mock API calls include realistic delays:
- **Fast** (200-300ms): Cart, favorites, notifications
- **Standard** (500ms): Most GET requests
- **Slow** (800-1000ms): Profile updates, reviews
- **Very Slow** (1500-2000ms): POS connections, syncs

### Data Persistence
- **Cart**: Persists in localStorage
- **Demo Mode**: Persists in localStorage
- **Everything else**: In-memory (resets on refresh)

### Error Testing
To test error scenarios:
```typescript
// Invalid product ID
try {
  await mockAPI.getProduct('invalid-id');
} catch (error) {
  // Expected: "Product not found"
}

// Invalid vendor ID
try {
  await mockAPI.getVendor('invalid-id');
} catch (error) {
  // Expected: "Vendor not found"
}
```

### Console Debugging
```typescript
// Check demo mode status
console.log('Demo Mode:', isDemoMode());

// View all mock data
import * as mockData from '@/lib/mock/data';
console.log('Mock Data:', mockData);

// View cart
console.log('Cart:', localStorage.getItem('mockCart'));
```

---

## Quick Reference

### Demo Vendors
- `vendor-1`: Sweet Treats Bakery (Toast POS)
- `vendor-2`: Handmade Pottery Studio
- `vendor-3`: Farm Fresh Produce (Square POS)

### Demo Products
- `product-1`: Chocolate Chip Cookies ($12.99)
- `product-2`: Custom Birthday Cake ($45.00)
- `product-3`: Ceramic Coffee Mug Set ($68.00)
- `product-4`: Organic Vegetable Box ($35.00)
- `product-5`: Fresh Strawberries ($6.99)

### Demo Orders
- `order-1`: Delivered (Sweet Treats Bakery)
- `order-2`: In Transit (Farm Fresh Produce)
- `order-3`: Processing (Handmade Pottery Studio)

### Demo User
- Email: demo@makeriess.com
- Name: Demo User
- 2 saved addresses
- 3 favorites

---

## Automated Testing

You can use these endpoints in automated tests:

```typescript
// Example Playwright test
test('customer can add product to cart', async ({ page }) => {
  // Enable demo mode
  await page.goto('/?demo=true');
  
  // Navigate to product
  await page.goto('/product/product-1');
  
  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  
  // Verify cart count
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

---

## Troubleshooting

### Demo Mode Not Working
1. Check localStorage: `localStorage.getItem('demoMode')`
2. Clear cache and reload
3. Try enabling via URL: `/?demo=true`

### Data Not Persisting
- Only cart data persists in localStorage
- Other data is in-memory and resets on refresh
- This is intentional for demo purposes

### Slow Performance
- Mock API includes realistic delays
- This simulates real network conditions
- Delays are intentional for testing loading states

---

## Next Steps

After testing in demo mode:
1. Review the implementation in `src/lib/mock/`
2. Compare with real API endpoints
3. Ensure UI handles loading/error states
4. Test offline functionality with PWA
5. Verify analytics tracking
