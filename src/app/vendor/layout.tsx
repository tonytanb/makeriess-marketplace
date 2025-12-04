import { ReactNode } from 'react';

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Makeriess Vendor</h1>
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="/vendor/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Dashboard
                </a>
                <a
                  href="/vendor/orders"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Orders
                </a>
                <a
                  href="/vendor/products"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Products
                </a>
                <a
                  href="/vendor/promotions"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Promotions
                </a>
                <a
                  href="/vendor/pos"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  POS
                </a>
                <a
                  href="/vendor/analytics"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Analytics
                </a>
                <a
                  href="/vendor/settings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                View Store
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
