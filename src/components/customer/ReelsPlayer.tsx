'use client';

import { useEffect, useRef, useState } from 'react';
import type { Story } from '@/lib/api/reels';
import Link from 'next/link';

interface ReelsPlayerProps {
  story: Story;
  isActive: boolean;
  videoRef: (el: HTMLVideoElement | null) => void;
  onStart: () => void;
  onComplete: (duration: number) => void;
}

export function ReelsPlayer({ story, isActive, videoRef, onStart, onComplete }: ReelsPlayerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number>(0);
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  // Handle video ref
  useEffect(() => {
    videoRef(internalVideoRef.current);
  }, [videoRef]);

  // Handle play/pause based on active state
  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isActive]);

  // Track video start
  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
      startTimeRef.current = Date.now();
      onStart();
    }
    setIsPlaying(true);
  };

  // Track video pause
  const handlePause = () => {
    setIsPlaying(false);
  };

  // Track video completion
  const handleEnded = () => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    onComplete(duration);
    setIsPlaying(false);
  };

  // Toggle play/pause on tap
  const handleTap = () => {
    const video = internalVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  // Check if story is expired
  const isExpired = new Date(story.expiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <p className="text-white text-lg">This story has expired</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      {/* Video */}
      <video
        ref={internalVideoRef}
        src={story.videoUrl}
        poster={story.thumbnailUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        preload="auto"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onClick={handleTap}
      />

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

      {/* Story info */}
      <div className="absolute bottom-20 left-4 right-20 text-white pointer-events-none">
        {/* Vendor info */}
        <Link
          href={`/vendor/${story.vendorId}`}
          className="flex items-center gap-2 mb-3 pointer-events-auto"
        >
          {story.vendor?.logo && (
            <img
              src={story.vendor.logo}
              alt={story.vendor.businessName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          )}
          <div>
            <p className="font-semibold text-sm">{story.vendor?.businessName || 'Unknown Vendor'}</p>
            <p className="text-xs text-gray-300">
              {story.platform === 'TIKTOK' && 'TikTok'}
              {story.platform === 'INSTAGRAM' && 'Instagram'}
              {story.platform === 'MAKERIES_OFFICIAL' && 'Makeries Official'}
            </p>
          </div>
        </Link>

        {/* Caption */}
        {story.caption && (
          <p className="text-sm line-clamp-3 mb-2">{story.caption}</p>
        )}

        {/* Original post link */}
        {story.externalUrl && (
          <a
            href={story.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-300 underline pointer-events-auto"
          >
            View original post
          </a>
        )}
      </div>

      {/* Play/Pause indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
