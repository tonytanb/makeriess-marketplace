import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/lib/api/orders';
import type { OrderStatus } from '@/lib/types/checkout';

/**
 * Hook to fetch order history for a customer
 */
export function useOrderHistory(customerId: string) {
  return useQuery({
    queryKey: ['orders', 'history', customerId],
    queryFn: () => orderService.getOrderHistory(customerId),
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for active orders
  });
}

/**
 * Hook to fetch a specific order by ID
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to update order status (vendor only)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder) => {
      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Update the specific order in cache
      queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder);
    },
  });
}

/**
 * Hook to contact vendor about an order
 */
export function useContactVendor() {
  return useMutation({
    mutationFn: ({ orderId, message }: { orderId: string; message: string }) =>
      orderService.contactVendor(orderId, message),
  });
}

/**
 * Hook to fetch orders for a vendor (vendor portal)
 */
export function useVendorOrders(vendorId: string, status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', 'vendor', vendorId, status],
    queryFn: () => orderService.getVendorOrders(vendorId, status),
    enabled: !!vendorId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for active orders
  });
}
