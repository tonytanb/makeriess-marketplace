'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useReels, useTrackStoryView, useInteractWithStory } from '@/lib/hooks/useReels';
import { useStore } from '@/lib/store/useStore';
import type { Story } from '@/lib/api/reels';

// Dynamically import heavy video components
const ReelsPlayer = dynamic(
  () => import('@/components/customer/ReelsPlayer').then((mod) => ({ default: mod.ReelsPlayer })),
  { ssr: false }
);

const ReelsActionButtons = dynamic(
  () => import('@/components/customer/ReelsActionButtons').then((mod) => ({ default: mod.ReelsActionButtons })),
  { ssr: false }
);

export default function ReelsPage() {
  const { deliveryAddress } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Get user location from delivery address
  const location = deliveryAddress?.latitude && deliveryAddress?.longitude
    ? {
        latitude: deliveryAddress.latitude,
        longitude: deliveryAddress.longitude,
        radiusMiles: 25,
      }
    : undefined;

  // Fetch reels
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useReels({
    ...location,
    limit: 10,
  });

  const trackStoryView = useTrackStoryView();
  const interactWithStory = useInteractWithStory();

  // Flatten all stories from pages
  const stories = data?.pages.flatMap((page) => page.stories) || [];

  // Track when video starts playing
  const handleVideoStart = useCallback((story: Story) => {
    trackStoryView.mutate({
      storyId: story.id,
      watchDuration: 0,
      completed: false,
    });
  }, [trackStoryView]);

  // Track when video completes
  const handleVideoComplete = useCallback((story: Story, watchDuration: number) => {
    trackStoryView.mutate({
      storyId: story.id,
      watchDuration,
      completed: true,
    });
  }, [trackStoryView]);

  // Handle story interaction
  const handleInteraction = useCallback((storyId: string, action: 'LIKE' | 'SHARE' | 'SHOP_NOW' | 'VISIT_VENDOR') => {
    interactWithStory.mutate({ storyId, action });
  }, [interactWithStory]);

  // Handle scroll to change stories
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex && newIndex < stories.length) {
      setCurrentIndex(newIndex);

      // Pause previous video
      const prevVideo = videoRefs.current.get(stories[currentIndex]?.id);
      if (prevVideo) {
        prevVideo.pause();
      }

      // Play current video
      const currentVideo = videoRefs.current.get(stories[newIndex]?.id);
      if (currentVideo) {
        currentVideo.play();
      }

      // Fetch more if near end
      if (newIndex >= stories.length - 3 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [currentIndex, stories, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-play first video
  useEffect(() => {
    if (stories.length > 0) {
      const firstVideo = videoRefs.current.get(stories[0].id);
      if (firstVideo) {
        firstVideo.play();
      }
    }
  }, [stories]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading reels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-lg mb-2">Failed to load reels</p>
          <p className="text-sm text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-lg mb-2">No reels available</p>
          <p className="text-sm text-gray-400">Check back soon for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {stories.map((story, index) => (
        <div
          key={story.id}
          className="h-screen snap-start relative"
        >
          <ReelsPlayer
            story={story}
            isActive={index === currentIndex}
            videoRef={(el) => {
              if (el) {
                videoRefs.current.set(story.id, el);
              } else {
                videoRefs.current.delete(story.id);
              }
            }}
            onStart={() => handleVideoStart(story)}
            onComplete={(duration) => handleVideoComplete(story, duration)}
          />

          <ReelsActionButtons
            story={story}
            onInteraction={(action) => handleInteraction(story.id, action)}
          />
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="h-screen snap-start flex items-center justify-center bg-black">
          <div className="text-white text-lg">Loading more...</div>
        </div>
      )}
    </div>
  );
}
