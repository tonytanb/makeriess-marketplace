# Review and Rating System

## Overview

The review and rating system allows customers to rate and review products and vendors after completing an order. Vendors can respond to reviews to engage with customers and address feedback.

## Features

### Customer Features

1. **Star Rating (1-5 stars)** - Required for all reviews
2. **Text Review** - Optional comment up to 500 characters
3. **Photo Upload** - Up to 3 images per review
4. **Review Display** - Reviews shown on product detail and vendor profile pages
5. **Review Prompt** - Automatic prompt after order completion

### Vendor Features

1. **View Reviews** - See all reviews for their products and business
2. **Respond to Reviews** - Add responses to customer reviews
3. **Edit Responses** - Update existing responses

## Components

### Customer Components

#### `ReviewForm`
Form component for submitting reviews with:
- Star rating selector
- Text input for comments
- Image upload (up to 3 images)
- Form validation

**Props:**
```typescript
interface ReviewFormProps {
  customerId: string;
  productId?: string;
  vendorId: string;
  orderId: string;
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

#### `ReviewList`
Displays a list of reviews with:
- Customer name and rating
- Review date
- Comment text
- Review images (clickable to view full size)
- Vendor responses

**Props:**
```typescript
interface ReviewListProps {
  reviews: Review[];
  showVendorResponse?: boolean;
}
```

#### `ReviewSummary`
Shows aggregate review statistics:
- Average rating
- Total review count
- Rating distribution (5-star breakdown)

**Props:**
```typescript
interface ReviewSummaryProps {
  reviews: Review[];
  totalReviews?: number;
}
```

#### `ReviewPromptModal`
Modal that prompts customers to review products after order completion:
- Product selection
- Review form for each product
- Progress tracking

**Props:**
```typescript
interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  vendorId: string;
  orderId: string;
  items: OrderItem[];
}
```

### Vendor Components

#### `VendorReviewResponse`
Component for vendors to respond to reviews:
- View customer review
- Add/edit response
- Character limit (500 chars)

**Props:**
```typescript
interface VendorReviewResponseProps {
  review: Review;
}
```

## API Service

### `reviewService`

Located in `src/lib/api/reviews.ts`

**Methods:**

```typescript
// Create a new review
create(input: CreateReviewInput): Promise<Review>

// Get reviews for a product
getByProduct(productId: string, limit?: number, nextToken?: string): Promise<{ reviews: Review[]; nextToken?: string }>

// Get reviews for a vendor
getByVendor(vendorId: string, limit?: number, nextToken?: string): Promise<{ reviews: Review[]; nextToken?: string }>

// Update vendor response
updateVendorResponse(input: UpdateVendorResponseInput): Promise<Review>

// Get a single review by ID
getById(id: string): Promise<Review | null>
```

## React Hooks

### `useProductReviews(productId, limit?)`
Fetches reviews for a specific product with React Query caching.

### `useVendorReviews(vendorId, limit?)`
Fetches reviews for a specific vendor with React Query caching.

### `useCreateReview()`
Mutation hook for creating reviews. Automatically invalidates related queries on success.

### `useUpdateVendorResponse()`
Mutation hook for vendors to add/update responses to reviews.

## Data Model

### Review Schema

```typescript
interface Review {
  id: string;
  customerId: string;
  customer?: {
    name: string;
  };
  productId?: string;
  vendorId: string;
  orderId: string;
  rating: number;           // 1-5
  comment?: string;         // Max 500 chars
  images?: string[];        // S3 keys
  vendorResponse?: string;  // Max 500 chars
  vendorResponseDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Storage

Review images are stored in AWS S3 with the following structure:
```
reviews/{customerId}/{timestamp}-{filename}
```

Access permissions:
- Authenticated users can read all review images
- Users can write/delete their own review images

## Integration Points

### Product Detail Page
- Displays `ReviewSummary` with aggregate stats
- Shows `ReviewList` with all product reviews
- Located at: `src/app/product/[id]/page.tsx`

### Vendor Profile Page
- Displays `ReviewSummary` for vendor
- Shows `ReviewList` with all vendor reviews
- Located at: `src/app/vendor/[id]/page.tsx`

### Order Confirmation Page
- Shows `ReviewPromptModal` after 5 seconds for completed orders
- Located at: `src/app/order-confirmation/page.tsx`

### Order Detail Page
- Shows "Write a Review" button for completed orders
- Opens `ReviewPromptModal` when clicked
- Located at: `src/app/orders/[id]/page.tsx`

## User Flow

### Customer Review Flow

1. **Order Completion**
   - Customer completes an order
   - Order status changes to "COMPLETED"

2. **Review Prompt**
   - After 5 seconds on order confirmation page, review modal appears
   - OR customer clicks "Write a Review" on order detail page

3. **Product Selection**
   - Customer selects which product to review
   - Can review multiple products from the same order

4. **Submit Review**
   - Customer rates product (1-5 stars)
   - Optionally adds comment and photos
   - Submits review

5. **Review Display**
   - Review appears on product detail page
   - Review appears on vendor profile page
   - Vendor receives notification (future enhancement)

### Vendor Response Flow

1. **View Reviews**
   - Vendor navigates to reviews section in vendor portal
   - Sees all reviews for their products

2. **Respond to Review**
   - Vendor clicks "Respond to this review"
   - Enters response text (max 500 chars)
   - Submits response

3. **Response Display**
   - Response appears below customer review
   - Shows response date
   - Vendor can edit response later

## Requirements Fulfilled

This implementation fulfills the following requirements from the spec:

- **21.1**: Review prompt after order completion ✓
- **21.2**: 5-star rating with optional text review (max 500 chars) ✓
- **21.3**: Average ratings and review counts displayed ✓
- **21.4**: Photo upload for reviews (up to 3 images) ✓
- **21.5**: Vendor responses displayed below customer reviews ✓

## Future Enhancements

1. **Review Moderation**
   - Flag inappropriate reviews
   - Admin review approval system

2. **Review Notifications**
   - Email notifications for new reviews
   - Push notifications for vendor responses

3. **Review Filtering**
   - Filter by rating
   - Sort by date, helpfulness
   - Search reviews

4. **Review Helpfulness**
   - "Helpful" voting system
   - Sort by most helpful

5. **Review Analytics**
   - Vendor dashboard with review metrics
   - Sentiment analysis
   - Response rate tracking

6. **Review Incentives**
   - Loyalty points for reviews
   - Badges for frequent reviewers

## Testing

To test the review system:

1. **Create a Review**
   ```typescript
   // Navigate to a completed order
   // Click "Write a Review"
   // Select a product
   // Rate and submit
   ```

2. **View Reviews**
   ```typescript
   // Navigate to product detail page
   // Scroll to reviews section
   // See reviews and ratings
   ```

3. **Vendor Response**
   ```typescript
   // As vendor, view reviews
   // Click "Respond to this review"
   // Enter and submit response
   ```

## Troubleshooting

### Images Not Uploading
- Check S3 bucket permissions
- Verify storage configuration in `amplify/storage/resource.ts`
- Check file size limits (max 5MB per image)

### Reviews Not Displaying
- Verify GraphQL queries are working
- Check React Query cache
- Ensure proper authorization rules

### Vendor Response Not Saving
- Check user is authenticated as vendor
- Verify ownership of review's vendor
- Check character limit (500 chars)
