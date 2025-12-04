'use client';

/**
 * Role Selector Component
 * Allows users to select between customer and vendor roles during signup
 */

import { UserRole } from '@/lib/auth/types';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        I want to
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('customer')}
          className={`p-4 border-2 rounded-lg transition ${
            value === 'customer'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-2xl mb-2">🛍️</div>
          <div className="font-medium">Shop</div>
          <div className="text-xs text-gray-600 mt-1">
            Browse and order from local vendors
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('vendor')}
          className={`p-4 border-2 rounded-lg transition ${
            value === 'vendor'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-2xl mb-2">🏪</div>
          <div className="font-medium">Sell</div>
          <div className="text-xs text-gray-600 mt-1">
            List products and manage orders
          </div>
        </button>
      </div>
    </div>
  );
}
