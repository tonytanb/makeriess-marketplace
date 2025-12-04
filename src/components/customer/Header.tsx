'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Package } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { CartDrawer } from '@/components/cart';

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = useStore((state) => state.getCartItemCount());

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/discover" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">makeries</h1>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Orders */}
              <Link
                href="/orders"
                className="p-2 text-gray-600 hover:text-gray-900 transition"
                aria-label="View orders"
              >
                <Package className="w-6 h-6" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <Link
                href="/profile"
                className="p-2 text-gray-600 hover:text-gray-900 transition"
              >
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
