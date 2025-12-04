# PWA Utilities

This directory contains utilities for Progressive Web App functionality.

## Modules

### service-worker-registration.ts
Handles service worker registration and lifecycle management.

```typescript
import { registerServiceWorker, cacheUrls } from '@/lib/pwa';

// Register service worker
registerServiceWorker();

// Cache specific URLs
cacheUrls(['/product/123', '/vendor/456']);
```

### offline-queue.ts
Manages offline action queuing using IndexedDB.

```typescript
import { queueAction, syncPendingActions } from '@/lib/pwa';

// Queue an action
await queueAction({
  type: 'cart',
  action: 'add',
  data: { productId: '123', quantity: 2 }
});

// Sync when online
await syncPendingActions();
```

### install-prompt.ts
Handles PWA install prompt and installation detection.

```typescript
import { showInstallPrompt, isPWAInstalled } from '@/lib/pwa';

// Show install prompt
const accepted = await showInstallPrompt();

// Check if installed
if (isPWAInstalled()) {
  console.log('App is installed');
}
```

### cache-manager.ts
Manages caching of products and vendors for offline access.

```typescript
import { cacheProduct, getCachedProduct } from '@/lib/pwa';

// Cache a product
cacheProduct({
  id: '123',
  name: 'Product',
  images: ['https://...'],
  vendorId: 'vendor-1'
});

// Get cached product
const product = getCachedProduct('123');
```

## Usage in Components

### Using the PWA Hook

```typescript
import { usePWA } from '@/lib/hooks/usePWA';

function MyComponent() {
  const { isOnline, pendingActionsCount, isPWAInstalled } = usePWA();
  
  return (
    <div>
      {!isOnline && <p>You're offline</p>}
      {pendingActionsCount > 0 && <p>{pendingActionsCount} actions pending</p>}
      {!isPWAInstalled && <button>Install App</button>}
    </div>
  );
}
```

### Automatic Integration

The PWA features are automatically integrated via the `PWAProvider` component in the root layout. No additional setup is required in individual components.

## Testing

### Test Offline Mode

1. Open DevTools
2. Go to Network tab
3. Select "Offline"
4. Test app functionality

### Test Service Worker

1. Open DevTools
2. Go to Application > Service Workers
3. Verify registration
4. Check cache storage

### Test Install

1. Open in Chrome/Edge
2. Wait for install prompt
3. Click install
4. Verify standalone mode

## Browser Support

- Chrome 90+: Full support
- Edge 90+: Full support
- Safari 15.4+: Full support
- Firefox 90+: Full support

## See Also

- [PWA Implementation Guide](../../../docs/PWA_IMPLEMENTATION.md)
- [Service Worker Spec](https://w3c.github.io/ServiceWorker/)
- [Web App Manifest](https://www.w3.org/TR/appmanifest/)
