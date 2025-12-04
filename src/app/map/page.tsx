'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { useNearbyVendors } from '@/lib/hooks/useVendors';
import type { Location } from '@/lib/types/customer';

// Dynamically import MapView to reduce initial bundle size
const MapView = dynamic(
  () => import('@/components/customer/MapView').then((mod) => mod.MapView),
  {
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for map component
  }
);

export default function MapPage() {
  const { selectedAddress, currentLocation, setCurrentLocation } = useStore();
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Get user's current location or use selected address
  useEffect(() => {
    if (currentLocation) {
      setUserLocation(currentLocation);
      setMapCenter([currentLocation.longitude, currentLocation.latitude]);
    } else if (selectedAddress) {
      // In a real app, you would geocode the address to get coordinates
      // For now, using a default location (Columbus, OH)
      const defaultLocation: Location = {
        latitude: 39.9612,
        longitude: -82.9988,
      };
      setUserLocation(defaultLocation);
      setMapCenter([defaultLocation.longitude, defaultLocation.latitude]);
      setCurrentLocation(defaultLocation);
    } else {
      // Try to get user's geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserLocation(location);
            setMapCenter([location.longitude, location.latitude]);
            setCurrentLocation(location);
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Fallback to default location
            const defaultLocation: Location = {
              latitude: 39.9612,
              longitude: -82.9988,
            };
            setUserLocation(defaultLocation);
            setMapCenter([defaultLocation.longitude, defaultLocation.latitude]);
            setCurrentLocation(defaultLocation);
          }
        );
      } else {
        // Geolocation not supported, use default
        const defaultLocation: Location = {
          latitude: 39.9612,
          longitude: -82.9988,
        };
        setUserLocation(defaultLocation);
        setMapCenter([defaultLocation.longitude, defaultLocation.latitude]);
        setCurrentLocation(defaultLocation);
      }
    }
  }, [selectedAddress, currentLocation, setCurrentLocation]);

  // Fetch nearby vendors
  const {
    data: vendors,
    isLoading,
    error,
  } = useNearbyVendors({
    location: userLocation || { latitude: 0, longitude: 0 },
    radiusMiles: 10,
    limit: 50,
  });

  if (!mapCenter) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Vendors
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred while loading vendors.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h1 className="text-lg font-semibold text-gray-900">Nearby Vendors</h1>
        </div>
        
        {selectedAddress && (
          <div className="text-sm text-gray-600">
            {selectedAddress.label && (
              <span className="font-medium">{selectedAddress.label}: </span>
            )}
            {selectedAddress.street}, {selectedAddress.city}
          </div>
        )}
      </div>

      {/* Vendor Count */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
        <p className="text-sm text-blue-800">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading vendors...
            </span>
          ) : (
            <>
              <span className="font-semibold">{vendors?.length || 0}</span> vendor
              {vendors?.length !== 1 ? 's' : ''} found within 10 miles
            </>
          )}
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading vendors...</p>
            </div>
          </div>
        ) : (
          <MapView
            vendors={vendors || []}
            center={mapCenter}
            zoom={12}
          />
        )}
      </div>
    </div>
  );
}
