import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type CreateReviewInput, type UpdateVendorResponseInput } from '@/lib/api/reviews';

export function useProductReviews(productId: string, limit = 10) {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: () => reviewService.getByProduct(productId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVendorReviews(vendorId: string, limit = 10) {
  return useQuery({
    queryKey: ['reviews', 'vendor', vendorId],
    queryFn: () => reviewService.getByVendor(vendorId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.create(input),
    onSuccess: (data) => {
      // Invalidate product and vendor reviews
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'product', data.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviews', 'vendor', data.vendorId] });
      
      // Invalidate product and vendor data to update ratings
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['products', data.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ['vendors', data.vendorId] });
    },
  });
}

export function useUpdateVendorResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateVendorResponseInput) => reviewService.updateVendorResponse(input),
    onSuccess: (data) => {
      // Invalidate reviews
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'product', data.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviews', 'vendor', data.vendorId] });
    },
  });
}
