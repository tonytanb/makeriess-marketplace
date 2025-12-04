'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/service-worker-registration';
import { setupOfflineSync } from '@/lib/pwa/offline-queue';
import { setupAutoCaching } from '@/lib/pwa/cache-manager';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Setup offline sync
    setupOfflineSync();

    // Setup auto-caching
    setupAutoCaching();
  }, []);

  return (
    <>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </>
  );
}
