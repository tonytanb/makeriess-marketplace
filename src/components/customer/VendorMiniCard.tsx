'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, MapPin, Star, ArrowRight } from 'lucide-react';
import type { Vendor } from '@/lib/types/customer';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

interface VendorMiniCardProps {
  vendor: Vendor;
  onClose: () => void;
}

export function VendorMiniCard({ vendor, onClose }: VendorMiniCardProps) {
  const logoUrl = vendor.logo || '/placeholder-vendor.jpg';
  
  // Get first 2 featured products (if available)
  const featuredProducts = vendor.categories.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      {/* Cover Image */}
      <div className="relative h-24 bg-gradient-to-br from-blue-500 to-purple-600">
        {vendor.coverImage && (
          <Image
            src={vendor.coverImage}
            alt={vendor.businessName}
            fill
            className="object-cover"
            sizes={imageSizes.miniCard}
            loading="lazy"
            placeholder="blur"
            blurDataURL={generateBlurDataURL()}
            quality={85}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Logo and Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-md -mt-10 bg-white flex-shrink-0">
            <Image
              src={logoUrl}
              alt={vendor.businessName}
              fill
              className="object-cover"
              sizes={imageSizes.vendorLogoTiny}
              loading="lazy"
              placeholder="blur"
              blurDataURL={generateBlurDataURL()}
              quality={90}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {vendor.businessName}
            </h3>
            
            {/* Rating & Distance */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {vendor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
              )}
              {vendor.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{vendor.distance.toFixed(1)} mi</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {vendor.description}
          </p>
        )}

        {/* Categories */}
        {featuredProducts.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Categories:</p>
            <div className="flex flex-wrap gap-1">
              {featuredProducts.map((category) => (
                <span
                  key={category}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {vendor.isPaused && (
          <div className="mb-3 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium text-center">
              Not accepting orders
            </p>
          </div>
        )}

        {/* View Vendor Button */}
        <Link
          href={`/vendor/${vendor.id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
        >
          View Vendor
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
