// PWA Utilities - Centralized exports

// Service Worker
export {
  registerServiceWorker,
  unregisterServiceWorker,
  cacheUrls,
} from './service-worker-registration';

// Offline Queue
export {
  queueAction,
  getPendingActions,
  removeAction,
  clearPendingActions,
  syncPendingActions,
  setupOfflineSync,
  isOnline,
  getPendingActionsCount,
} from './offline-queue';

// Install Prompt
export {
  setupInstallPrompt,
  showInstallPrompt,
  isInstallPromptAvailable,
  isPWAInstalled,
} from './install-prompt';

// Cache Manager
export {
  cacheProduct,
  cacheVendor,
  getCachedProducts,
  getCachedVendors,
  getCachedProduct,
  getCachedVendor,
  clearOldCache,
  setupAutoCaching,
} from './cache-manager';
