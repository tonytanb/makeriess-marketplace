'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import {
  shareProduct,
  shareVendor,
  trackShareEvent,
  isWebShareSupported,
  type ProductShareData,
  type VendorShareData,
} from '@/lib/utils/social-sharing';

interface ShareButtonProps {
  type: 'product' | 'vendor';
  data: ProductShareData | VendorShareData;
  referrerId?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export function ShareButton({
  type,
  data,
  referrerId,
  variant = 'secondary',
  className = '',
}: ShareButtonProps) {
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      let result;
      if (type === 'product') {
        result = await shareProduct(data as ProductShareData, referrerId);
      } else {
        result = await shareVendor(data as VendorShareData, referrerId);
      }

      // Track the share event
      trackShareEvent(type, data.id, result.method);

      // Show feedback for clipboard copy
      if (result.success && result.method === 'clipboard') {
        setShowCopiedFeedback(true);
        setTimeout(() => setShowCopiedFeedback(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const isNativeShareSupported = isWebShareSupported();

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          p-3 bg-white border border-gray-200 rounded-lg 
          hover:border-blue-500 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        title="Share"
        aria-label={`Share this ${type}`}
      >
        {showCopiedFeedback ? (
          <Check className="w-6 h-6 text-green-600" />
        ) : (
          <Share2 className="w-6 h-6 text-gray-600" />
        )}
      </button>
    );
  }

  // Primary variant (filled button)
  if (variant === 'primary') {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 
          bg-blue-600 text-white rounded-lg font-semibold
          hover:bg-blue-700 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {showCopiedFeedback ? (
          <>
            <Check className="w-5 h-5" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            {isNativeShareSupported ? (
              <Share2 className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
            <span>{isNativeShareSupported ? 'Share' : 'Copy Link'}</span>
          </>
        )}
      </button>
    );
  }

  // Secondary variant (outlined button)
  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 
        bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold
        hover:border-blue-500 hover:text-blue-600 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {showCopiedFeedback ? (
        <>
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-600">Link Copied!</span>
        </>
      ) : (
        <>
          {isNativeShareSupported ? (
            <Share2 className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
          <span>{isNativeShareSupported ? 'Share' : 'Copy Link'}</span>
        </>
      )}
    </button>
  );
}
