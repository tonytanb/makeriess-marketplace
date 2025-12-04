'use client';

import { useState } from 'react';
import { useUpdateProfile } from '@/lib/hooks/useProfile';
import type { CustomerProfile } from '@/lib/api/profile';

interface DietaryPreferencesSectionProps {
  profile: CustomerProfile | undefined;
  isLoading: boolean;
  userId: string;
}

const DIETARY_OPTIONS = [
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
  { value: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { value: 'organic', label: 'Organic', icon: '🍃' },
];

export function DietaryPreferencesSection({ profile, isLoading, userId }: DietaryPreferencesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    profile?.dietaryPreferences || []
  );

  const updateProfile = useUpdateProfile(userId);

  const handleTogglePreference = (value: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        dietaryPreferences: selectedPreferences,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update dietary preferences:', error);
    }
  };

  const handleCancel = () => {
    setSelectedPreferences(profile?.dietaryPreferences || []);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Dietary Preferences</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Select your dietary preferences to filter products that match your needs.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {DIETARY_OPTIONS.map((option) => {
          const isSelected = selectedPreferences.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => isEditing && handleTogglePreference(option.value)}
              disabled={!isEditing}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white'
              } ${isEditing ? 'cursor-pointer hover:border-emerald-300' : 'cursor-default'}`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
              {isSelected && (
                <svg
                  className="w-5 h-5 ml-auto text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
