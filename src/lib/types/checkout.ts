// Checkout-related types
import type { Address, CartItem } from './customer';

export interface SavedPaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface PromoCode {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrder?: number;
  expiresAt?: string;
}

export interface LoyaltyPoints {
  balance: number;
  pointsToRedeem: number;
  dollarValue: number; // 100 points = $1
}

export interface CheckoutSession {
  sessionId: string;
  clientSecret: string;
  orders: Order[];
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  deliveryMode: 'DELIVERY' | 'PICKUP';
  scheduledFor?: string;
  stripePaymentIntentId?: string;
  promoCode?: string;
  loyaltyPointsUsed?: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateCheckoutSessionInput {
  customerId: string;
  items: CartItem[];
  deliveryAddress: Address;
  deliveryMode: 'DELIVERY' | 'PICKUP';
  scheduledFor?: string;
  promoCode?: string;
  loyaltyPointsToRedeem?: number;
  paymentMethodId?: string;
}

export interface OrderConfirmation {
  orders: Order[];
  totalAmount: number;
  estimatedDeliveryTime: string;
  confirmationNumber: string;
}
