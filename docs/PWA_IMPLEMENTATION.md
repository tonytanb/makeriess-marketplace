# Progressive Web App (PWA) Implementation

This document describes the PWA implementation for the Makeriess marketplace platform.

## Overview

The Makeriess PWA provides offline functionality, installability, and enhanced mobile experience. Users can install the app on their home screen and continue browsing products, managing favorites, and adding items to cart even when offline.

## Features Implemented

### 1. Service Worker

**Location**: `public/sw.js`

The service worker provides:
- **Offline caching** of static assets and previously viewed pages
- **Network-first strategy** for API requests with cache fallback
- **Cache-first strategy** for static assets (images, CSS, JS)
- **Background sync** for cart and favorite actions when offline
- **Automatic cache cleanup** of old versions

**Caching Strategies**:
- Static assets (HTML, CSS, JS, images): Cache-first
- API requests: Network-first with cache fallback
- Navigation requests: Network-first with offline page fallback

### 2. Web App Manifest

**Location**: `public/manifest.json`

Defines the PWA metadata:
- App name and description
- Icons (72x72 to 512x512)
- Theme color (#10b981 - emerald)
- Display mode (standalone)
- Start URL and scope

### 3. Offline Queue

**Location**: `src/lib/pwa/offline-queue.ts`

Manages offline actions using IndexedDB:
- Queues cart additions/removals/updates
- Queues favorite product/vendor toggles
- Automatically syncs when connection is restored
- Provides pending action count

**Usage**:
```typescript
import { queueAction, syncPendingActions } from '@/lib/pwa/offline-queue';

// Queue an action
await queueAction({
  type: 'cart',
  action: 'add',
  data: { productId: '123', quantity: 2 }
});

// Sync all pending actions
await syncPendingActions();
```

### 4. Install Prompt

**Location**: `src/components/pwa/InstallPrompt.tsx`

Provides a custom install prompt:
- Shows when PWA is installable
- Dismissible with 7-day cooldown
- Tracks install status
- Hides after installation

### 5. Offline Indicator

**Location**: `src/components/pwa/OfflineIndicator.tsx`

Shows connection status:
- Displays when offline
- Shows pending action count
- Notifies when back online
- Auto-hides after 3 seconds when online

### 6. Cache Manager

**Location**: `src/lib/pwa/cache-manager.ts`

Manages product and vendor caching:
- Caches product images and data
- Caches vendor logos and data
- Stores in localStorage for offline access
- Auto-cleans cache older than 7 days

**Usage**:
```typescript
import { cacheProduct, cacheVendor } from '@/lib/pwa/cache-manager';

// Cache a product
cacheProduct({
  id: '123',
  name: 'Artisan Bread',
  images: ['https://...'],
  vendorId: 'vendor-1'
});

// Cache a vendor
cacheVendor({
  id: 'vendor-1',
  businessName: 'Local Bakery',
  logo: 'https://...'
});
```

### 7. PWA Hook

**Location**: `src/lib/hooks/usePWA.ts`

React hook for PWA status:
```typescript
const {
  isOnline,
  isOffline,
  pendingActionsCount,
  hasPendingActions,
  isPWAInstalled,
  isInstallable
} = usePWA();
```

## Integration with Zustand Store

The cart and favorites store automatically queues actions when offline:

```typescript
// src/lib/store/useStore.ts
addToCart: (product, quantity) => {
  // Update local state
  set({ cartItems: [...] });
  
  // Queue for sync if offline
  if (!isOnline()) {
    queueAction({
      type: 'cart',
      action: 'add',
      data: { productId, quantity }
    });
  }
}
```

## Offline Page

**Location**: `src/app/offline/page.tsx`

Fallback page shown when:
- User navigates while offline
- Requested page is not cached
- Network request fails

Features:
- Clear offline message
- List of available offline features
- Retry button
- Auto-reload when back online

## Installation

### For Users

**Desktop (Chrome/Edge)**:
1. Visit the Makeriess website
2. Click the install icon in the address bar
3. Or use the custom install prompt

**Mobile (iOS)**:
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

**Mobile (Android)**:
1. Open in Chrome
2. Tap the menu (three dots)
3. Select "Install app"
4. Or use the custom install prompt

### For Developers

The PWA is automatically configured. No additional setup required.

## Testing

### Test Offline Functionality

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Navigate the app
5. Try adding items to cart
6. Go back online
7. Verify actions sync automatically

### Test Service Worker

1. Open DevTools (F12)
2. Go to Application tab
3. Select "Service Workers"
4. Verify service worker is registered
5. Check cache storage for cached assets

### Test Install Prompt

1. Open in Chrome/Edge
2. Wait for install prompt to appear
3. Click "Install"
4. Verify app opens in standalone mode

## Performance

### Lighthouse Scores

Target scores:
- Performance: 90+
- PWA: 100
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Cache Strategy Impact

- **First visit**: Normal load time
- **Repeat visits**: Sub-second load time
- **Offline**: Instant load from cache

## Browser Support

### Full Support
- Chrome 90+
- Edge 90+
- Safari 15.4+
- Firefox 90+

### Partial Support
- Safari 11.1-15.3 (no install prompt)
- Firefox 44-89 (limited service worker)

### No Support
- IE 11 (graceful degradation)

## Security

### Service Worker Scope
- Scope: `/` (entire site)
- HTTPS required (except localhost)

### Data Storage
- IndexedDB for pending actions
- localStorage for cached data
- No sensitive data stored offline

### Cache Invalidation
- Automatic on service worker update
- Manual via cache version bump
- 7-day auto-cleanup

## Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required except localhost)
2. Verify `sw.js` is in public directory
3. Check browser console for errors
4. Clear browser cache and reload

### Install Prompt Not Showing

1. Verify manifest.json is valid
2. Check all required icons exist
3. Ensure HTTPS is enabled
4. Try in Chrome/Edge (best support)

### Offline Sync Not Working

1. Check IndexedDB is enabled
2. Verify service worker is active
3. Check browser console for errors
4. Test with DevTools offline mode

### Cache Not Updating

1. Update CACHE_VERSION in sw.js
2. Force refresh (Ctrl+Shift+R)
3. Clear cache in DevTools
4. Unregister and re-register service worker

## Future Enhancements

### Planned Features
- [ ] Push notifications for order updates
- [ ] Background sync for order status
- [ ] Periodic background sync for product updates
- [ ] Share target API for sharing products
- [ ] File handling API for uploading images
- [ ] Badge API for unread notifications

### Performance Optimizations
- [ ] Implement precaching for critical routes
- [ ] Add image compression in service worker
- [ ] Implement stale-while-revalidate for API
- [ ] Add request deduplication

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Support

For issues or questions about the PWA implementation:
1. Check this documentation
2. Review browser console for errors
3. Test in Chrome DevTools
4. Contact the development team
