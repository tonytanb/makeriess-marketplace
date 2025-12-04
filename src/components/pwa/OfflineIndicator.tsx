'use client';

import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPendingActionsCount } from '@/lib/pwa/offline-queue';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowNotification(true);
      } else {
        // Show "back online" notification briefly
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    };

    const updatePendingCount = async () => {
      const count = await getPendingActionsCount();
      setPendingCount(count);
    };

    // Initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update pending count periodically
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 ${
          isOnline
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-900 text-white'
        }`}
      >
        {isOnline ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}
        
        <div>
          <p className="font-semibold text-sm">
            {isOnline ? 'Back Online' : 'You\'re Offline'}
          </p>
          {!isOnline && pendingCount > 0 && (
            <p className="text-xs opacity-90">
              {pendingCount} action{pendingCount !== 1 ? 's' : ''} will sync when online
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
