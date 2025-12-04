'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Upload,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { ProductListItem } from '@/components/vendor/ProductListItem';
import { ManualProductUploadModal } from '@/components/vendor/ManualProductUploadModal';
import { CSVUploadModal } from '@/components/vendor/CSVUploadModal';
import type { Product } from '@/lib/types/customer';
import type { ManualProductData } from '@/components/vendor/ManualProductUploadModal';
import { client } from '@/lib/amplify/client';
import { getCurrentUser } from 'aws-amplify/auth';

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isManualUploadOpen, setIsManualUploadOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get current vendor ID
  useEffect(() => {
    async function loadVendorId() {
      try {
        const user = await getCurrentUser();
        setVendorId(user.userId);
      } catch (err) {
        console.error('Failed to get user:', err);
        setError('Failed to authenticate. Please log in again.');
      }
    }
    loadVendorId();
  }, []);

  // Load products
  useEffect(() => {
    if (!vendorId) return;
    loadProducts();
  }, [vendorId]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Visibility filter
    if (filterVisibility !== 'all') {
      filtered = filtered.filter((p) =>
        filterVisibility === 'visible' ? p.isVisible : !p.isVisible
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory, filterVisibility]);

  const loadProducts = async () => {
    if (!vendorId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, errors } = await client.models.Product.list({
        filter: { vendorId: { eq: vendorId } },
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to load products');
      }

      const productList = (data || []).map((item) => ({
        id: item.id,
        vendorId: item.vendorId,
        name: item.name,
        description: item.description || undefined,
        price: item.price,
        images: item.images || [],
        category: item.category,
        dietaryTags: item.dietaryTags || undefined,
        isVisible: item.isVisible ?? true,
        isAvailable: item.isAvailable ?? true,
        inventory: item.inventory || undefined,
        posProductId: item.posProductId || undefined,
        badges: item.badges || undefined,
        trendScore: item.trendScore || undefined,
        viewCount: item.viewCount || 0,
        favoriteCount: item.favoriteCount || 0,
        orderCount: item.orderCount || 0,
        rating: item.rating || undefined,
        reviewCount: item.reviewCount || 0,
        updatedAt: item.updatedAt,
      })) as Product[];

      setProducts(productList);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (productId: string, isVisible: boolean) => {
    try {
      const { errors } = await client.models.Product.update({
        id: productId,
        isVisible,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to update product');
      }

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isVisible } : p))
      );
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      alert('Failed to update product visibility');
    }
  };

  const handleBulkToggleVisibility = async (isVisible: boolean) => {
    if (selectedProducts.size === 0) return;

    try {
      const updates = Array.from(selectedProducts).map((productId) =>
        client.models.Product.update({
          id: productId,
          isVisible,
        })
      );

      await Promise.all(updates);

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          selectedProducts.has(p.id) ? { ...p, isVisible } : p
        )
      );

      setSelectedProducts(new Set());
    } catch (err) {
      console.error('Failed to bulk update:', err);
      alert('Failed to update products');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleManualUpload = async (productData: ManualProductData) => {
    if (!vendorId) return;

    try {
      const { data, errors } = await client.models.Product.create({
        vendorId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        dietaryTags: productData.dietaryTags,
        inventory: productData.inventory,
        images: productData.images,
        isVisible: true,
        isAvailable: true,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to create product');
      }

      // Reload products
      await loadProducts();
    } catch (err) {
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  const handleCSVUpload = async (file: File) => {
    if (!vendorId) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const products: ManualProductData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const product: any = {};

        headers.forEach((header, index) => {
          product[header] = values[index];
        });

        // Parse and validate
        if (!product.name || !product.price || !product.category || !product.imageUrl) {
          throw new Error(`Invalid data at line ${i + 1}: missing required fields`);
        }

        products.push({
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price),
          category: product.category,
          dietaryTags: product.dietaryTags
            ? product.dietaryTags.split(',').map((t: string) => t.trim())
            : [],
          inventory: product.inventory ? parseInt(product.inventory) : undefined,
          images: [product.imageUrl],
        });
      }

      // Create all products
      const creates = products.map((p) =>
        client.models.Product.create({
          vendorId,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          dietaryTags: p.dietaryTags,
          inventory: p.inventory,
          images: p.images,
          isVisible: true,
          isAvailable: true,
        })
      );

      await Promise.all(creates);

      // Reload products
      await loadProducts();
    } catch (err) {
      console.error('Failed to upload CSV:', err);
      throw err;
    }
  };

  const handleSyncPOS = async () => {
    if (!vendorId) return;

    setIsSyncing(true);
    try {
      const { data, errors } = await client.mutations.syncPOSProducts({
        vendorId,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to sync products');
      }

      alert(
        `Sync complete!\nAdded: ${data?.productsAdded || 0}\nUpdated: ${data?.productsUpdated || 0}\nRemoved: ${data?.productsRemoved || 0}`
      );

      // Reload products
      await loadProducts();
    } catch (err) {
      console.error('Failed to sync POS:', err);
      alert('Failed to sync products from POS');
    } finally {
      setIsSyncing(false);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog and visibility
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncPOS}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync POS</span>
          </button>
          <button
            onClick={() => setIsCSVUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => setIsManualUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {products.length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Visible</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {products.filter((p) => p.isVisible).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Hidden</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">
            {products.filter((p) => !p.isVisible).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">POS Synced</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {products.filter((p) => p.posProductId).length}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={filterVisibility}
            onChange={(e) =>
              setFilterVisibility(e.target.value as 'all' | 'visible' | 'hidden')
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-900">
            {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''}{' '}
            selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkToggleVisibility(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Show Selected</span>
            </button>
            <button
              onClick={() => handleBulkToggleVisibility(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              <span>Hide Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredProducts.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedProducts.size === filteredProducts.length &&
                filteredProducts.length > 0
              }
              onChange={handleSelectAll}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span>Select all {filteredProducts.length} products</span>
          </label>
        </div>
      )}

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {products.length === 0 ? 'No products yet' : 'No products match your filters'}
          </h2>
          <p className="text-gray-600 mb-6">
            {products.length === 0
              ? 'Add your first product to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setIsManualUploadOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onToggleVisibility={handleToggleVisibility}
              isSelected={selectedProducts.has(product.id)}
              onSelect={handleSelectProduct}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ManualProductUploadModal
        isOpen={isManualUploadOpen}
        onClose={() => setIsManualUploadOpen(false)}
        onSubmit={handleManualUpload}
      />

      <CSVUploadModal
        isOpen={isCSVUploadOpen}
        onClose={() => setIsCSVUploadOpen(false)}
        onUpload={handleCSVUpload}
      />
    </div>
  );
}
