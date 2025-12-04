# Demo Mode API Endpoints

This document lists all available mock API endpoints in demo mode for testing the Makeriess marketplace without a backend.

## Enabling Demo Mode

```typescript
import { enableDemoMode, isDemoMode } from '@/lib/mock/api';

// Enable demo mode
enableDemoMode();

// Check if demo mode is active
if (isDemoMode()) {
  // Use mock API
}
```

## Available Endpoints

### Products

#### Search Products
```typescript
mockAPI.searchProducts({
  query?: string,
  category?: string,
  limit?: number
})
```
Returns filtered products based on search criteria.

#### Get Product
```typescript
mockAPI.getProduct(productId: string)
```
Returns a single product by ID.

#### Get Trending Products
```typescript
mockAPI.getTrendingProducts(limit?: number)
```
Returns trending products (default limit: 6).

---

### Vendors

#### Get Nearby Vendors
```typescript
mockAPI.getNearbyVendors({
  latitude: number,
  longitude: number,
  radiusMiles: number
})
```
Returns vendors near the specified location.

#### Get Vendor
```typescript
mockAPI.getVendor(vendorId: string)
```
Returns a single vendor by ID.

**Demo Vendors with POS Connections:**
- `vendor-1`: Sweet Treats Bakery (Toast POS connected)
- `vendor-3`: Farm Fresh Produce (Square POS connected)

#### Get Vendor Products
```typescript
mockAPI.getVendorProducts(vendorId: string)
```
Returns all products for a specific vendor.

#### Update Vendor Profile
```typescript
mockAPI.updateVendorProfile(vendorId: string, updates: any)
```
Updates vendor profile information.

#### Toggle Vendor Status
```typescript
mockAPI.toggleVendorStatus(vendorId: string)
```
Toggles vendor open/closed status.

---

### Orders

#### Get Orders
```typescript
mockAPI.getOrders()
```
Returns all orders for the current user.

#### Get Order
```typescript
mockAPI.getOrder(orderId: string)
```
Returns a single order by ID.

**Demo Orders:**
- `order-1`: Delivered order from Sweet Treats Bakery
- `order-2`: In-transit order from Farm Fresh Produce
- `order-3`: Processing order from Handmade Pottery Studio

#### Create Order
```typescript
mockAPI.createOrder(orderData: any)
```
Creates a new order (simulates 1s processing time).

---

### Cart

#### Get Cart
```typescript
mockAPI.getCart()
```
Returns current cart from localStorage.

#### Add to Cart
```typescript
mockAPI.addToCart({
  productId: string,
  quantity: number,
  price: number,
  ...
})
```
Adds item to cart or updates quantity if exists.

#### Remove from Cart
```typescript
mockAPI.removeFromCart(productId: string)
```
Removes item from cart.

#### Clear Cart
```typescript
mockAPI.clearCart()
```
Empties the cart.

---

### User Profile

#### Get Current User
```typescript
mockAPI.getCurrentUser()
```
Returns the demo user profile.

**Demo User:**
- Email: demo@makeriess.com
- Name: Demo User
- 2 saved addresses
- 3 favorite products
- 2 favorite vendors

#### Update User
```typescript
mockAPI.updateUser(updates: Partial<User>)
```
Updates user profile information.

---

### Favorites

#### Get Favorites
```typescript
mockAPI.getFavorites()
```
Returns user's favorite products.

#### Add Favorite
```typescript
mockAPI.addFavorite(productId: string)
```
Adds product to favorites.

#### Remove Favorite
```typescript
mockAPI.removeFavorite(productId: string)
```
Removes product from favorites.

---

### Reviews

#### Get Product Reviews
```typescript
mockAPI.getProductReviews(productId: string)
```
Returns all reviews for a product.

#### Create Review
```typescript
mockAPI.createReview({
  productId: string,
  rating: number,
  comment: string,
  ...
})
```
Creates a new product review.

---

### Promotions

#### Get Active Promotions
```typescript
mockAPI.getActivePromotions(vendorId?: string)
```
Returns active promotions, optionally filtered by vendor.

**Demo Promotions:**
- 20% off all cookies at Sweet Treats Bakery
- Free delivery on $50+ orders at Farm Fresh Produce

---

### POS Connections

#### Get POS Connection
```typescript
mockAPI.getPOSConnection(vendorId: string)
```
Returns POS connection details for a vendor.

**Demo POS Connections:**
- `vendor-1`: Toast POS (Restaurant GUID: demo-guid-123)
- `vendor-3`: Square POS (Merchant ID: sq0idp-demo-merchant-001)

#### Connect POS
```typescript
mockAPI.connectPOS({
  vendorId: string,
  provider: 'SQUARE' | 'TOAST' | 'SHOPIFY',
  authCode: string
})
```
Simulates connecting a POS system (1.5s delay).

#### Disconnect POS
```typescript
mockAPI.disconnectPOS(vendorId: string)
```
Disconnects POS system.

#### Sync POS Products
```typescript
mockAPI.syncPOSProducts(vendorId: string)
```
Triggers product sync from POS (2s delay, returns random sync results).

#### Get Sync Logs
```typescript
mockAPI.getSyncLogs(vendorId: string)
```
Returns sync history for a vendor.

**Demo Sync Logs:**
- Multiple successful syncs for vendor-1 (Toast)
- Successful syncs for vendor-3 (Square)
- Includes one partial sync with errors

---

### Vendor Analytics

#### Get Vendor Analytics
```typescript
mockAPI.getVendorAnalytics(vendorId: string, {
  startDate?: string,
  endDate?: string
})
```
Returns analytics data including revenue, orders, and trends.

**Available for:**
- `vendor-1`: $12,450.50 total revenue, 156 orders

#### Get Vendor Dashboard
```typescript
mockAPI.getVendorDashboard(vendorId: string)
```
Returns dashboard summary with pending orders, today's revenue, etc.

---

### Reels / Social Content

#### Get Reels
```typescript
mockAPI.getReels({
  limit?: number,
  vendorId?: string
})
```
Returns video reels/stories from vendors.

**Demo Reels:**
- Chocolate chip cookie making video from Sweet Treats Bakery
- Pottery wheel video from Handmade Pottery Studio

#### Track Story View
```typescript
mockAPI.trackStoryView(storyId: string)
```
Records a story view.

#### Interact with Story
```typescript
mockAPI.interactWithStory(storyId: string, action: 'like' | 'share')
```
Records story interaction (like or share).

---

### Notifications

#### Get Notifications
```typescript
mockAPI.getNotifications(userId: string)
```
Returns user notifications.

**Demo Notifications:**
- Order delivery notification
- Promotion notification

#### Mark Notification Read
```typescript
mockAPI.markNotificationRead(notificationId: string)
```
Marks a notification as read.

---

## Testing Scenarios

### Scenario 1: Customer Journey
1. Search for products: `mockAPI.searchProducts({ query: 'cookies' })`
2. View product details: `mockAPI.getProduct('product-1')`
3. Add to cart: `mockAPI.addToCart({ productId: 'product-1', quantity: 2, price: 12.99 })`
4. Create order: `mockAPI.createOrder({ ... })`
5. Track order: `mockAPI.getOrder('order-1')`

### Scenario 2: Vendor with Toast POS
1. Get vendor: `mockAPI.getVendor('vendor-1')`
2. Check POS connection: `mockAPI.getPOSConnection('vendor-1')`
3. View sync logs: `mockAPI.getSyncLogs('vendor-1')`
4. Trigger sync: `mockAPI.syncPOSProducts('vendor-1')`
5. View analytics: `mockAPI.getVendorAnalytics('vendor-1')`

### Scenario 3: Social Discovery
1. Get reels: `mockAPI.getReels({ limit: 10 })`
2. Track view: `mockAPI.trackStoryView('reel-1')`
3. Like reel: `mockAPI.interactWithStory('reel-1', 'like')`
4. View vendor: `mockAPI.getVendor('vendor-1')`
5. View products: `mockAPI.getVendorProducts('vendor-1')`

### Scenario 4: Vendor Management
1. Get dashboard: `mockAPI.getVendorDashboard('vendor-1')`
2. View orders: `mockAPI.getOrders()`
3. Update profile: `mockAPI.updateVendorProfile('vendor-1', { hours: '...' })`
4. Toggle status: `mockAPI.toggleVendorStatus('vendor-1')`
5. View analytics: `mockAPI.getVendorAnalytics('vendor-1')`

---

## Network Delays

All mock API calls include realistic network delays:
- Fast operations (200-300ms): Cart operations, favorites, notifications
- Standard operations (500ms): Most GET requests
- Slow operations (800-1000ms): Profile updates, review creation
- Very slow operations (1500-2000ms): POS connections, product syncs

## Data Persistence

- **Cart**: Persisted in localStorage as `mockCart`
- **Demo Mode**: Persisted in localStorage as `demoMode`
- **Favorites**: Modified in-memory (resets on page refresh)
- **All other data**: In-memory only (resets on page refresh)
