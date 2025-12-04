# Vendor Promotions & Flash Sales Feature

## Overview

The Promotions feature allows vendors to create time-limited discounts and flash sales to drive customer engagement and increase sales. Promotions automatically apply to products, display countdown timers, and send push notifications to customers who have favorited the vendor.

## Features

### For Vendors

1. **Create Promotions**
   - Set promotion name and description
   - Choose discount type: Percentage (%) or Fixed Amount ($)
   - Set discount value
   - Select specific products or apply to all products
   - Define start and end date/time
   - Activate/deactivate promotions

2. **Manage Promotions**
   - View active, upcoming, and past promotions
   - Toggle promotion active status
   - Delete promotions
   - Send notifications to customers

3. **Notification System**
   - Send push notifications to all customers who favorited the vendor
   - Notifications include promotion details and countdown
   - One-time notification per promotion

### For Customers

1. **Promotional Pricing**
   - See discounted prices on product cards
   - Original price shown with strikethrough
   - Savings amount displayed

2. **Countdown Timers**
   - Real-time countdown on product cards
   - Shows days, hours, minutes, seconds remaining
   - Automatically updates every second

3. **Promotion Badges**
   - Eye-catching badges on product cards
   - Displays discount amount
   - Shows time remaining

4. **Automatic Application**
   - Promotional pricing automatically applied at checkout
   - No promo codes needed
   - Best promotion automatically selected if multiple apply

## Data Model

### Promotion Schema

```typescript
{
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  productIds?: string[];  // Empty = applies to all products
  startDate: string;      // ISO datetime
  endDate: string;        // ISO datetime
  isActive: boolean;
  notificationSent: boolean;
}
```

## API Operations

### Queries

**getActivePromotions**
```graphql
query GetActivePromotions($vendorId: ID, $productId: ID) {
  getActivePromotions(vendorId: $vendorId, productId: $productId) {
    promotions
  }
}
```

### Mutations

**Create Promotion**
```graphql
mutation CreatePromotion($input: CreatePromotionInput!) {
  createPromotion(input: $input) {
    id
    name
    discountType
    discountValue
    startDate
    endDate
  }
}
```

**Send Notifications**
```graphql
mutation SendPromotionNotifications($promotionId: ID!) {
  sendPromotionNotifications(promotionId: $promotionId) {
    success
    message
    notificationsSent
  }
}
```

## Usage

### Vendor: Creating a Promotion

1. Navigate to `/vendor/promotions`
2. Click "Create Promotion"
3. Fill in promotion details:
   - Name (e.g., "Weekend Flash Sale")
   - Description (optional)
   - Discount type and value
   - Start and end dates
   - Select products (optional)
4. Click "Create Promotion"
5. Optionally send notifications to customers

### Customer: Viewing Promotions

1. Browse products on home page or vendor profile
2. Products with active promotions show:
   - Promotion badge with discount amount
   - Countdown timer
   - Discounted price in red
   - Original price with strikethrough
3. Add to cart - promotional price automatically applied

## Implementation Details

### Price Calculation

```typescript
function calculatePromotionalPrice(originalPrice, promotion) {
  if (promotion.discountType === 'PERCENTAGE') {
    discount = originalPrice * (promotion.discountValue / 100);
  } else {
    discount = promotion.discountValue;
  }
  return Math.max(0, originalPrice - discount);
}
```

### Promotion Selection

When multiple promotions apply to a product, the system automatically selects the promotion with the highest discount value.

### Countdown Timer

The countdown timer updates every second and displays:
- Days and hours (if > 24 hours remaining)
- Hours and minutes (if > 1 hour remaining)
- Minutes and seconds (if < 1 hour remaining)
- Seconds only (if < 1 minute remaining)

### Notification System

Notifications are sent to customers who have:
1. Favorited the vendor
2. Not yet received a notification for this promotion

Notification includes:
- Vendor name
- Promotion name
- Discount amount
- End date

## Requirements Fulfilled

This implementation fulfills the following requirements from the spec:

- **24.1**: Create promotion creation form with start/end dates and discount ✅
- **24.2**: Display countdown timer on product cards during active promotions ✅
- **24.3**: Apply promotional pricing automatically during promotion period ✅
- **24.4**: Revert to regular pricing when promotion ends ✅
- **24.5**: Send push notifications to customers who favorited the vendor ✅

## File Structure

```
amplify/data/
├── resource.ts                                    # Added Promotion model and queries
├── functions/
│   ├── getActivePromotions/
│   │   ├── resource.ts
│   │   └── handler.ts
│   └── sendPromotionNotifications/
│       ├── resource.ts
│       └── handler.ts
└── resolvers/
    ├── getActivePromotions.js
    └── sendPromotionNotifications.js

src/
├── app/
│   ├── product/[id]/page.tsx                     # Updated with promotion display
│   └── vendor/
│       └── promotions/
│           └── page.tsx                          # Promotions management page
├── components/
│   ├── customer/
│   │   ├── ProductCard.tsx                       # Updated with promotion display
│   │   └── PromotionBadge.tsx                    # New countdown badge component
│   └── vendor/
│       ├── PromotionForm.tsx                     # Promotion creation form
│       └── PromotionCard.tsx                     # Promotion display card
└── lib/
    ├── hooks/
    │   └── usePromotions.ts                      # Promotion hooks and utilities
    └── types/
        └── customer.ts                           # Updated Product type

docs/
└── PROMOTIONS_FEATURE.md                         # This file
```

## Testing

### Manual Testing Checklist

**Vendor Side:**
- [ ] Create a percentage discount promotion
- [ ] Create a fixed amount discount promotion
- [ ] Create promotion for specific products
- [ ] Create promotion for all products
- [ ] Toggle promotion active/inactive
- [ ] Delete promotion
- [ ] Send notifications

**Customer Side:**
- [ ] View product with active promotion
- [ ] Verify countdown timer updates
- [ ] Verify promotional price displayed
- [ ] Add promoted product to cart
- [ ] Verify promotional price in cart
- [ ] Complete checkout with promotional pricing

**Edge Cases:**
- [ ] Promotion starts in the future (upcoming)
- [ ] Promotion ends (reverts to regular price)
- [ ] Multiple promotions on same product (best discount applied)
- [ ] Promotion with no products selected (applies to all)

## Future Enhancements

1. **Promo Codes**: Add support for customer-entered promo codes
2. **Buy X Get Y**: Implement bundle promotions
3. **Minimum Purchase**: Require minimum order amount for promotion
4. **First-Time Customer**: Target promotions to new customers only
5. **Analytics**: Track promotion performance and ROI
6. **A/B Testing**: Test different promotion strategies
7. **Scheduled Notifications**: Send reminder notifications before promotion ends
8. **Social Sharing**: Allow customers to share promotions on social media

## Notes

- Promotions are vendor-specific and cannot span multiple vendors
- Promotional pricing is calculated at display time and cart time
- Countdown timers use client-side JavaScript for real-time updates
- Notifications are sent once per promotion to avoid spam
- Inactive promotions are hidden from customers but visible to vendors
- Past promotions are kept for historical reference and analytics
