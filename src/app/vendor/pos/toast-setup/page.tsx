'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useConnectPOS } from '@/lib/hooks/useVendors';

// TODO: Get vendorId from auth context
const VENDOR_ID = 'vendor_123';

export default function ToastSetupPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [restaurantGuid, setRestaurantGuid] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectPOS = useConnectPOS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId || !clientSecret || !restaurantGuid) {
      setError('All fields are required');
      return;
    }

    setIsConnecting(true);

    try {
      // For Toast, we encode the credentials in the authCode
      const authCode = btoa(JSON.stringify({
        clientId,
        clientSecret,
        restaurantGuid,
      }));

      const result = await connectPOS.mutateAsync({
        vendorId: VENDOR_ID,
        provider: 'TOAST',
        authCode,
      });

      if (result.success) {
        router.push('/vendor/pos?success=toast');
      } else {
        setError(result.message || 'Failed to connect Toast POS');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Toast POS');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to POS Connections</span>
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Toast POS</h1>
          <p className="text-gray-600">
            Enter your Toast API credentials to connect your restaurant
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your Toast Client ID"
              required
            />
          </div>

          <div>
            <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret
            </label>
            <input
              type="password"
              id="clientSecret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your Toast Client Secret"
              required
            />
          </div>

          <div>
            <label htmlFor="restaurantGuid" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant GUID
            </label>
            <input
              type="text"
              id="restaurantGuid"
              value={restaurantGuid}
              onChange={(e) => setRestaurantGuid(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your Restaurant GUID"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Where to find these credentials:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Log in to your Toast Developer Portal</li>
              <li>Navigate to API Credentials</li>
              <li>Copy your Client ID and Client Secret</li>
              <li>Find your Restaurant GUID in Restaurant Settings</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Toast POS'}
          </button>
        </form>
      </div>
    </div>
  );
}
