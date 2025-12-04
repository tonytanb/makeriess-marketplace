'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import type { Vendor } from '@/lib/types/customer';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

interface VendorCardProps {
  vendor: Vendor;
  showUnfavorite?: boolean;
  onUnfavorite?: () => void;
  priority?: boolean;
}

export function VendorCard({ vendor, showUnfavorite, onUnfavorite, priority = false }: VendorCardProps) {
  const { toggleFavoriteVendor, isFavoriteVendor } = useStore();
  const isFavorite = isFavoriteVendor(vendor.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showUnfavorite && onUnfavorite) {
      onUnfavorite();
    } else {
      toggleFavoriteVendor(vendor.id);
    }
  };

  const logoUrl = vendor.logo || '/placeholder-vendor.jpg';

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
          {vendor.coverImage && (
            <Image
              src={vendor.coverImage}
              alt={vendor.businessName}
              fill
              className="object-cover group-hover:scale-105 transition"
              sizes={imageSizes.vendorCard}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL={generateBlurDataURL()}
              quality={85}
            />
          )}
          
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
          {/* Logo */}
          <div className="flex items-start gap-3 mb-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md -mt-8 bg-white flex-shrink-0">
              <Image
                src={logoUrl}
                alt={vendor.businessName}
                fill
                className="object-cover"
                sizes={imageSizes.vendorLogoSmall}
                loading="lazy"
                placeholder="blur"
                blurDataURL={generateBlurDataURL()}
                quality={90}
              />
            </div>
            
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {vendor.businessName}
              </h3>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-1">
                {vendor.categories.slice(0, 2).map((category) => (
                  <span
                    key={category}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {vendor.description}
            </p>
          )}

          {/* Rating & Distance */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {vendor.rating && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({vendor.reviewCount})</span>
                </div>
              )}
            </div>
            
            {vendor.distance !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{vendor.distance.toFixed(1)} mi</span>
              </div>
            )}
          </div>

          {/* Status */}
          {vendor.isPaused && (
            <div className="mt-3 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium text-center">
                Not accepting orders
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
