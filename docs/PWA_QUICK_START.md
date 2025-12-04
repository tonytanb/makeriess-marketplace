# PWA Quick Start Guide

Quick reference for using PWA features in the Makeriess marketplace.

## For Users

### Installing the App

**Desktop (Chrome/Edge)**:
1. Visit makeriess.com
2. Click install icon in address bar OR
3. Click "Install" in the custom prompt

**iOS (Safari)**:
1. Tap Share button
2. Select "Add to Home Screen"
3. Tap "Add"

**Android (Chrome)**:
1. Tap menu (⋮)
2. Select "Install app" OR
3. Click "Install" in the custom prompt

### Using Offline

- Browse previously viewed products
- Add items to cart (syncs when online)
- Toggle favorites (syncs when online)
- View order history
- Browse saved vendors

## For Developers

### Using PWA Status

```typescript
import { usePWA } from '@/lib/hooks/usePWA';

function MyComponent() {
  const { isOnline, pendingActionsCount, isPWAInstalled } = usePWA();
  
  return (
    <div>
      {!isOnline && <OfflineBanner />}
      {pendingActionsCount > 0 && (
        <p>{pendingActionsCount} actions will sync</p>
      )}
    </div>
  );
}
```

### Caching Data

```typescript
import { cacheProduct, cacheVendor } from '@/lib/pwa';

// Cache when user views
function ProductPage({ product }) {
  useEffect(() => {
    cacheProduct(product);
  }, [product]);
  
  return <ProductDetails product={product} />;
}
```

### Queuing Actions

```typescript
import { queueAction } from '@/lib/pwa';

// Automatic via store
const { addToCart } = useStore();
addToCart(product); // Auto-queues if offline

// Manual queuing
await queueAction({
  type: 'cart',
  action: 'add',
  data: { productId: '123', quantity: 2 }
});
```

### Checking Online Status

```typescript
import { isOnline } from '@/lib/pwa';

if (!isOnline()) {
  // Show offline message
  // Queue action for later
}
```

## Testing

### Test Offline Mode

1. Open DevTools (F12)
2. Network tab → Offline
3. Navigate app
4. Add to cart
5. Toggle favorites
6. Go online
7. Verify sync

### Test Service Worker

1. DevTools → Application
2. Service Workers section
3. Verify "activated and running"
4. Check Cache Storage

### Test Install

1. Open in Chrome/Edge
2. Wait for prompt
3. Click Install
4. Verify standalone mode

## Common Issues

### Service Worker Not Working

**Solution**: 
- Ensure HTTPS (or localhost)
- Clear cache and reload
- Check console for errors

### Install Prompt Not Showing

**Solution**:
- Verify manifest.json is valid
- Check all icons exist
- Try Chrome/Edge (best support)
- Wait 30 seconds after page load

### Actions Not Syncing

**Solution**:
- Check IndexedDB is enabled
- Verify service worker is active
- Check network connectivity
- Look for console errors

## Best Practices

### Do's
✅ Cache products when viewed
✅ Show offline indicator
✅ Queue actions when offline
✅ Provide offline fallbacks
✅ Test on real devices

### Don'ts
❌ Don't cache sensitive data
❌ Don't block on sync
❌ Don't assume always online
❌ Don't cache too much data
❌ Don't forget error handling

## Performance Tips

1. **Lazy Load**: Only cache what's needed
2. **Clean Up**: Remove old cache regularly
3. **Optimize Images**: Compress before caching
4. **Limit Queue**: Don't queue too many actions
5. **Monitor Size**: Check cache storage usage

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ❌ | ⚠️ | ✅ |
| Background Sync | ✅ | ❌ | ⚠️ | ✅ |
| Push Notifications | ✅ | ✅* | ✅ | ✅ |

*iOS 16.4+

## Resources

- [Full Documentation](./PWA_IMPLEMENTATION.md)
- [PWA Utilities](../src/lib/pwa/README.md)
- [Icon Guidelines](../public/icons/README.md)

## Support

Questions? Check:
1. This guide
2. Full documentation
3. Browser console
4. DevTools Application tab
