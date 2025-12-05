'use client';

import { useState } from 'react';
import { useUpdateProfile } from '@/lib/hooks/useProfile';
import type { CustomerProfile } from '@/lib/api/profile';

interface ProfileInfoProps {
  profile: CustomerProfile | undefined;
  isLoading: boolean;
  userId: string;
  userEmail: string;
  userName: string;
}

export function ProfileInfo({ profile, isLoading, userId, userEmail, userName }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || userName,
    phone: profile?.phone || '',
  });

  const updateProfile = useUpdateProfile(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || userName,
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-gray-900">{profile?.name || userName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900">{userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
