# Social Sharing Feature

## Overview

The social sharing feature enables customers to share products and vendors with friends via social media or direct links. The implementation includes:

- Share buttons on product detail and vendor profile pages
- Web Share API for native mobile sharing
- Clipboard fallback for desktop browsers
- Open Graph metadata for rich social media previews
- Referral tracking for order attribution

## Features

### 1. Share Buttons

Share buttons are available on:
- **Product Detail Pages**: Share individual products with pricing and vendor information
- **Vendor Profile Pages**: Share vendor profiles with ratings and descriptions

The share button component adapts based on device capabilities:
- **Mobile devices**: Uses native Web Share API for seamless sharing
- **Desktop browsers**: Copies link to clipboard with visual feedback

### 2. Web Share API Integration

The implementation uses the Web Share API when available, providing:
- Native share sheet on mobile devices
- Integration with installed apps (WhatsApp, Facebook, Twitter, etc.)
- Better user experience on mobile platforms

### 3. Open Graph Metadata

Dynamic Open Graph tags are generated for:
- Product pages: Include product name, price, vendor, image, and description
- Vendor pages: Include vendor name, rating, logo, and description

This ensures rich previews when links are shared on:
- Facebook
- Twitter
- LinkedIn
- WhatsApp
- iMessage
- Slack

### 4. Referral Tracking

The system tracks referral sources for order attribution:
- Shareable URLs include referrer ID parameter (`?ref=userId`)
- Referrer information is stored in localStorage for 30 days
- Orders are attributed to referrers for potential rewards
- Analytics events track share actions and conversions

## Implementation Details

### Components

#### ShareButton Component
Location: `src/components/shared/ShareButton.tsx`

Props:
- `type`: 'product' | 'vendor'
- `data`: Product or vendor data for sharing
- `referrerId`: Optional user ID for referral tracking
- `variant`: 'primary' | 'secondary' | 'icon'
- `className`: Optional CSS classes

Variants:
- **Icon**: Compact icon-only button (used in product/vendor pages)
- **Primary**: Filled button with text
- **Secondary**: Outlined button with text

### Utilities

#### Social Sharing Utils
Location: `src/lib/utils/social-sharing.ts`

Functions:
- `isWebShareSupported()`: Check if Web Share API is available
- `generateProductShareUrl()`: Create shareable URL for products
- `generateVendorShareUrl()`: Create shareable URL for vendors
- `shareProduct()`: Share product via Web Share API or clipboard
- `shareVendor()`: Share vendor via Web Share API or clipboard
- `getReferrerFromUrl()`: Extract referrer ID from URL
- `trackShareEvent()`: Track share events for analytics
- `generateProductMetadata()`: Generate Open Graph metadata for products
- `generateVendorMetadata()`: Generate Open Graph metadata for vendors

#### Meta Tags Utils
Location: `src/lib/utils/meta-tags.ts`

Functions:
- `updateMetaTags()`: Dynamically update Open Graph meta tags
- `resetMetaTags()`: Reset meta tags to default values

### Hooks

#### useReferralTracking Hook
Location: `src/lib/hooks/useReferralTracking.ts`

Functions:
- `useReferralTracking()`: Track referral visits from shared links
- `getStoredReferrer()`: Get stored referrer ID for order attribution
- `clearStoredReferrer()`: Clear referrer after order completion
- `trackReferralOrder()`: Track orders with referral attribution

## Usage Examples

### Adding Share Button to a Page

```tsx
import { ShareButton } from '@/components/shared/ShareButton';
import type { ProductShareData } from '@/lib/utils/social-sharing';

function ProductPage() {
  const product = useProduct(productId);
  const { user } = useStore();

  const shareData: ProductShareData = {
    id: product.id,
    name: product.name,
    price: product.price,
    vendorName: product.vendor.businessName,
    imageUrl: product.images[0],
    description: product.description,
  };

  return (
    <div>
      <ShareButton
        type="product"
        data={shareData}
        referrerId={user?.id}
        variant="icon"
      />
    </div>
  );
}
```

### Tracking Referrals

```tsx
import { useReferralTracking } from '@/lib/hooks/useReferralTracking';

function ProductPage() {
  // Automatically tracks referral visits
  useReferralTracking();

  return <div>Product content</div>;
}
```

### Tracking Referral Orders

```tsx
import { trackReferralOrder } from '@/lib/hooks/useReferralTracking';

function OrderConfirmation() {
  useEffect(() => {
    if (order) {
      trackReferralOrder(order.id, order.total);
    }
  }, [order]);

  return <div>Order confirmation</div>;
}
```

## Shareable URL Format

### Product URLs
```
https://makeriess.com/product/{productId}?ref={referrerId}
```

### Vendor URLs
```
https://makeriess.com/vendor/{vendorId}?ref={referrerId}
```

## Open Graph Metadata

### Product Pages

```html
<meta property="og:title" content="Chocolate Croissant - Sweet Treats Bakery" />
<meta property="og:description" content="Get Chocolate Croissant from Sweet Treats Bakery for $4.50 on Makeriess" />
<meta property="og:type" content="product" />
<meta property="og:image" content="https://makeriess.com/images/product.jpg" />
<meta property="og:url" content="https://makeriess.com/product/123" />
<meta property="og:site_name" content="Makeriess" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Chocolate Croissant - Sweet Treats Bakery" />
<meta name="twitter:description" content="Get Chocolate Croissant from Sweet Treats Bakery for $4.50" />
<meta name="twitter:image" content="https://makeriess.com/images/product.jpg" />
```

### Vendor Pages

```html
<meta property="og:title" content="Sweet Treats Bakery - 4.8 ⭐" />
<meta property="og:description" content="Discover amazing products from Sweet Treats Bakery on Makeriess" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://makeriess.com/images/vendor-logo.jpg" />
<meta property="og:url" content="https://makeriess.com/vendor/123" />
<meta property="og:site_name" content="Makeriess" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Sweet Treats Bakery - 4.8 ⭐" />
<meta name="twitter:description" content="Discover amazing products from Sweet Treats Bakery" />
<meta name="twitter:image" content="https://makeriess.com/images/vendor-logo.jpg" />
```

## Analytics Events

### Share Events

```javascript
gtag('event', 'share', {
  content_type: 'product', // or 'vendor'
  content_id: 'product_123',
  method: 'native', // or 'clipboard'
});
```

### Referral Events

```javascript
// Referral visit
gtag('event', 'referral_visit', {
  referrer_id: 'user_456',
});

// Referral conversion
gtag('event', 'referral_conversion', {
  referrer_id: 'user_456',
  order_id: 'order_789',
  value: 45.50,
});
```

## Browser Support

### Web Share API
- ✅ iOS Safari 12.2+
- ✅ Android Chrome 61+
- ✅ Android Firefox 71+
- ❌ Desktop browsers (uses clipboard fallback)

### Clipboard API
- ✅ All modern browsers
- ✅ Chrome 63+
- ✅ Firefox 53+
- ✅ Safari 13.1+
- ✅ Edge 79+

## Future Enhancements

### Phase 2
- [ ] Referral rewards program
- [ ] Share analytics dashboard for users
- [ ] Custom share images with dynamic text overlay
- [ ] Deep linking for mobile apps
- [ ] QR code generation for offline sharing

### Phase 3
- [ ] Social media direct posting (Facebook, Twitter APIs)
- [ ] Share to specific platforms (WhatsApp, Messenger)
- [ ] Viral loop incentives (share to unlock discounts)
- [ ] Influencer tracking and attribution
- [ ] A/B testing for share messaging

## Testing

### Manual Testing Checklist

- [ ] Share button appears on product detail pages
- [ ] Share button appears on vendor profile pages
- [ ] Web Share API works on mobile devices
- [ ] Clipboard fallback works on desktop
- [ ] "Link Copied" feedback displays correctly
- [ ] Shared links include referrer parameter
- [ ] Referrer is stored in localStorage
- [ ] Open Graph tags are set correctly
- [ ] Social media previews display correctly
- [ ] Referral orders are tracked
- [ ] Analytics events fire correctly

### Test URLs

Product share test:
```
https://makeriess.com/product/test-product-123?ref=test-user-456
```

Vendor share test:
```
https://makeriess.com/vendor/test-vendor-789?ref=test-user-456
```

## Troubleshooting

### Share button not working
- Check browser console for errors
- Verify Web Share API support
- Test clipboard permissions

### Referrer not tracked
- Check localStorage for `makeriess_referrer` key
- Verify URL contains `ref` parameter
- Check browser console for tracking events

### Open Graph tags not updating
- Clear browser cache
- Check meta tags in page source
- Test with Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Test with Twitter Card Validator: https://cards-dev.twitter.com/validator

### Social media preview not showing
- Verify image URLs are absolute (not relative)
- Check image dimensions (recommended: 1200x630)
- Ensure images are publicly accessible
- Use social media debugging tools to refresh cache

## Resources

- [Web Share API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
