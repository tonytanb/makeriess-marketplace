# Demo Mode Quick Reference

## Enable Demo Mode
```
Visit: /?demo=true
Or: /demo page
```

## Toast POS Demo Credentials
```
Client ID: toast_demo_client_abc123
Client Secret: toast_demo_secret_xyz789
Restaurant GUID: demo-guid-123
```

## Demo Vendors
| ID | Name | POS | Products |
|----|------|-----|----------|
| vendor-1 | Sweet Treats Bakery | Toast | 24 |
| vendor-2 | Handmade Pottery Studio | None | 1 |
| vendor-3 | Farm Fresh Produce | Square | 45 |

## Demo Products
| ID | Name | Price | Vendor |
|----|------|-------|--------|
| product-1 | Chocolate Chip Cookies | $12.99 | vendor-1 |
| product-2 | Custom Birthday Cake | $45.00 | vendor-1 |
| product-3 | Ceramic Coffee Mug Set | $68.00 | vendor-2 |
| product-4 | Organic Vegetable Box | $35.00 | vendor-3 |
| product-5 | Fresh Strawberries | $6.99 | vendor-3 |

## Demo Orders
| ID | Status | Vendor | Total |
|----|--------|--------|-------|
| order-1 | delivered | vendor-1 | $58.98 |
| order-2 | in_transit | vendor-3 | $41.99 |
| order-3 | processing | vendor-2 | $68.00 |

## Key Endpoints

### Products
```typescript
mockAPI.searchProducts({ query: 'cookies' })
mockAPI.getProduct('product-1')
mockAPI.getTrendingProducts(6)
```

### Vendors
```typescript
mockAPI.getVendor('vendor-1')
mockAPI.getNearbyVendors({ latitude: 39.96, longitude: -82.99, radiusMiles: 10 })
mockAPI.getVendorProducts('vendor-1')
```

### Cart
```typescript
mockAPI.getCart()
mockAPI.addToCart({ productId: 'product-1', quantity: 2, price: 12.99 })
mockAPI.clearCart()
```

### Orders
```typescript
mockAPI.getOrders()
mockAPI.getOrder('order-1')
mockAPI.createOrder({ items, total, address })
```

### POS
```typescript
mockAPI.getPOSConnection('vendor-1')
mockAPI.syncPOSProducts('vendor-1')
mockAPI.getSyncLogs('vendor-1')
```

### Analytics
```typescript
mockAPI.getVendorAnalytics('vendor-1')
mockAPI.getVendorDashboard('vendor-1')
```

### Social
```typescript
mockAPI.getReels({ limit: 10 })
mockAPI.trackStoryView('reel-1')
mockAPI.interactWithStory('reel-1', 'like')
```

## Test Pages

### Customer
- `/` - Homepage
- `/product/product-1` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history
- `/orders/order-1` - Order tracking
- `/favorites` - Favorites
- `/reels` - Social feed
- `/map` - Vendor map

### Vendor
- `/vendor/dashboard` - Dashboard
- `/vendor/pos` - POS connections
- `/vendor/pos/toast-setup` - Toast setup
- `/vendor/products` - Product management
- `/vendor/orders` - Order management
- `/vendor/analytics` - Analytics
- `/vendor/settings` - Settings

## Network Delays
- Fast: 200-300ms (cart, favorites)
- Standard: 500ms (search, get)
- Slow: 800-1000ms (updates, reviews)
- Very Slow: 1500-2000ms (POS sync)

## Documentation
- 📖 [Complete Guide](DEMO_MODE_COMPLETE.md)
- 🔌 [API Reference](docs/DEMO_MODE_ENDPOINTS.md)
- 🍞 [Toast POS Data](docs/TOAST_POS_DEMO_DATA.md)
- 🧪 [Testing Guide](docs/DEMO_MODE_TESTING_GUIDE.md)
