'use client';

import { useRouter } from 'next/navigation';
import { Settings, Link2, Clock, MapPin, User, Bell } from 'lucide-react';

export default function VendorSettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      icon: Link2,
      title: 'POS Connections',
      description: 'Connect and manage your Point of Sale integrations',
      href: '/vendor/pos',
      color: 'blue',
      available: true,
    },
    {
      icon: User,
      title: 'Business Profile',
      description: 'Update your business information and branding',
      href: '/vendor/profile',
      color: 'purple',
      available: false,
    },
    {
      icon: Clock,
      title: 'Operating Hours',
      description: 'Set your weekly schedule and holiday hours',
      href: '/vendor/hours',
      color: 'green',
      available: false,
    },
    {
      icon: MapPin,
      title: 'Delivery Zones',
      description: 'Configure delivery areas and fees',
      href: '/vendor/delivery-zones',
      color: 'orange',
      available: false,
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      href: '/vendor/notifications',
      color: 'red',
      available: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your vendor account and business settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.href}
              onClick={() => section.available && router.push(section.href)}
              disabled={!section.available}
              className={`relative bg-white rounded-lg border border-gray-200 p-6 text-left transition ${
                section.available
                  ? 'hover:border-gray-300 hover:shadow-md cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {!section.available && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    Coming Soon
                  </span>
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-lg bg-${section.color}-100 flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${section.color}-600`} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-gray-600">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
