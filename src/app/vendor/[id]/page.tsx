'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MapPin, Star, ChevronLeft, Clock, Phone, Mail } from 'lucide-react';
import { useVendor, useVendorProducts } from '@/lib/hooks/useVendors';
import { useVendorReviews } from '@/lib/hooks/useReviews';
import { useStore } from '@/lib/store/useStore';
import { Header } from '@/components/customer/Header';
import { BottomNav } from '@/components/customer/BottomNav';
import { ProductGrid } from '@/components/customer/ProductGrid';
import ReviewSummary from '@/components/customer/ReviewSummary';
import ReviewList from '@/components/customer/ReviewList';
import { ShareButton } from '@/components/shared/ShareButton';
import { useReferralTracking } from '@/lib/hooks/useReferralTracking';
import type { OperatingHours } from '@/lib/types/customer';
import type { VendorShareData } from '@/lib/utils/social-sharing';

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
  const { data: products = [], isLoading: productsLoading } = useVendorProducts(vendorId);
  const { data: reviewsData, isLoading: reviewsLoading } = useVendorReviews(vendorId);
  const { toggleFavoriteVendor, isFavoriteVendor } = useStore();
  
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

  const isFavorite = vendor ? isFavoriteVendor(vendor.id) : false;

  // Prepare share data
  const shareData: VendorShareData | undefined = vendor ? {
    id: vendor.id,
    businessName: vendor.businessName,
    description: vendor.description,
    logoUrl: vendor.logo,
    rating: vendor.rating,
  } : undefined;

  const handleToggleFavorite = () => {
    if (vendor) {
      toggleFavoriteVendor(vendor.id);
    }
  };

  // Helper function to get current day's operating hours
  const getTodayHours = (operatingHours?: OperatingHours[]) => {
    if (!operatingHours || operatingHours.length === 0) return null;
    
    const today = new Date().getDay(); // 0-6 (Sunday-Saturday)
    return operatingHours.find(hours => hours.dayOfWeek === today);
  };

  // Helper function to check if vendor is currently open
  const isVendorOpen = (operatingHours?: OperatingHours[]) => {
    const todayHours = getTodayHours(operatingHours);
    if (!todayHours || todayHours.isClosed) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  };

  // Helper function to format operating hours
  const formatHours = (hours?: OperatingHours) => {
    if (!hours || hours.isClosed) return 'Closed';
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(hours.openTime)} - ${formatTime(hours.closeTime)}`;
  };

  // Helper function to get day name
  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading vendor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl text-gray-900 mb-4">Vendor not found</p>
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

  const isOpen = isVendorOpen(vendor.operatingHours);
  const todayHours = getTodayHours(vendor.operatingHours);

  // Update meta tags for social sharing
  useEffect(() => {
    if (!vendor) return;
    
    import('@/lib/utils/meta-tags').then(({ updateMetaTags, resetMetaTags }) => {
      const ratingText = vendor.rating ? ` - ${vendor.rating.toFixed(1)} ⭐` : '';
      updateMetaTags({
        title: `${vendor.businessName}${ratingText} | Makeriess`,
        description: vendor.description || `Discover amazing products from ${vendor.businessName} on Makeriess`,
        image: vendor.logo || vendor.coverImage,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        type: 'website',
      });
      
      return () => {
        resetMetaTags();
      };
    });
  }, [vendor]);

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

        {/* Cover Image */}
        {vendor.coverImage && (
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <Image
              src={vendor.coverImage}
              alt={`${vendor.businessName} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        )}

        {/* Vendor Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            {vendor.logo && (
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
                <Image
                  src={vendor.logo}
                  alt={vendor.businessName}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}

            {/* Vendor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vendor.businessName}
                  </h1>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {vendor.isPaused ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                        Not accepting orders
                      </span>
                    ) : isOpen ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        Open now
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        Currently closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Favorite & Share Buttons */}
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
                      type="vendor"
                      data={shareData}
                      referrerId={userId}
                      variant="icon"
                    />
                  )}
                </div>
              </div>

              {/* Rating & Distance */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {vendor.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {vendor.rating.toFixed(1)}
                    </span>
                    <span className="text-sm">({vendor.reviewCount} reviews)</span>
                  </div>
                )}
                
                {vendor.distance !== undefined && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-5 h-5" />
                      <span>{vendor.distance.toFixed(1)} mi away</span>
                    </div>
                  </>
                )}

                {todayHours && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      <span>{formatHours(todayHours)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Categories */}
              {vendor.categories && vendor.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {vendor.description && (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {vendor.description}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </a>
                )}
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{vendor.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        {vendor.operatingHours && vendor.operatingHours.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Operating Hours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendor.operatingHours
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((hours) => {
                  const isToday = hours.dayOfWeek === new Date().getDay();
                  return (
                    <div
                      key={hours.dayOfWeek}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
                        {getDayName(hours.dayOfWeek)}
                      </span>
                      <span className={`${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                        {formatHours(hours)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Minimum Order */}
        {vendor.minimumOrder > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900">
              <span className="font-semibold">Minimum order:</span> ${vendor.minimumOrder.toFixed(2)}
            </p>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          <ProductGrid
            products={products}
            isLoading={productsLoading}
            emptyMessage="This vendor has no products available at the moment"
          />
        </div>

        {/* Reviews Section */}
        <div className="mb-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          
          {reviewsLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviewsData && reviewsData.reviews.length > 0 ? (
            <>
              <ReviewSummary 
                reviews={reviewsData.reviews} 
                totalReviews={vendor.reviewCount}
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
