/**
 * GraphQL Subscriptions for real-time updates
 * 
 * This file contains subscription helpers and filters for:
 * - Product updates (vendor-specific)
 * - Order status changes (customer-specific)
 * 
 * Amplify Gen 2 automatically generates subscriptions for model mutations:
 * - onCreate<Model>
 * - onUpdate<Model>
 * - onDelete<Model>
 */

import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

type ProductUpdate = Record<string, unknown>;
type OrderUpdate = Record<string, unknown>;

/**
 * Subscribe to product updates for a specific vendor
 * Useful for vendor portal to see real-time product changes
 * Uses the auto-generated onUpdateProduct subscription with filter
 */
export function subscribeToProductUpdates(
  vendorId: string,
  onUpdate: (product: ProductUpdate) => void,
  onError?: (error: Error) => void
) {
  const subscription = client.models.Product.onUpdate({
    filter: {
      vendorId: { eq: vendorId }
    }
  }).subscribe({
    next: (data) => {
      if (data) {
        onUpdate(data);
      }
    },
    error: (error) => {
      console.error('Product update subscription error:', error);
      onError?.(error as Error);
    },
  });

  return subscription;
}

/**
 * Subscribe to order status changes for a specific customer
 * Useful for customer app to track order progress in real-time
 * Uses the auto-generated onUpdateOrder subscription with filter
 */
export function subscribeToOrderStatusChanges(
  customerId: string,
  onStatusChange: (order: OrderUpdate) => void,
  onError?: (error: Error) => void
) {
  const subscription = client.models.Order.onUpdate({
    filter: {
      customerId: { eq: customerId }
    }
  }).subscribe({
    next: (data) => {
      if (data) {
        onStatusChange(data);
      }
    },
    error: (error) => {
      console.error('Order status subscription error:', error);
      onError?.(error as Error);
    },
  });

  return subscription;
}

/**
 * Subscribe to all product updates (for admin or analytics)
 * No filter applied
 */
export function subscribeToAllProductUpdates(
  onUpdate: (product: ProductUpdate) => void,
  onError?: (error: Error) => void
) {
  const subscription = client.models.Product.onUpdate().subscribe({
    next: (data) => {
      if (data) {
        onUpdate(data);
      }
    },
    error: (error) => {
      console.error('Product update subscription error:', error);
      onError?.(error as Error);
    },
  });

  return subscription;
}

/**
 * Subscribe to new product creations for a vendor
 * Useful for vendor portal to see when new products are synced from POS
 */
export function subscribeToNewProducts(
  vendorId: string,
  onCreate: (product: ProductUpdate) => void,
  onError?: (error: Error) => void
) {
  const subscription = client.models.Product.onCreate({
    filter: {
      vendorId: { eq: vendorId }
    }
  }).subscribe({
    next: (data) => {
      if (data) {
        onCreate(data);
      }
    },
    error: (error) => {
      console.error('Product creation subscription error:', error);
      onError?.(error as Error);
    },
  });

  return subscription;
}

/**
 * Subscribe to new orders for a vendor
 * Useful for vendor portal to get notified of new orders immediately
 */
export function subscribeToNewOrders(
  vendorId: string,
  onCreate: (order: OrderUpdate) => void,
  onError?: (error: Error) => void
) {
  const subscription = client.models.Order.onCreate({
    filter: {
      vendorId: { eq: vendorId }
    }
  }).subscribe({
    next: (data) => {
      if (data) {
        onCreate(data);
      }
    },
    error: (error) => {
      console.error('Order creation subscription error:', error);
      onError?.(error as Error);
    },
  });

  return subscription;
}

/**
 * Unsubscribe helper
 * Call this when component unmounts or subscription is no longer needed
 */
export function unsubscribe(subscription: { unsubscribe: () => void }) {
  subscription.unsubscribe();
}
