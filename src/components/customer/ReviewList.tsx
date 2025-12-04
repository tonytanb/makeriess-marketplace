'use client';

import { Star } from 'lucide-react';
import { getUrl } from 'aws-amplify/storage';
import { useEffect, useState } from 'react';
import type { Review } from '@/lib/api/reviews';

interface ReviewListProps {
  reviews: Review[];
  showVendorResponse?: boolean;
}

interface ReviewItemProps {
  review: Review;
  showVendorResponse?: boolean;
}

function ReviewItem({ review, showVendorResponse = true }: ReviewItemProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (review.images && review.images.length > 0) {
        const urls = await Promise.all(
          review.images.map(async (key) => {
            try {
              const result = await getUrl({ key });
              return result.url.toString();
            } catch (error) {
              console.error('Failed to load image:', error);
              return '';
            }
          })
        );
        setImageUrls(urls.filter(Boolean));
      }
    };

    loadImages();
  }, [review.images]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              {review.customer?.name || 'Anonymous'}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-3">{review.comment}</p>
      )}

      {/* Images */}
      {imageUrls.length > 0 && (
        <div className="flex gap-2 mb-3">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Review image ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Vendor Response */}
      {showVendorResponse && review.vendorResponse && (
        <div className="mt-4 ml-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Vendor Response
            </span>
            {review.vendorResponseDate && (
              <span className="text-xs text-gray-500">
                {formatDate(review.vendorResponseDate)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{review.vendorResponse}</p>
        </div>
      )}
    </div>
  );
}

export default function ReviewList({ reviews, showVendorResponse = true }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          showVendorResponse={showVendorResponse}
        />
      ))}
    </div>
  );
}
