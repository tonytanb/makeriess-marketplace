import { Package } from 'lucide-react';

interface TopProduct {
  productId: string;
  productName: string;
  orderCount: number;
  revenue: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export function TopProductsList({ products }: TopProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No product data yet</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        {products.map((product, index) => {
          const revenuePercentage = (product.revenue / maxRevenue) * 100;

          return (
            <div key={product.productId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-gray-900">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Revenue bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${revenuePercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
