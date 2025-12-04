'use client';

import { TopProduct } from '@/lib/hooks/useAnalytics';
import { Package, Eye, Heart, ShoppingCart, DollarSign } from 'lucide-react';

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No product data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products by Revenue</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Views</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>Favorites</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart Adds</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Orders</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Revenue</span>
                </div>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.productId}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {index + 1}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.productName || `Product ${product.productId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-500">ID: {product.productId.slice(0, 12)}...</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-700">
                  {product.views.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-700">
                  {product.favorites.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-700">
                  {product.cartAdds.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-sm font-medium text-gray-900">
                  {product.orders.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">
                  ${product.revenue.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.conversionRate >= 5
                      ? 'bg-green-100 text-green-700'
                      : product.conversionRate >= 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.conversionRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing top {products.length} products</span>
          <span>
            Total Revenue: <span className="font-semibold text-gray-900">
              ${products.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
