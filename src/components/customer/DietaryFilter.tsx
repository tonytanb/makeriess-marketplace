'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { id: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
  { id: 'organic', label: 'Organic', emoji: '🍃' },
] as const;

export type DietaryTag = typeof DIETARY_OPTIONS[number]['id'];

interface DietaryFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onSavePreferences?: (tags: string[]) => void;
  showSaveButton?: boolean;
}

export function DietaryFilter({
  selectedTags,
  onTagsChange,
  onSavePreferences,
  showSaveButton = false,
}: DietaryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newTags);
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  const handleSavePreferences = () => {
    if (onSavePreferences) {
      onSavePreferences(selectedTags);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition
          ${selectedTags.length > 0
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          }
        `}
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">
          Dietary {selectedTags.length > 0 && `(${selectedTags.length})`}
        </span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Dietary Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-2">
              {DIETARY_OPTIONS.map((option) => {
                const isSelected = selectedTags.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                      ${isSelected
                        ? 'bg-green-50 border-green-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTag(option.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearAll}
                disabled={selectedTags.length === 0}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
              <div className="flex gap-2">
                {showSaveButton && (
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Save Preferences
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
