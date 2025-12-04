import { client } from '@/lib/amplify/client';
import type {
  CreateCheckoutSessionInput,
  CheckoutSession,
  SavedPaymentMethod,
  PromoCode,
  LoyaltyPoints,
  Order,
} from '@/lib/types/checkout';

export const checkoutService = {
  // Create checkout session with Stripe
  createCheckoutSession: async (
    input: CreateCheckoutSessionInput
  ): Promise<CheckoutSession> => {
    try {
      const { data, errors } = await client.mutations.createCheckoutSession({
        customerId: input.customerId,
        items: input.items.map((item) => ({
          productId: item.productId,
          vendorId: item.vendorId,
          quantity: item.quantity,
        })),
        deliveryAddress: input.deliveryAddress,
        deliveryMode: input.deliveryMode,
        scheduledFor: input.scheduledFor,
        promoCode: input.promoCode,
        loyaltyPointsToRedeem: input.loyaltyPointsToRedeem,
      });

      if (errors) {
        console.error('Create checkout session errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to create checkout session');
      }

      if (!data) {
        throw new Error('No data returned from checkout session');
      }

      return data as CheckoutSession;
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  },

  // Validate promo code
  validatePromoCode: async (code: string, subtotal: number): Promise<PromoCode | null> => {
    try {
      // This would call a backend function to validate the promo code
      // For now, we'll simulate with mock data
      const mockPromoCodes: Record<string, PromoCode> = {
        WELCOME10: {
          code: 'WELCOME10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minimumOrder: 20,
        },
        SAVE5: {
          code: 'SAVE5',
          discountType: 'FIXED',
          discountValue: 5,
          minimumOrder: 15,
        },
      };

      const promo = mockPromoCodes[code.toUpperCase()];
      
      if (!promo) {
        throw new Error('Invalid promo code');
      }

      if (promo.minimumOrder && subtotal < promo.minimumOrder) {
        throw new Error(`Minimum order of $${promo.minimumOrder} required`);
      }

      return promo;
    } catch (error) {
      console.error('Validate promo code error:', error);
      throw error;
    }
  },

  // Get customer's saved payment methods
  getSavedPaymentMethods: async (customerId: string): Promise<SavedPaymentMethod[]> => {
    try {
      const { data, errors } = await client.queries.managePaymentMethods({
        customerId,
        action: 'LIST',
      });

      if (errors) {
        console.error('Get payment methods errors:', errors);
        return [];
      }

      return (data?.paymentMethods as SavedPaymentMethod[]) || [];
    } catch (error) {
      console.error('Get payment methods error:', error);
      return [];
    }
  },

  // Get customer's loyalty points
  getLoyaltyPoints: async (customerId: string): Promise<LoyaltyPoints> => {
    try {
      const { data, errors } = await client.queries.manageLoyaltyPoints({
        customerId,
        action: 'GET_BALANCE',
      });

      if (errors) {
        console.error('Get loyalty points errors:', errors);
        return { balance: 0, pointsToRedeem: 0, dollarValue: 0 };
      }

      const balance = (data?.balance as number) || 0;
      return {
        balance,
        pointsToRedeem: 0,
        dollarValue: balance / 100, // 100 points = $1
      };
    } catch (error) {
      console.error('Get loyalty points error:', error);
      return { balance: 0, pointsToRedeem: 0, dollarValue: 0 };
    }
  },

  // Get customer's saved addresses
  getSavedAddresses: async (customerId: string) => {
    try {
      const { data, errors } = await client.queries.manageSavedAddresses({
        customerId,
        action: 'LIST',
      });

      if (errors) {
        console.error('Get saved addresses errors:', errors);
        return [];
      }

      return data?.addresses || [];
    } catch (error) {
      console.error('Get saved addresses error:', error);
      return [];
    }
  },

  // Confirm payment and create orders
  confirmPayment: async (
    sessionId: string,
    paymentIntentId: string
  ): Promise<Order[]> => {
    try {
      // This would be handled by Stripe webhook in production
      // For now, we'll simulate the order creation
      const { data, errors } = await client.mutations.processOrder({
        sessionId,
        paymentIntentId,
      });

      if (errors) {
        console.error('Confirm payment errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to confirm payment');
      }

      return (data?.orders as Order[]) || [];
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  },
};
