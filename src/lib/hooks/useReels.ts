import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { reelsService, type GetReelsParams, type TrackStoryViewParams, type InteractWithStoryParams } from '@/lib/api/reels';

/**
 * Hook to fetch reels feed with infinite scroll support
 */
export function useReels(params: Omit<GetReelsParams, 'nextToken'>) {
  return useInfiniteQuery({
    queryKey: ['reels', params],
    queryFn: ({ pageParam }) =>
      reelsService.getReels({
        ...params,
        nextToken: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextToken,
    initialPageParam: undefined as string | undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to track story view
 */
export function useTrackStoryView() {
  return useMutation({
    mutationFn: (params: TrackStoryViewParams) => reelsService.trackStoryView(params),
  });
}

/**
 * Hook to interact with story
 */
export function useInteractWithStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InteractWithStoryParams) => reelsService.interactWithStory(params),
    onSuccess: (data) => {
      // Invalidate reels query to refresh counts
      queryClient.invalidateQueries({ queryKey: ['reels'] });

      // Handle redirect if provided
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
  });
}

/**
 * Hook to sync social content (admin only)
 */
export function useSyncSocialContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId?: string) => reelsService.syncSocialContent(vendorId),
    onSuccess: () => {
      // Invalidate reels query to show new stories
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}
