'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import type { Address } from '@/lib/types/customer';

// Mock saved addresses - in production, fetch from user profile
const SAVED_ADDRESSES: Address[] = [
  {
    street: '123 Main St',
    city: 'Columbus',
    state: 'OH',
    zipCode: '43215',
    label: 'Home',
  },
  {
    street: '456 Office Blvd',
    city: 'Columbus',
    state: 'OH',
    zipCode: '43201',
    label: 'Work',
  },
];

export function AddressSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedAddress, setSelectedAddress, setCurrentLocation } = useStore();

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    // In production, geocode the address to get lat/lng
    // For now, use Columbus, OH coordinates as default
    setCurrentLocation({
      latitude: 39.9612,
      longitude: -82.9988,
    });
    setIsOpen(false);
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition w-full sm:w-auto"
      >
        <MapPin className="w-5 h-5 text-blue-600" />
        <div className="flex-1 text-left">
          {selectedAddress ? (
            <div>
              <div className="text-xs text-gray-500">{selectedAddress.label}</div>
              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {formatAddress(selectedAddress)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Select delivery address</div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[300px]">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                Saved Addresses
              </div>
              {SAVED_ADDRESSES.map((address, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAddress(address)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {address.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatAddress(address)}
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  // In production, open add address modal
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition mt-1"
              >
                + Add new address
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
