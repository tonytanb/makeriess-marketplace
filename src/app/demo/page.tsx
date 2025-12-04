'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestTube2, ShoppingBag, Store, MapPin, Heart, Package } from 'lucide-react';
import { enableDemoMode } from '@/lib/mock/api';

export default function DemoPage() {
  const router = useRouter();

  const startDemo = () => {
    enableDemoMode();
    // Small delay to ensure localStorage is set
    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-full mb-6">
            <TestTube2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Makeriess Demo
          </h1>
          <p className="text-xl text-gray-600">
            Explore the full marketplace experience with realistic mock data
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <ShoppingBag className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browse Products
            </h3>
            <p className="text-gray-600">
              Explore curated products from local makers, crafters, and food vendors
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Store className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Discover Vendors
            </h3>
            <p className="text-gray-600">
              Find amazing local businesses and see their full product catalogs
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <MapPin className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Map View
            </h3>
            <p className="text-gray-600">
              See nearby vendors on an interactive map with delivery radius
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Heart className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Save Favorites
            </h3>
            <p className="text-gray-600">
              Bookmark your favorite products and vendors for quick access
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Package className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Orders
            </h3>
            <p className="text-gray-600">
              View order history and track deliveries in real-time
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <TestTube2 className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Full Experience
            </h3>
            <p className="text-gray-600">
              All features work with realistic mock data - no backend required
            </p>
          </div>
        </div>

        {/* Demo Data Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            What's Included in Demo Mode:
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>3 local vendors with unique products and profiles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>5+ products across different categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Sample orders with different statuses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Customer reviews and ratings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Active promotions and discounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Shopping cart with localStorage persistence</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={startDemo}
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
          >
            <TestTube2 className="h-6 w-6" />
            Start Demo Experience
          </button>
          <p className="mt-4 text-sm text-gray-600">
            You can toggle between demo and live mode anytime using the button in the bottom-right corner
          </p>
        </div>
      </div>
    </div>
  );
}
