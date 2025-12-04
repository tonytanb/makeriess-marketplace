'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Clock, Package } from 'lucide-react';
import type { Product } from '@/lib/types/customer';

interface ProductListItemProps {
  product: Product;
  onToggleVisibility: (productId: string, isVisible: boolean) => Promise<void>;
  isSelected: boolean;
  onSelect: (productId: string) => void;
}

export function ProductListItem({
  product,
  onToggleVisibility,
  isSelected,
  onSelect,
}: ProductListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleVisibility = async () => {
    setIsUpdating(true);
    try {
      await onToggleVisibility(product.id, !product.isVisible);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(product.id)}
        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
      />

      {/* Product Image */}
      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
          <span className="capitalize">{product.category}</span>
          {product.inventory !== undefined && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {product.inventory} in stock
            </span>
          )}
        </div>
        {product.badges && product.badges.length > 0 && (
          <div className="flex gap-1 mt-1">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <div className="text-right">
          <div className="font-medium">
            {product.posProductId ? 'Synced' : 'Manual'}
          </div>
          <div className="text-gray-400">
            {formatDate(product.updatedAt)}
          </div>
        </div>
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={handleToggleVisibility}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          product.isVisible
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {product.isVisible ? (
          <>
            <Eye className="w-4 h-4" />
            <span>Visible</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span>Hidden</span>
          </>
        )}
      </button>
    </div>
  );
}
