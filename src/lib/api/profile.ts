/**
 * Customer Profile API Service
 */

import { generateClient } from 'aws-amplify/data';

const client = generateClient();

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dietaryPreferences: string[];
  loyaltyPoints: number;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAddress {
  id: string;
  customerId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface SavedPaymentMethod {
  id: string;
  customerId: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface LoyaltyTransaction {
  transactionId: string;
  customerId: string;
  type: 'EARNED' | 'REDEEMED';
  points: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  dietaryPreferences?: string[];
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
  instructions?: string;
}

type GraphQLResponse<T> = { data: T; errors?: unknown[] };

export const profileService = {
  // Customer Profile
  getProfile: async (customerId: string): Promise<CustomerProfile> => {
    const response = await client.queries.manageCustomerProfile({
      operation: 'GET',
      customerId,
    }) as GraphQLResponse<CustomerProfile>;
    return response.data;
  },

  updateProfile: async (customerId: string, profileUpdate: ProfileUpdateInput): Promise<CustomerProfile> => {
    const response = await client.queries.manageCustomerProfile({
      operation: 'UPDATE',
      customerId,
      profileUpdate,
    }) as GraphQLResponse<CustomerProfile>;
    return response.data;
  },

  // Saved Addresses
  listAddresses: async (customerId: string): Promise<SavedAddress[]> => {
    const response = await client.queries.manageSavedAddresses({
      operation: 'LIST',
      customerId,
    }) as GraphQLResponse<SavedAddress[]>;
    return response.data.addresses || [];
  },

  addAddress: async (customerId: string, address: AddressInput): Promise<SavedAddress> => {
    const response = await client.queries.manageSavedAddresses({
      operation: 'ADD',
      customerId,
      address,
    }) as GraphQLResponse<SavedAddress>;
    return response.data;
  },

  updateAddress: async (customerId: string, addressId: string, address: AddressInput): Promise<SavedAddress> => {
    const response = await client.queries.manageSavedAddresses({
      operation: 'UPDATE',
      customerId,
      addressId,
      address,
    }) as GraphQLResponse<SavedAddress>;
    return response.data;
  },

  deleteAddress: async (customerId: string, addressId: string): Promise<void> => {
    await client.queries.manageSavedAddresses({
      operation: 'DELETE',
      customerId,
      addressId,
    });
  },

  setDefaultAddress: async (customerId: string, addressId: string): Promise<void> => {
    await client.queries.manageSavedAddresses({
      operation: 'SET_DEFAULT',
      customerId,
      addressId,
    });
  },

  // Payment Methods
  listPaymentMethods: async (customerId: string): Promise<SavedPaymentMethod[]> => {
    const response = await client.queries.managePaymentMethods({
      operation: 'LIST',
      customerId,
    }) as GraphQLResponse<{ paymentMethods: SavedPaymentMethod[] }>;
    return response.data.paymentMethods || [];
  },

  deletePaymentMethod: async (customerId: string, paymentMethodId: string): Promise<void> => {
    await client.queries.managePaymentMethods({
      operation: 'DELETE',
      customerId,
      paymentMethodId,
    });
  },

  setDefaultPaymentMethod: async (customerId: string, paymentMethodId: string): Promise<void> => {
    await client.queries.managePaymentMethods({
      operation: 'SET_DEFAULT',
      customerId,
      paymentMethodId,
    });
  },

  // Loyalty Points
  getPointsBalance: async (customerId: string): Promise<{ balance: number; dollarValue: string }> => {
    const response = await client.queries.manageLoyaltyPoints({
      operation: 'GET_BALANCE',
      customerId,
    }) as GraphQLResponse<{ balance: number; dollarValue: string }>;
    return response.data;
  },

  getPointsHistory: async (customerId: string): Promise<LoyaltyTransaction[]> => {
    const response = await client.queries.manageLoyaltyPoints({
      operation: 'GET_HISTORY',
      customerId,
    }) as GraphQLResponse<{ transactions: LoyaltyTransaction[] }>;
    return response.data.transactions || [];
  },
};
