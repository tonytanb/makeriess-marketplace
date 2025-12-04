'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import ReviewForm from './ReviewForm';

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
}

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  vendorId: string;
  orderId: string;
  items: OrderItem[];
}

export default function ReviewPromptModal({
  isOpen,
  onClose,
  customerId,
  vendorId,
  orderId,
  items,
}: ReviewPromptModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleReviewSuccess = () => {
    if (selectedProduct) {
      setReviewedProducts(new Set([...reviewedProducts, selectedProduct.productId]));
      setSelectedProduct(null);
    }
  };

  const remainingItems = items.filter(
    (item) => !reviewedProducts.has(item.productId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedProduct ? 'Write a Review' : 'How was your order?'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedProduct ? (
            // Review Form
            <ReviewForm
              customerId={customerId}
              productId={selectedProduct.productId}
              vendorId={vendorId}
              orderId={orderId}
              productName={selectedProduct.productName}
              onSuccess={handleReviewSuccess}
              onCancel={() => setSelectedProduct(null)}
            />
          ) : remainingItems.length > 0 ? (
            // Product Selection
            <div>
              <p className="text-gray-600 mb-6">
                Select a product to review:
              </p>
              <div className="space-y-3">
                {remainingItems.map((item) => (
                  <button
                    key={item.productId}
                    onClick={() => setSelectedProduct(item)}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // All Reviewed
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank you for your reviews!
              </h3>
              <p className="text-gray-600 mb-6">
                Your feedback helps other customers make better decisions.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
