'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/customer/Header';
import { BottomNav } from '@/components/customer/BottomNav';
import { getAuthenticatedUser } from '@/lib/auth/auth-service';
import { useCustomerProfile, useLoyaltyPoints, useLoyaltyHistory } from '@/lib/hooks/useProfile';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { LoyaltySection } from '@/components/profile/LoyaltySection';
import { AddressesSection } from '@/components/profile/AddressesSection';
import { PaymentMethodsSection } from '@/components/profile/PaymentMethodsSection';
import { DietaryPreferencesSection } from '@/components/profile/DietaryPreferencesSection';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthenticatedUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email);
        setUserName(user.name || '');
      }
    }
    loadUser();
  }, []);

  const { data: profile, isLoading: profileLoading } = useCustomerProfile(userId);
  const { data: loyaltyPoints, isLoading: pointsLoading } = useLoyaltyPoints(userId);
  const { data: loyaltyHistory, isLoading: historyLoading } = useLoyaltyHistory(userId);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Please sign in to view your profile</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Profile Information */}
        <ProfileInfo
          profile={profile}
          isLoading={profileLoading}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
        />

        {/* Loyalty Points */}
        <LoyaltySection
          loyaltyPoints={loyaltyPoints}
          loyaltyHistory={loyaltyHistory}
          isLoading={pointsLoading || historyLoading}
        />

        {/* Dietary Preferences */}
        <DietaryPreferencesSection
          profile={profile}
          isLoading={profileLoading}
          userId={userId}
        />

        {/* Saved Addresses */}
        <AddressesSection userId={userId} />

        {/* Payment Methods */}
        <PaymentMethodsSection userId={userId} />
      </main>
      <BottomNav />
    </div>
  );
}
