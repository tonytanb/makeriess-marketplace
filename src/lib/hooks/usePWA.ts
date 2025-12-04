'use client';

import { useEffect, useState } from 'react';
import { isOnline, getPendingActionsCount } from '@/lib/pwa/offline-queue';
import { isPWAInstalled, isInstallPromptAvailable } from '@/lib/pwa/install-prompt';

export function usePWA() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Initial state
    setOnline(isOnline());
    setInstalled(isPWAInstalled());
    setInstallable(isInstallPromptAvailable());

    // Update online status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending count
    const updatePendingCount = async () => {
      const count = await getPendingActionsCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline: online,
    isOffline: !online,
    pendingActionsCount: pendingCount,
    hasPendingActions: pendingCount > 0,
    isPWAInstalled: installed,
    isInstallable: installable,
  };
}
