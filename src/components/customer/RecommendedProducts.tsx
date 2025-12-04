'use client';

import { useRecommendedProducts } from '@/lib/hooks/useProducts';
import { ProductCard } from './ProductCard';
import type { Location } from '@/lib/types/customer';

interface RecommendedProductsProps {
  customerId: string;
  location: Location;
}

export function RecommendedProducts({ customerId, location }: RecommendedProductsProps) {
  const { data: products, isLoading, error } = useRecommendedProducts(customerId, location, 10);

  if (error) {
    return null; // Silently fail for non-critical feature
  }

  if (isLoading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended for You</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended for You</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
