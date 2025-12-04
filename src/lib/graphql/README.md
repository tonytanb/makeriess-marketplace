# GraphQL API Documentation

This directory contains GraphQL queries, mutations, subscriptions, and related utilities for the Makeriess marketplace.

## Subscriptions

### Product Updates

Subscribe to real-time product updates for a specific vendor:

```typescript
import { useProductSubscription } from '@/lib/hooks/useProductSubscription';

function VendorDashboard({ vendorId }: { vendorId: string }) {
  const { latestUpdate, error } = useProductSubscription(vendorId);

  useEffect(() => {
    if (latestUpdate) {
      console.log('Product updated:', latestUpdate);
      // Refresh product list or show notification
    }
  }, [latestUpdate]);

  if (error) {
    console.error('Subscription error:', error);
  }

  return <div>...</div>;
}
```

### Order Status Changes

Subscribe to real-time order status changes for a customer:

```typescript
import { useOrderSubscription } from '@/lib/hooks/useOrderSubscription';

function OrderTracking({ customerId }: { customerId: string }) {
  const { latestUpdate, error } = useOrderSubscription(customerId);

  useEffect(() => {
    if (latestUpdate) {
      console.log('Order status changed:', latestUpdate);
      // Show notification or update UI
      showNotification(`Order ${latestUpdate.id} is now ${latestUpdate.status}`);
    }
  }, [latestUpdate]);

  return <div>...</div>;
}
```

### Manual Subscription Management

For more control, use the subscription functions directly:

```typescript
import { 
  subscribeToProductUpdates, 
  subscribeToOrderStatusChanges,
  unsubscribe 
} from '@/lib/graphql/subscriptions';

// Subscribe
const subscription = subscribeToProductUpdates(
  vendorId,
  (product) => {
    console.log('Product updated:', product);
  },
  (error) => {
    console.error('Error:', error);
  }
);

// Unsubscribe when done
unsubscribe(subscription);
```

## Queries

### Search Products

```typescript
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

const result = await client.queries.searchProducts({
  query: 'croissant',
  category: 'Food & pastries',
  latitude: 40.7128,
  longitude: -74.0060,
  radiusMiles: 5,
  sortBy: 'DISTANCE',
  limit: 20,
});

console.log(result.data);
```

### Get Nearby Vendors

```typescript
const vendors = await client.queries.getNearbyVendors({
  latitude: 40.7128,
  longitude: -74.0060,
  radiusMiles: 10,
  category: 'Food & pastries',
  limit: 20,
});
```

### Get Recommended Products

```typescript
const recommendations = await client.queries.getRecommendedProducts({
  customerId: 'customer-123',
  latitude: 40.7128,
  longitude: -74.0060,
  limit: 10,
});
```

## Mutations

### Create Checkout Session

```typescript
const session = await client.mutations.createCheckoutSession({
  customerId: 'customer-123',
  items: [
    { productId: 'prod-1', vendorId: 'vendor-1', quantity: 2 },
    { productId: 'prod-2', vendorId: 'vendor-2', quantity: 1 },
  ],
  deliveryAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  },
  deliveryMode: 'DELIVERY',
});

console.log('Stripe client secret:', session.data.clientSecret);
```

### Update Order Status

```typescript
const order = await client.mutations.updateOrderStatus({
  orderId: 'order-123',
  status: 'PREPARING',
});
```

### Connect POS System

```typescript
const result = await client.mutations.connectPOS({
  vendorId: 'vendor-123',
  provider: 'SQUARE',
  authCode: 'oauth-code-from-square',
});

if (result.data.success) {
  console.log('POS connected successfully');
}
```

### Sync POS Products

```typescript
const syncResult = await client.mutations.syncPOSProducts({
  vendorId: 'vendor-123',
});

console.log(`Added: ${syncResult.data.productsAdded}`);
console.log(`Updated: ${syncResult.data.productsUpdated}`);
console.log(`Removed: ${syncResult.data.productsRemoved}`);
```

## Model Operations

### CRUD Operations

All models (Customer, Vendor, Product, Order, Review) support standard CRUD operations:

```typescript
// Create
const product = await client.models.Product.create({
  vendorId: 'vendor-123',
  name: 'Artisan Croissant',
  price: 4.50,
  category: 'Food & pastries',
  images: ['https://...'],
  isVisible: true,
  isAvailable: true,
});

// Read
const product = await client.models.Product.get({ id: 'product-123' });

// Update
const updated = await client.models.Product.update({
  id: 'product-123',
  price: 5.00,
});

// Delete
await client.models.Product.delete({ id: 'product-123' });

// List with filters
const products = await client.models.Product.list({
  filter: {
    vendorId: { eq: 'vendor-123' },
    isVisible: { eq: true },
  },
});
```

## Authorization

All API operations require authentication via Cognito. The default authorization mode is `userPool`.

- **Customers**: Can read all public data, manage their own orders and reviews
- **Vendors**: Can manage their own products, view their orders, respond to reviews
- **Public**: No access (authentication required)

## Error Handling

```typescript
try {
  const result = await client.queries.searchProducts({ ... });
  console.log(result.data);
} catch (error) {
  if (error.errors) {
    // GraphQL errors
    console.error('GraphQL errors:', error.errors);
  } else {
    // Network or other errors
    console.error('Error:', error);
  }
}
```

## Real-time Updates

Subscriptions automatically reconnect on network issues. To handle connection state:

```typescript
import { Hub } from 'aws-amplify/utils';

Hub.listen('api', (data) => {
  const { payload } = data;
  
  if (payload.event === 'ConnectionStateChange') {
    console.log('Connection state:', payload.data.connectionState);
  }
});
```
