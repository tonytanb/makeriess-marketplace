'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { generateBlurDataURL } from '@/lib/utils/image-optimization';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
}

/**
 * OptimizedImage Component
 * 
 * Wrapper around Next.js Image with:
 * - Automatic blur placeholder
 * - Error handling with fallback
 * - Loading states
 * - Optimized defaults
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showLoadingSpinner = false,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Add blur placeholder if not provided and not SVG
  const imageProps = {
    ...props,
    src: imgSrc,
    alt,
    className: `${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`,
    onError: handleError,
    onLoadingComplete: handleLoadingComplete,
  };

  // Add blur placeholder for non-SVG images
  if (!imageProps.placeholder && !imgSrc.endsWith('.svg')) {
    imageProps.placeholder = 'blur';
    imageProps.blurDataURL = generateBlurDataURL();
  }

  return (
    <div className="relative">
      <Image {...imageProps} />
      
      {/* Loading spinner */}
      {showLoadingSpinner && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
