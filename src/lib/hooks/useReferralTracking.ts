import { useEffect } from 'react';
import { getReferrerFromUrl } from '@/lib/utils/social-sharing';

/**
 * Hook to track referral sources from shared links
 * Stores the referrer ID in localStorage for attribution
 */
export function useReferralTracking() {
  useEffect(() => {
    const referrerId = getReferrerFromUrl();
    
    if (referrerId) {
      // Store referrer in localStorage for order attribution
      try {
        localStorage.setItem('makeriess_referrer', referrerId);
        localStorage.setItem('makeriess_referrer_timestamp', Date.now().toString());
        
        // Track referral event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'referral_visit', {
            referrer_id: referrerId,
          });
        }
        
        console.log('Referral tracked:', referrerId);
      } catch (error) {
        console.error('Failed to store referrer:', error);
      }
    }
  }, []);
}

/**
 * Get the stored referrer ID for order attribution
 * Returns null if no referrer or if referrer is older than 30 days
 */
export function getStoredReferrer(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const referrerId = localStorage.getItem('makeriess_referrer');
    const timestamp = localStorage.getItem('makeriess_referrer_timestamp');
    
    if (!referrerId || !timestamp) return null;
    
    // Check if referrer is still valid (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const age = Date.now() - parseInt(timestamp, 10);
    
    if (age > thirtyDaysInMs) {
      // Referrer expired, clear it
      localStorage.removeItem('makeriess_referrer');
      localStorage.removeItem('makeriess_referrer_timestamp');
      return null;
    }
    
    return referrerId;
  } catch (error) {
    console.error('Failed to get stored referrer:', error);
    return null;
  }
}

/**
 * Clear the stored referrer (e.g., after order completion)
 */
export function clearStoredReferrer(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('makeriess_referrer');
    localStorage.removeItem('makeriess_referrer_timestamp');
  } catch (error) {
    console.error('Failed to clear referrer:', error);
  }
}

/**
 * Track order with referral attribution
 */
export function trackReferralOrder(orderId: string, totalAmount: number): void {
  const referrerId = getStoredReferrer();
  
  if (referrerId) {
    // Track referral conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'referral_conversion', {
        referrer_id: referrerId,
        order_id: orderId,
        value: totalAmount,
      });
    }
    
    console.log('Referral order tracked:', { referrerId, orderId, totalAmount });
    
    // Clear referrer after successful order
    clearStoredReferrer();
  }
}
