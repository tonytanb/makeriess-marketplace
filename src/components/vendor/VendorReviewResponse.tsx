'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useUpdateVendorResponse } from '@/lib/hooks/useReviews';
import type { Review } from '@/lib/api/reviews';

interface VendorReviewResponseProps {
  review: Review;
}

export default function VendorReviewResponse({ review }: VendorReviewResponseProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState(review.vendorResponse || '');
  const updateResponse = useUpdateVendorResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      await updateResponse.mutateAsync({
        reviewId: review.id,
        vendorResponse: response.trim(),
      });
      setIsResponding(false);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Review Header */}
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
          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
        </div>
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-3">{review.comment}</p>
      )}

      {/* Vendor Response Section */}
      {review.vendorResponse && !isResponding ? (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900">Your Response</span>
            <button
              onClick={() => setIsResponding(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-gray-700">{review.vendorResponse}</p>
          {review.vendorResponseDate && (
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(review.vendorResponseDate)}
            </p>
          )}
        </div>
      ) : isResponding || !review.vendorResponse ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {review.vendorResponse ? 'Edit Your Response' : 'Respond to Review'}
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Thank the customer and address their feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">{response.length}/500</p>
            <div className="flex gap-2">
              {isResponding && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResponding(false);
                    setResponse(review.vendorResponse || '');
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={updateResponse.isPending || !response.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {updateResponse.isPending ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {!review.vendorResponse && !isResponding && (
        <button
          onClick={() => setIsResponding(true)}
          className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Respond to this review
        </button>
      )}
    </div>
  );
}
