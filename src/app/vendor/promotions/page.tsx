'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import { PromotionForm } from '@/components/vendor/PromotionForm';
import { PromotionCard } from '@/components/vendor/PromotionCard';

const client = generateClient<Schema>();

interface Promotion {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  productIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  notificationSent: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [vendorId, setVendorId] = useState<string>('');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setVendorId(user.userId);

      // Fetch all promotions for this vendor
      const { data: promotionData } = await client.models.Promotion.list({
        filter: {
          vendorId: { eq: user.userId },
        },
      });

      const sortedPromotions = (promotionData || [])
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      setPromotions(sortedPromotions as Promotion[]);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async (promotionData: Omit<Promotion, 'id' | 'vendorId' | 'notificationSent'>) => {
    try {
      await client.models.Promotion.create({
        ...promotionData,
        vendorId,
        notificationSent: false,
      });

      await loadPromotions();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      await client.models.Promotion.delete({ id: promotionId });
      await loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleToggleActive = async (promotionId: string, isActive: boolean) => {
    try {
      await client.models.Promotion.update({
        id: promotionId,
        isActive: !isActive,
      });
      await loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const handleSendNotifications = async (promotionId: string) => {
    if (!confirm('Send notifications to all customers who favorited your store?')) {
      return;
    }

    try {
      const result = await client.mutations.sendPromotionNotifications({
        promotionId,
      });

      if (result.data?.success) {
        alert(`Successfully sent ${result.data.notificationsSent} notifications!`);
        await loadPromotions();
      } else {
        alert(`Failed to send notifications: ${result.data?.message}`);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications');
    }
  };

  const activePromotions = promotions.filter(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return p.isActive && now >= start && now <= end;
  });

  const upcomingPromotions = promotions.filter(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    return p.isActive && now < start;
  });

  const pastPromotions = promotions.filter(p => {
    const now = new Date();
    const end = new Date(p.endDate);
    return now > end || !p.isActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions & Flash Sales</h1>
          <p className="mt-2 text-gray-600">
            Create limited-time offers to drive sales and engage customers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Create Promotion
        </button>
      </div>

      {showForm && (
        <PromotionForm
          vendorId={vendorId}
          onSubmit={handleCreatePromotion}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onDelete={handleDeletePromotion}
                onToggleActive={handleToggleActive}
                onSendNotifications={handleSendNotifications}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Promotions */}
      {upcomingPromotions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onDelete={handleDeletePromotion}
                onToggleActive={handleToggleActive}
                onSendNotifications={handleSendNotifications}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Promotions */}
      {pastPromotions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onDelete={handleDeletePromotion}
                onToggleActive={handleToggleActive}
                onSendNotifications={handleSendNotifications}
              />
            ))}
          </div>
        </div>
      )}

      {promotions.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No promotions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first promotion.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Create Promotion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
