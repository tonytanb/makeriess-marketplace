'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, MapPin, Star, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useProduct } from '@/lib/hooks/useProducts';
import { useProductReviews } from '@/lib/hooks/useReviews';
import { useStore } from '@/lib/store/useStore';
import { Header } from '@/components/customer/Header';
import { BottomNav } from '@/components/customer/BottomNav';
import ReviewSummary from '@/components/customer/ReviewSummary';
import ReviewList from '@/components/customer/ReviewList';
import { useActivePromotions, calculatePromotionalPrice, getPromotionForProduct } from '@/lib/hooks/usePromotions';
import { PromotionBadge } from '@/components/customer/PromotionBadge';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';
import { ShareButton } from '@/components/shared/ShareButton';
import { useReferralTracking } from '@/lib/hooks/useReferralTracking';
import type { ProductShareData } from '@/lib/utils/social-sharing';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(productId);
  const { addToCart, toggleFavoriteProduct, isFavoriteProduct } = useStore();
  
  // Get current user ID for referral tracking (would come from auth in production)
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // In production, get user ID from authentication
    // For now, generate a session-based ID
    const getUserId = () => {
      let id = localStorage.getItem('makeriess_user_session');
      if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('makeriess_user_session', id);
      }
      return id;
    };
    setUserId(getUserId());
  }, []);

  // Track referrals from shared links
  useReferralTracking();

  // Fetch active promotions
  const { data: promotions = [] } = useActivePromotions(product?.vendorId, productId);
  const activePromotion = product ? getPromotionForProduct(product.id, product.vendorId, promotions) : undefined;
  const { price: finalPrice, hasPromotion } = product 
    ? calculatePromotionalPrice(product.price, activePromotion)
    : { price: 0, hasPromotion: false };

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isFavorite = product ? isFavoriteProduct(product.id) : false;

  // Prepare share data
  const shareData: ProductShareData | undefined = product ? {
    id: product.id,
    name: product.name,
    price: finalPrice,
    vendorName: product.vendor?.businessName || 'Local Vendor',
    imageUrl: product.images[0],
    description: product.description,
  } : undefined;

  const handleAddToCart = () => {
    if (product && product.isAvailable) {
      addToCart({
        ...product,
        price: finalPrice,
        originalPrice: hasPromotion ? product.price : undefined,
      }, quantity);
      // Show success feedback (could add a toast notification)
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavoriteProduct(product.id);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 99)) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl text-gray-900 mb-4">Product not found</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasTrendingBadge = product.badges?.includes('trending');
  const currentImage = product.images[currentImageIndex] || '/placeholder-product.jpg';

  // Update meta tags for social sharing
  useEffect(() => {
    if (!product) return;
    
    import('@/lib/utils/meta-tags').then(({ updateMetaTags, resetMetaTags }) => {
      updateMetaTags({
        title: `${product.name} - ${product.vendor?.businessName || 'Local Vendor'} | Makeriess`,
        description: product.description || `Get ${product.name} from ${product.vendor?.businessName || 'a local vendor'} for $${finalPrice.toFixed(2)} on Makeriess`,
        image: product.images[0],
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        type: 'product',
      });
      
      return () => {
        resetMetaTags();
      };
    });
  }, [product, finalPrice]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes={imageSizes.productDetail}
                priority
                placeholder="blur"
                blurDataURL={generateBlurDataURL()}
                quality={90}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {activePromotion && (
                  <PromotionBadge promotion={activePromotion} showCountdown={true} />
                )}
                {hasTrendingBadge && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </span>
                )}
                {product.badges?.filter(b => b !== 'trending').map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm font-bold rounded-full capitalize"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes={imageSizes.thumbnail}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={generateBlurDataURL()}
                      quality={75}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Product Name, Favorite & Share */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{product.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-red-500 transition"
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
                {shareData && (
                  <ShareButton
                    type="product"
                    data={shareData}
                    referrerId={userId}
                    variant="icon"
                  />
                )}
              </div>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <Link
                href={`/vendor/${product.vendorId}`}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition"
              >
                {product.vendor.logo && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={product.vendor.logo}
                      alt={product.vendor.businessName}
                      fill
                      className="object-cover"
                      sizes={imageSizes.vendorLogoTiny}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={generateBlurDataURL()}
                      quality={90}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {product.vendor.businessName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {product.vendor.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {product.vendor.rating.toFixed(1)}
                      </span>
                    )}
                    {product.distance !== undefined && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {product.distance.toFixed(1)} mi
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              {hasPromotion ? (
                <>
                  <div className="text-4xl font-bold text-red-600">
                    ${finalPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                      Save ${(product.price - finalPrice).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Dietary Tags */}
            {product.dietaryTags && product.dietaryTags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Dietary Information</h2>
                <div className="flex flex-wrap gap-2">
                  {product.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.inventory || 99)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`
                  w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition
                  ${product.isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <ShoppingCart className="w-6 h-6" />
                {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {product.inventory !== undefined && product.inventory < 10 && product.isAvailable && (
                <p className="text-sm text-orange-600 text-center">
                  Only {product.inventory} left in stock!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          
          {reviewsLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviewsData && reviewsData.reviews.length > 0 ? (
            <>
              <ReviewSummary 
                reviews={reviewsData.reviews} 
                totalReviews={product.reviewCount}
              />
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <ReviewList reviews={reviewsData.reviews} />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
