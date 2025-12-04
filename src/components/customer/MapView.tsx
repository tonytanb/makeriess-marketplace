'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Vendor } from '@/lib/types/customer';
import { VendorMiniCard } from './VendorMiniCard';

// Note: In production, this should be stored in environment variables
// For Amazon Location Service integration, you would use AWS credentials
// For now, using Mapbox as a simpler implementation
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  vendors: Vendor[];
  center: [number, number]; // [longitude, latitude]
  zoom?: number;
  onVendorClick?: (vendor: Vendor) => void;
}

export function MapView({ vendors, center, zoom = 12, onVendorClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    const userMarker = document.createElement('div');
    userMarker.className = 'user-location-marker';
    userMarker.style.width = '20px';
    userMarker.style.height = '20px';
    userMarker.style.borderRadius = '50%';
    userMarker.style.backgroundColor = '#3b82f6';
    userMarker.style.border = '3px solid white';
    userMarker.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(userMarker)
      .setLngLat(center)
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  // Update vendor markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add vendor markers
    vendors.forEach((vendor) => {
      if (!map.current) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'vendor-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'white';
      el.style.border = '3px solid #8b5cf6';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '20px';
      el.style.transition = 'transform 0.2s';

      // Add vendor logo or initial
      if (vendor.logo) {
        el.style.backgroundImage = `url(${vendor.logo})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      } else {
        el.textContent = vendor.businessName.charAt(0).toUpperCase();
        el.style.fontWeight = 'bold';
        el.style.color = '#8b5cf6';
      }

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([vendor.location.longitude, vendor.location.latitude])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedVendor(vendor);
        
        // Get marker position on screen
        const point = map.current!.project([vendor.location.longitude, vendor.location.latitude]);
        setPopupPosition({ x: point.x, y: point.y });

        if (onVendorClick) {
          onVendorClick(vendor);
        }
      });

      markers.current.push(marker);
    });
  }, [vendors, onVendorClick]);

  // Close popup when clicking on map
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = () => {
      setSelectedVendor(null);
      setPopupPosition(null);
    };

    map.current.on('click', handleMapClick);

    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Vendor Mini Card Popup */}
      {selectedVendor && popupPosition && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 20}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="pointer-events-auto">
            <VendorMiniCard
              vendor={selectedVendor}
              onClose={() => {
                setSelectedVendor(null);
                setPopupPosition(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
          <span className="text-gray-700">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-purple-600"></div>
          <span className="text-gray-700">Vendors</span>
        </div>
      </div>

      {/* No Token Warning */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Map Configuration Required
            </h3>
            <p className="text-gray-600 text-sm">
              Please set the NEXT_PUBLIC_MAPBOX_TOKEN environment variable to enable the map view.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
