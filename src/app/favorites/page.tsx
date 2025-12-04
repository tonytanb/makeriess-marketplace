'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { ProductCard } from '@/components/customer/ProductCard';
import { VendorCard } from '@/components/customer/VendorCard';
import { Header } from '@/components/customer/Header';
import { BottomNav } from '@/components/customer/BottomNav';
import { productService } from '@/lib/api/products';
import { vendorService } from '@/lib/api/vendors';
import type { Product, Vendor } from '@/lib/types/customer';
import { Heart, Store, Loader2, X } from 'lucide-react';

type ViewMode = 'products' | 'vendors';

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; type: 'product' | 'vendor'; name: string } | null>(null);

  const {
    favoriteProducts,
    favoriteVendors,
    toggleFavoriteProduct,
    toggleFavoriteVendor,
  } = useStore();

  // Load favorite products
  useEffect(() => {
    const loadFavoriteProducts = async () => {
      if (favoriteProducts.length === 0) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      try {
        const loadedProducts = await Promise.all(
          favoriteProducts.map(async (id) => {
            try {
              return await productService.getById(id);
            } catch (error) {
              console.error(`Failed to load product ${id}:`, error);
              return null;
            }
          })
        );

        setProducts(loadedProducts.filter((p): p is Product => p !== null));
      } catch (error) {
        console.error('Error loading favorite products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === 'products') {
      loadFavoriteProducts();
    }
  }, [favoriteProducts, viewMode]);

  // Load favorite vendors
  useEffect(() => {
    const loadFavoriteVendors = async () => {
      if (favoriteVendors.length === 0) {
        setVendors([]);
        return;
      }

      setIsLoading(true);
      try {
        const loadedVendors = await Promise.all(
          favoriteVendors.map(async (id) => {
            try {
              return await vendorService.getById(id);
            } catch (error) {
              console.error(`Failed to load vendor ${id}:`, error);
              return null;
            }
          })
        );

        setVendors(loadedVendors.filter((v): v is Vendor => v !== null));
      } catch (error) {
        console.error('Error loading favorite vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === 'vendors') {
      loadFavoriteVendors();
    }
  }, [favoriteVendors, viewMode]);

  const handleUnfavoriteClick = (id: string, type: 'product' | 'vendor', name: string) => {
    setItemToRemove({ id, type, name });
    setShowConfirmDialog(true);
  };

  const confirmUnfavorite = () => {
    if (!itemToRemove) return;

    if (itemToRemove.type === 'product') {
      toggleFavoriteProduct(itemToRemove.id);
      setProducts((prev) => prev.filter((p) => p.id !== itemToRemove.id));
    } else {
      toggleFavoriteVendor(itemToRemove.id);
      setVendors((prev) => prev.filter((v) => v.id !== itemToRemove.id));
    }

    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  const cancelUnfavorite = () => {
    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {viewMode === 'products'
              ? 'Products you love'
              : 'Your favorite local vendors'}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('products')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
              ${viewMode === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <Heart className="w-5 h-5" />
            Products
            {favoriteProducts.length > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${viewMode === 'products' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'}
              `}>
                {favoriteProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('vendors')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
              ${viewMode === 'vendors'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <Store className="w-5 h-5" />
            Vendors
            {favoriteVendors.length > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${viewMode === 'vendors' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'}
              `}>
                {favoriteVendors.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Products View */}
            {viewMode === 'products' && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No favorite products yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start exploring and save your favorite products
                    </p>
                    <a
                      href="/discover"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Discover Products
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} />
                        <button
                          onClick={() => handleUnfavoriteClick(product.id, 'product', product.name)}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition group"
                          title="Remove from favorites"
                        >
                          <X className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Vendors View */}
            {viewMode === 'vendors' && (
              <>
                {vendors.length === 0 ? (
                  <div className="text-center py-20">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No favorite vendors yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Discover amazing local vendors and save your favorites
                    </p>
                    <a
                      href="/discover"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Discover Vendors
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="relative">
                        <VendorCard
                          vendor={vendor}
                          showUnfavorite
                          onUnfavorite={() => handleUnfavoriteClick(vendor.id, 'vendor', vendor.businessName)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && itemToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove from favorites?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <strong>{itemToRemove.name}</strong> from your favorites?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelUnfavorite}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnfavorite}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
