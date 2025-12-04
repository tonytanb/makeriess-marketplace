import { useEffect, useState } from 'react';
import { subscribeToOrderStatusChanges, unsubscribe } from '../graphql/subscriptions';

/**
 * React hook for subscribing to order status changes
 * Automatically manages subscription lifecycle
 * 
 * @param customerId - Customer ID to filter updates
 * @param enabled - Whether subscription is active (default: true)
 * @returns Latest order status update
 */
export function useOrderSubscription(customerId: string, enabled = true) {
  const [latestUpdate, setLatestUpdate] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !customerId) return;

    const subscription = subscribeToOrderStatusChanges(
      customerId,
      (order) => {
        setLatestUpdate(order);
        setError(null);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsubscribe(subscription);
    };
  }, [customerId, enabled]);

  return { latestUpdate, error };
}
