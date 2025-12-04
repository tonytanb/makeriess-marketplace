import { useEffect, useState } from 'react';
import { subscribeToProductUpdates, unsubscribe } from '../graphql/subscriptions';

/**
 * React hook for subscribing to product updates
 * Automatically manages subscription lifecycle
 * 
 * @param vendorId - Vendor ID to filter updates
 * @param enabled - Whether subscription is active (default: true)
 * @returns Latest product update
 */
export function useProductSubscription(vendorId: string, enabled = true) {
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !vendorId) return;

    const subscription = subscribeToProductUpdates(
      vendorId,
      (product) => {
        setLatestUpdate(product);
        setError(null);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsubscribe(subscription);
    };
  }, [vendorId, enabled]);

  return { latestUpdate, error };
}
