'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, TrendingUp, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import type { Product } from '@/lib/types/customer';
import { useActivePromotions, calculatePromotionalPrice, getPromotionForProduct } from '@/lib/hooks/usePromotions';
import { PromotionBadge } from './PromotionBadge';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const { addToCart, toggleFavoriteProduct, isFavoriteProduct } = useStore();
  const isFavorite = isFavoriteProduct(product.id);

  // Fetch active promotions for this vendor
  const { data: promotions = [] } = useActivePromotions(product.vendorId);
  const activePromotion = getPromotionForProduct(product.id, product.vendorId, promotions);
  const { price: finalPrice, hasPromotion } = calculatePromotionalPrice(product.price, activePromotion);

  // Determine loading strategy based on position
  const shouldPrioritize = priority || index < 4;
  const loadingStrategy = shouldPrioritize ? 'eager' : 'lazy';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add product with promotional price if applicable
    addToCart({
      ...product,
      price: finalPrice,
      originalPrice: hasPromotion ? product.price : undefined,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteProduct(product.id);
  };

  const hasTrendingBadge = product.badges?.includes('trending');
  const imageUrl = product.images[0] || '/placeholder-product.jpg';

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition"
            sizes={imageSizes.productCard}
            priority={shouldPrioritize}
            loading={loadingStrategy}
            placeholder="blur"
            blurDataURL={generateBlurDataURL()}
            quality={85}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {activePromotion && (
              <PromotionBadge promotion={activePromotion} showCountdown={true} />
            )}
            {hasTrendingBadge && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
            {product.badges?.filter(b => b !== 'trending').map((badge) => (
              <span
                key={badge}
                className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full capitalize"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>

          {/* Vendor & Distance */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <span className="truncate">{product.vendor?.businessName}</span>
            {product.distance !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 whitespace-nowrap">
                  <MapPin className="w-3 h-3" />
                  {product.distance.toFixed(1)} mi
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              {hasPromotion ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm transition
                ${product.isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.isAvailable ? 'Add' : 'Sold Out'}
            </button>
          </div>

          {/* Dietary Tags */}
          {product.dietaryTags && product.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.dietaryTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
