'use client';

import { Header } from '@/components/customer/Header';
import { BottomNav } from '@/components/customer/BottomNav';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
        <p className="text-gray-600">Cart view coming soon...</p>
      </main>
      <BottomNav />
    </div>
  );
}
