'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useNearbyVendors } from '@/lib/hooks/useVendors';
import { MapPin } from 'lucide-react';
import type { Location } from '@/lib/types/customer';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

interface NearbyVendorsProps {
  location: Location;
  radiusMiles?: number;
}

export function NearbyVendors({ location, radiusMiles = 10 }: NearbyVendorsProps) {
  const { data: vendors, isLoading, error } = useNearbyVendors({
    location,
    radiusMiles,
    limit: 12,
  });

  if (error) {
    return null; // Silently fail for non-critical feature
  }

  if (isLoading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stores Near You</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!vendors || vendors.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Stores Near You</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendor/${vendor.id}`}
            className="flex-shrink-0 group"
          >
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-blue-500 transition mb-2">
                {vendor.logo ? (
                  <Image
                    src={vendor.logo}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                    sizes={imageSizes.vendorLogo}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={generateBlurDataURL()}
                    quality={90}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                    {vendor.businessName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="text-center max-w-[100px]">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition">
                  {vendor.businessName}
                </p>
                
                {/* Distance */}
                {vendor.distance !== undefined && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {vendor.distance.toFixed(1)} mi
                  </p>
                )}

                {/* Rating */}
                {vendor.rating && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    ★ {vendor.rating.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
