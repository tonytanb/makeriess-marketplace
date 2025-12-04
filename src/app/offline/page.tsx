'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Reload the page when back online
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isOnline ? 'Back Online!' : 'You\'re Offline'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isOnline
            ? 'Your connection has been restored. Reloading...'
            : 'It looks like you\'re not connected to the internet. Some features may be limited.'}
        </p>

        {!isOnline && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">
                What you can still do:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• View previously loaded products and vendors</li>
                <li>• Browse your favorites</li>
                <li>• Add items to cart (will sync when online)</li>
                <li>• View your order history</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {isOnline && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        )}
      </div>
    </div>
  );
}
