'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/auth-service';
import { useStore } from '@/lib/store/useStore';
import { isDemoMode } from '@/lib/mock/api';
import { useProductSearch } from '@/lib/hooks/useProducts';
import { Header } from '@/components/customer/Header';
import { AddressSelector } from '@/components/customer/AddressSelector';
import { DeliveryToggle } from '@/components/customer/DeliveryToggle';
import { ScheduleSelector } from '@/components/customer/ScheduleSelector';
import { SearchBar } from '@/components/customer/SearchBar';
import { CategoryStrip } from '@/components/customer/CategoryStrip';
import { SortDropdown } from '@/components/customer/SortDropdown';
import { DietaryFilter } from '@/components/customer/DietaryFilter';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { RecommendedProducts } from '@/components/customer/RecommendedProducts';
import { NearbyVendors } from '@/components/customer/NearbyVendors';
import { BottomNav } from '@/components/customer/BottomNav';
import type { ProductSortOption } from '@/lib/types/customer';

export default function HomePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const { currentLocation, dietaryPreferences, setDietaryPreferences } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ProductSortOption>('DISTANCE');
  const [activeDietaryTags, setActiveDietaryTags] = useState<string[]>(dietaryPreferences);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication
  useEffect(() => {
    if (!mounted) return;

    async function checkAuth() {
      // ALWAYS USE DEMO MODE FOR NOW (until backend is deployed)
      console.log('🎭 Running in demo mode');
      setUserId('demo-user-1');
      setIsAuthLoading(false);
    }
    checkAuth();
  }, [mounted]);

  // Search products
  const { data: searchResults, isLoading: isSearching } = useProductSearch({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    dietaryTags: activeDietaryTags.length > 0 ? activeDietaryTags : undefined,
    location: currentLocation || { latitude: 39.9612, longitude: -82.9988 }, // Default to Columbus, OH
    radiusMiles: 10,
    sortBy,
    limit: 20,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: ProductSortOption) => {
    setSortBy(sort);
  };

  const handleDietaryTagsChange = (tags: string[]) => {
    setActiveDietaryTags(tags);
  };

  const handleSaveDietaryPreferences = (tags: string[]) => {
    setDietaryPreferences(tags);
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Address & Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <AddressSelector />
          <DeliveryToggle />
          <ScheduleSelector />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Category Strip */}
        <CategoryStrip
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Recommended Products Section */}
        {userId && currentLocation && !searchQuery && !selectedCategory && (
          <div className="mt-6">
            <RecommendedProducts customerId={userId} location={currentLocation} />
          </div>
        )}

        {/* Nearby Vendors Section */}
        {currentLocation && !searchQuery && !selectedCategory && (
          <div className="mt-6">
            <NearbyVendors location={currentLocation} radiusMiles={10} />
          </div>
        )}

        {/* Products Section */}
        <div className="mt-8">
          {/* Section Header with Sort and Dietary Filter */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory
                ? 'Products'
                : 'All Products'}
            </h2>
            <div className="flex items-center gap-3">
              <DietaryFilter
                selectedTags={activeDietaryTags}
                onTagsChange={handleDietaryTagsChange}
                onSavePreferences={handleSaveDietaryPreferences}
                showSaveButton={true}
              />
              <SortDropdown selectedSort={sortBy} onSelectSort={handleSortChange} />
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={searchResults?.items || []}
            isLoading={isSearching}
            emptyMessage={
              searchQuery
                ? 'No products found for your search'
                : selectedCategory
                ? 'No products found in this category'
                : 'No products available in your area'
            }
          />

          {/* Load More */}
          {searchResults?.nextToken && (
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Load More
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
