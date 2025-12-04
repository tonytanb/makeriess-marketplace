'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import type { ProductSortOption } from '@/lib/types/customer';

interface SortDropdownProps {
  selectedSort: ProductSortOption;
  onSelectSort: (sort: ProductSortOption) => void;
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'DISTANCE', label: 'Distance' },
  { value: 'PRICE_LOW_TO_HIGH', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH_TO_LOW', label: 'Price: High to Low' },
  { value: 'POPULARITY', label: 'Popularity' },
  { value: 'RATING', label: 'Rating' },
];

export function SortDropdown({ selectedSort, onSelectSort }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === selectedSort);

  const handleSelect = (sort: ProductSortOption) => {
    onSelectSort(sort);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition"
      >
        <ArrowUpDown className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">
          {selectedOption?.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedSort === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
