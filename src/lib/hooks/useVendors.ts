import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService, type GetNearbyVendorsParams } from '@/lib/api/vendors';
import { isDemoMode, mockAPI } from '@/lib/mock/api';

export function useNearbyVendors(params: GetNearbyVendorsParams) {
  return useQuery({
    queryKey: ['vendors', 'nearby', params],
    queryFn: () => {
      if (isDemoMode()) {
        return mockAPI.getNearbyVendors(params);
      }
      return vendorService.getNearby(params);
    },
    enabled: !!params.location.latitude && !!params.location.longitude,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId],
    queryFn: () => {
      if (isDemoMode()) {
        return mockAPI.getVendor(vendorId);
      }
      return vendorService.getById(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVendorProducts(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId, 'products'],
    queryFn: () => {
      if (isDemoMode()) {
        return mockAPI.getVendorProducts(vendorId);
      }
      return vendorService.getProducts(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVendorDashboard(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId, 'dashboard'],
    queryFn: () => vendorService.getDashboard(vendorId),
    enabled: !!vendorId,
    refetchInterval: 60 * 1000, // Refresh every minute
    staleTime: 30 * 1000, // Consider stale after 30 seconds
  });
}

export function useToggleVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, isPaused }: { vendorId: string; isPaused: boolean }) =>
      vendorService.toggleStatus(vendorId, isPaused),
    onSuccess: (data, variables) => {
      // Invalidate vendor queries
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.vendorId, 'dashboard'] });
    },
  });
}

export function usePOSConnection(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId, 'pos-connection'],
    queryFn: () => vendorService.getPOSConnection(vendorId),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConnectPOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.connectPOS,
    onSuccess: (data, variables) => {
      // Invalidate POS connection and vendor queries
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.vendorId, 'pos-connection'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.vendorId] });
    },
  });
}

export function useSyncPOSProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => vendorService.syncPOSProducts(vendorId),
    onSuccess: (data, vendorId) => {
      // Invalidate product and POS connection queries
      queryClient.invalidateQueries({ queryKey: ['vendors', vendorId, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', vendorId, 'pos-connection'] });
    },
  });
}

export function useSyncLogs(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId, 'sync-logs'],
    queryFn: () => vendorService.getSyncLogs(vendorId),
    enabled: !!vendorId,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useDisconnectPOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => vendorService.disconnectPOS(vendorId),
    onSuccess: (data, vendorId) => {
      // Invalidate POS connection and vendor queries
      queryClient.invalidateQueries({ queryKey: ['vendors', vendorId, 'pos-connection'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', vendorId] });
    },
  });
}
