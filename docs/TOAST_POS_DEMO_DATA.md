# Toast POS Demo Data

This document provides the demo credentials and data for testing Toast POS integration in demo mode.

## Demo Vendor with Toast POS

### Sweet Treats Bakery (vendor-1)

**Vendor Details:**
- **ID**: `vendor-1`
- **Name**: Sweet Treats Bakery
- **Category**: Food & Beverage
- **Location**: 123 Main St, Columbus, OH 43215
- **Rating**: 4.8 ⭐ (127 reviews)

**Toast POS Connection:**
- **Provider**: TOAST
- **Account ID**: `toast_demo_restaurant_001`
- **Restaurant GUID**: `demo-guid-123`
- **Last Sync**: 2025-12-04 at 10:30 AM
- **Sync Status**: Success ✅
- **Products Synced**: 24 items

---

## Demo Toast Credentials

Use these credentials to test the Toast POS connection flow:

```
Client ID: toast_demo_client_abc123
Client Secret: toast_demo_secret_xyz789
Restaurant GUID: demo-guid-123
```

### How to Test Toast Connection

1. Navigate to `/vendor/pos`
2. Click "Connect" on the Toast POS card
3. You'll be redirected to `/vendor/pos/toast-setup`
4. Enter the demo credentials above
5. Click "Connect Toast POS"
6. You'll be redirected back with a success message

---

## Sync History

The demo includes realistic sync logs for Sweet Treats Bakery:

### Recent Syncs

#### Sync #1 (Most Recent)
- **Time**: 2025-12-04 10:30:00 AM
- **Status**: Success ✅
- **Duration**: 83 seconds
- **Products Added**: 3
- **Products Updated**: 18
- **Products Removed**: 1

#### Sync #2
- **Time**: 2025-12-04 09:45:00 AM
- **Status**: Success ✅
- **Duration**: 42 seconds
- **Products Added**: 0
- **Products Updated**: 5
- **Products Removed**: 0

#### Sync #3
- **Time**: 2025-12-04 09:00:00 AM
- **Status**: Partial ⚠️
- **Duration**: 75 seconds
- **Products Added**: 2
- **Products Updated**: 12
- **Products Removed**: 0
- **Errors**: Failed to sync 2 products due to missing images

---

## Synced Products

Products currently synced from Toast POS:

### Product 1: Chocolate Chip Cookies (Dozen)
- **ID**: `product-1`
- **Price**: $12.99 (was $15.99)
- **Discount**: 19% off
- **Stock**: 24 units
- **Rating**: 4.9 ⭐ (45 reviews)
- **Tags**: bestseller, gluten-free-option
- **Trending**: Yes 🔥

### Product 2: Custom Birthday Cake
- **ID**: `product-2`
- **Price**: $45.00
- **Stock**: 5 units
- **Rating**: 5.0 ⭐ (78 reviews)
- **Tags**: custom, special-order

---

## Testing Sync Operations

### Manual Sync
```typescript
import { mockAPI } from '@/lib/mock/api';

// Trigger a manual sync
const result = await mockAPI.syncPOSProducts('vendor-1');

// Expected result (randomized):
{
  success: true,
  productsAdded: 0-5,
  productsUpdated: 0-20,
  productsRemoved: 0-3,
  errors: []
}
```

### View Sync Logs
```typescript
import { mockAPI } from '@/lib/mock/api';

// Get sync history
const logs = await mockAPI.getSyncLogs('vendor-1');

// Returns array of sync log objects
```

### Check Connection Status
```typescript
import { mockAPI } from '@/lib/mock/api';

// Get POS connection details
const connection = await mockAPI.getPOSConnection('vendor-1');

// Returns:
{
  provider: 'TOAST',
  accountId: 'toast_demo_restaurant_001',
  restaurantGuid: 'demo-guid-123',
  lastSyncAt: '2025-12-04T10:30:00Z',
  syncStatus: 'success',
  productsCount: 24
}
```

---

## Vendor Analytics

Sweet Treats Bakery has comprehensive analytics available:

### Revenue Metrics
- **Total Revenue**: $12,450.50
- **Total Orders**: 156
- **Average Order Value**: $79.81

### Top Products
1. **Chocolate Chip Cookies**: $3,240.50 revenue (250 orders)
2. **Custom Birthday Cake**: $2,700.00 revenue (60 orders)

### Revenue by Day (Last 7 Days)
```
Nov 18: $1,250.00
Nov 19: $1,450.00
Nov 20: $1,680.00
Nov 21: $1,320.00
Nov 22: $1,890.00
Nov 23: $2,100.00
Nov 24: $2,760.50
```

---

## API Endpoints for Toast Integration

### Connect Toast POS
```typescript
POST /api/connectPOS
{
  vendorId: 'vendor-1',
  provider: 'TOAST',
  authCode: 'base64_encoded_credentials'
}
```

### Sync Products
```typescript
POST /api/syncPOSProducts
{
  vendorId: 'vendor-1'
}
```

### Get Sync Logs
```typescript
GET /api/syncLogs?vendorId=vendor-1
```

### Disconnect POS
```typescript
POST /api/disconnectPOS
{
  vendorId: 'vendor-1'
}
```

---

## Toast Webhook Simulation

In demo mode, you can simulate Toast webhooks for testing:

### Product Updated Webhook
```typescript
{
  eventType: 'PRODUCT_UPDATED',
  restaurantGuid: 'demo-guid-123',
  product: {
    guid: 'product-guid-123',
    name: 'Chocolate Chip Cookies (Dozen)',
    price: 1299,
    inStock: true
  }
}
```

### Inventory Changed Webhook
```typescript
{
  eventType: 'INVENTORY_CHANGED',
  restaurantGuid: 'demo-guid-123',
  item: {
    guid: 'product-guid-123',
    quantity: 24
  }
}
```

---

## Comparison: Toast vs Square

The demo includes both Toast and Square integrations for comparison:

| Feature | Toast (vendor-1) | Square (vendor-3) |
|---------|------------------|-------------------|
| Provider | Toast POS | Square |
| Account ID | toast_demo_restaurant_001 | sq0idp-demo-merchant-001 |
| Products | 24 | 45 |
| Last Sync | 10:30 AM | 09:15 AM |
| Sync Status | Success | Success |
| Analytics | Full | Full |

---

## Testing Checklist

- [ ] View vendor with Toast connection
- [ ] Check POS connection status
- [ ] View sync logs
- [ ] Trigger manual sync
- [ ] View synced products
- [ ] Check vendor analytics
- [ ] Test disconnect flow
- [ ] Test reconnect flow
- [ ] Compare with Square integration
- [ ] Test error scenarios

---

## Notes

- All sync operations include realistic delays (2 seconds)
- Sync results are randomized to simulate real-world variability
- Connection status persists in demo mode
- Sync logs show realistic timestamps and durations
- Analytics data is pre-populated for demonstration
