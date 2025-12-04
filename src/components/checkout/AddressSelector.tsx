'use client';

import { useState } from 'react';
import { Plus, Check, MapPin } from 'lucide-react';
import type { Address } from '@/lib/types/customer';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  savedAddresses: Address[];
  onAddressSelected: (address: Address) => void;
  deliveryMode: 'DELIVERY' | 'PICKUP';
}

export function AddressSelector({
  selectedAddress,
  savedAddresses,
  onAddressSelected,
  deliveryMode,
}: AddressSelectorProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    label: 'home',
    instructions: '',
  });

  const handleSaveNewAddress = () => {
    if (newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
      onAddressSelected(newAddress);
      setShowNewAddressForm(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        label: 'home',
        instructions: '',
      });
    }
  };

  if (deliveryMode === 'PICKUP') {
    return (
      <div className="text-sm text-gray-600">
        <p>You&apos;ll pick up your orders directly from the vendors.</p>
        <p className="mt-2">Vendor addresses will be shown in your order confirmation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          {savedAddresses.map((address, index) => (
            <button
              key={index}
              onClick={() => onAddressSelected(address)}
              className={`w-full text-left p-4 border-2 rounded-lg transition ${
                selectedAddress === address
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {address.label && (
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        {address.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  {address.instructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Instructions: {address.instructions}
                    </p>
                  )}
                </div>
                {selectedAddress === address && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      {!showNewAddressForm && (
        <button
          onClick={() => setShowNewAddressForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-blue-600 font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50 space-y-4">
          <h3 className="font-semibold text-gray-900">New Delivery Address</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Columbus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="OH"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="43201"
              maxLength={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <select
              value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={newAddress.instructions}
              onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave at door, ring bell, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveNewAddress}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Address
            </button>
            <button
              onClick={() => setShowNewAddressForm(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
