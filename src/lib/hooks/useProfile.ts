/**
 * React hooks for customer profile management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type ProfileUpdateInput, type AddressInput } from '@/lib/api/profile';

export function useCustomerProfile(customerId: string | undefined) {
  return useQuery({
    queryKey: ['profile', customerId],
    queryFn: () => profileService.getProfile(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileUpdate: ProfileUpdateInput) =>
      profileService.updateProfile(customerId, profileUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', customerId] });
    },
  });
}

export function useSavedAddresses(customerId: string | undefined) {
  return useQuery({
    queryKey: ['addresses', customerId],
    queryFn: () => profileService.listAddresses(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: AddressInput) =>
      profileService.addAddress(customerId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
  });
}

export function useUpdateAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, address }: { addressId: string; address: AddressInput }) =>
      profileService.updateAddress(customerId, addressId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
  });
}

export function useDeleteAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      profileService.deleteAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
  });
}

export function useSetDefaultAddress(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      profileService.setDefaultAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
  });
}

export function usePaymentMethods(customerId: string | undefined) {
  return useQuery({
    queryKey: ['paymentMethods', customerId],
    queryFn: () => profileService.listPaymentMethods(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeletePaymentMethod(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      profileService.deletePaymentMethod(customerId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', customerId] });
    },
  });
}

export function useSetDefaultPaymentMethod(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      profileService.setDefaultPaymentMethod(customerId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', customerId] });
    },
  });
}

export function useLoyaltyPoints(customerId: string | undefined) {
  return useQuery({
    queryKey: ['loyaltyPoints', customerId],
    queryFn: () => profileService.getPointsBalance(customerId!),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useLoyaltyHistory(customerId: string | undefined) {
  return useQuery({
    queryKey: ['loyaltyHistory', customerId],
    queryFn: () => profileService.getPointsHistory(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}
