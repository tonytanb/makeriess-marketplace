'use client';

import { useState } from 'react';
import type { Story } from '@/lib/api/reels';

interface ReelsActionButtonsProps {
  story: Story;
  onInteraction: (action: 'LIKE' | 'SHARE' | 'SHOP_NOW' | 'VISIT_VENDOR') => void;
}

export function ReelsActionButtons({ story, onInteraction }: ReelsActionButtonsProps) {
  const [liked, setLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(story.likeCount);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLocalLikeCount((prev) => prev + 1);
      onInteraction('LIKE');
    }
  };

  const handleShare = async () => {
    onInteraction('SHARE');

    // Use Web Share API if available
    if (navigator.share && story.externalUrl) {
      try {
        await navigator.share({
          title: `Check out ${story.vendor?.businessName || 'this vendor'} on Makeriess`,
          text: story.caption || '',
          url: story.externalUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else if (story.externalUrl) {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(story.externalUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleShopNow = () => {
    onInteraction('SHOP_NOW');
  };

  const handleVisitVendor = () => {
    onInteraction('VISIT_VENDOR');
  };

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-6">
      {/* Like button */}
      <button
        onClick={handleLike}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          liked ? 'bg-red-500' : 'bg-black/30'
        }`}>
          <svg
            className="w-6 h-6"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">{localLikeCount}</span>
      </button>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">{story.shareCount}</span>
      </button>

      {/* Shop Now button */}
      <button
        onClick={handleShopNow}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">Shop</span>
      </button>

      {/* Visit Vendor button */}
      <button
        onClick={handleVisitVendor}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center overflow-hidden">
          {story.vendor?.logo ? (
            <img
              src={story.vendor.logo}
              alt={story.vendor.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          )}
        </div>
        <span className="text-xs font-medium">Visit</span>
      </button>
    </div>
  );
}
