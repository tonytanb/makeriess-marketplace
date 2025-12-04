# Gift Discovery Feature - Design Document

## Overview

The Gift Discovery feature creates a dedicated gift shopping experience within Makeriess, positioning the platform as the premier destination for last-minute, thoughtful gifts from local makers. This feature includes a gift landing page, advanced filtering, gift finder quiz, gift wrapping services, personalized messages, and vendor-created gift bundles.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer Interface                       │
├─────────────────────────────────────────────────────────────┤
│  Gift Landing Page  │  Gift Finder Quiz  │  Product Cards   │
│  Gift Filters       │  Gift Bundles      │  Gift Messages   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (GraphQL)                     │
├─────────────────────────────────────────────────────────────┤
│  searchGiftProducts()  │  getGiftRecommendations()          │
│  createGiftBundle()    │  addGiftMessage()                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (DynamoDB)                   │
├─────────────────────────────────────────────────────────────┤
│  Product (with gift fields)  │  GiftBundle                  │
│  GiftMessage                 │  GiftAnalytics               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Search Layer (OpenSearch)                  │
├─────────────────────────────────────────────────────────────┤
│  Gift-specific indices and filters                          │
│  Faceted search by category, occasion, price                │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── gifts/
│   │   ├── page.tsx                    # Main gift landing page
│   │   ├── finder/
│   │   │   └── page.tsx                # Gift finder quiz
│   │   └── bundles/
│   │       └── [id]/
│   │           └── page.tsx            # Gift bundle detail
│   └── (customer)/
│       └── page.tsx                    # Homepage with gift section
│
├── components/
│   ├── gifts/
│   │   ├── GiftLandingHero.tsx         # Hero section for gifts page
│   │   ├── GiftCategoryCards.tsx       # Quick filter cards
│   │   ├── GiftFilterSidebar.tsx       # Advanced filters
│   │   ├── GiftFinderQuiz.tsx          # Interactive quiz
│   │   ├── GiftProductCard.tsx         # Product card with gift badges
│   │   ├── GiftBundleCard.tsx          # Bundle display card
│   │   ├── GiftWrappingOption.tsx      # Gift wrap selector
│   │   ├── GiftMessageInput.tsx        # Message input component
│   │   └── FeaturedGiftsSection.tsx    # Homepage gift section
│   │
│   └── vendor/
│       ├── GiftProductSettings.tsx     # Vendor gift tagging UI
│       ├── GiftBundleCreator.tsx       # Bundle creation form
│       └── GiftAnalyticsDashboard.tsx  # Gift sales analytics
│
└── lib/
    ├── api/
    │   └── gifts.ts                    # Gift-related API calls
    ├── types/
    │   └── gifts.ts                    # Gift type definitions
    └── utils/
        └── giftRecommendations.ts      # Recommendation algorithm
```

## Data Models

### Extended Product Model

```typescript
interface Product {
  // ... existing fields
  
  // Gift-specific fields
  isGiftWorthy: boolean;
  giftCategories: GiftCategory[];
  giftOccasions: GiftOccasion[];
  giftWrappingAvailable: boolean;
  giftWrappingPrice?: number;
  ageRange?: AgeRange;
  petType?: PetType;
  giftTags?: string[];
}

enum GiftCategory {
  ADULTS = 'ADULTS',
  KIDS = 'KIDS',
  PETS = 'PETS',
  HOME = 'HOME'
}

enum GiftOccasion {
  BIRTHDAY = 'BIRTHDAY',
  ANNIVERSARY = 'ANNIVERSARY',
  THANK_YOU = 'THANK_YOU',
  CONGRATULATIONS = 'CONGRATULATIONS',
  JUST_BECAUSE = 'JUST_BECAUSE',
  HOLIDAY = 'HOLIDAY',
  GRADUATION = 'GRADUATION',
  NEW_BABY = 'NEW_BABY'
}

enum AgeRange {
  BABY = 'BABY',           // 0-2 years
  TODDLER = 'TODDLER',     // 3-5 years
  KIDS = 'KIDS',           // 6-12 years
  TEENS = 'TEENS',         // 13-17 years
  ADULTS = 'ADULTS'        // 18+ years
}

enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  OTHER = 'OTHER'
}
```

### Gift Bundle Model

```typescript
interface GiftBundle {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  products: BundleProduct[];
  bundlePrice: number;
  originalPrice: number;
  savings: number;
  images: string[];
  giftCategories: GiftCategory[];
  giftOccasions: GiftOccasion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BundleProduct {
  productId: string;
  quantity: number;
}
```

### Gift Message Model

```typescript
interface GiftMessage {
  id: string;
  orderId: string;
  orderItemId: string;
  message: string;
  messageType: 'HANDWRITTEN' | 'PRINTED';
  from?: string;
  to?: string;
  createdAt: string;
}
```

### Gift Analytics Model

```typescript
interface GiftAnalytics {
  vendorId: string;
  period: string; // YYYY-MM
  totalGiftOrders: number;
  totalGiftRevenue: number;
  giftOrdersByCategory: Record<GiftCategory, number>;
  giftOrdersByOccasion: Record<GiftOccasion, number>;
  topGiftProducts: {
    productId: string;
    productName: string;
    orderCount: number;
    revenue: number;
  }[];
  averageGiftOrderValue: number;
  giftWrappingRevenue: number;
}
```

## Components and Interfaces

### 1. Gift Landing Page

**Route:** `/gifts`

**Features:**
- Hero section with compelling copy
- Quick filter buttons (For Adults, Kids, Pets, Home)
- Occasion tags
- Featured gift products grid
- Urgency indicators
- Call-to-action buttons

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Hero: "Last-Minute Gifts from Local Makers"]     │
│  [Subheading: "Unique, thoughtful, ready today"]   │
│  [CTA: Start Gift Finder]                          │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Quick Filters:                                     │
│  [For Adults] [For Kids] [For Pets] [For Home]     │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Occasions:                                         │
│  [Birthday] [Anniversary] [Thank You] [Just Because]│
└─────────────────────────────────────────────────────┘
┌──────────────┬──────────────┬──────────────┬────────┐
│  [Product 1] │  [Product 2] │  [Product 3] │  ...   │
│  🎁 Gift     │  🎁 Gift     │  🎁 Gift     │        │
│  Ready Today │  Gift Wrap ✓ │  Bundle      │        │
└──────────────┴──────────────┴──────────────┴────────┘
```

### 2. Gift Finder Quiz

**Route:** `/gifts/finder`

**Flow:**
1. Welcome screen with quiz intro
2. Question 1: Who's it for?
3. Question 2: What's the occasion?
4. Question 3: What's your budget?
5. Question 4: When do you need it?
6. Results: Recommended products

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Gift Finder                              [Step 2/4]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  What's the occasion?                               │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                 │
│  │  🎂         │  │  💝         │                 │
│  │  Birthday   │  │  Anniversary│                 │
│  └─────────────┘  └─────────────┘                 │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                 │
│  │  🙏         │  │  🎉         │                 │
│  │  Thank You  │  │  Just Because│                │
│  └─────────────┘  └─────────────┘                 │
│                                                     │
│  [Back]                              [Next]        │
└─────────────────────────────────────────────────────┘
```

### 3. Gift Product Card

**Enhanced product card with gift-specific elements:**

```typescript
interface GiftProductCardProps {
  product: Product;
  showGiftBadges?: boolean;
  showUrgency?: boolean;
  showGiftWrapOption?: boolean;
}
```

**Visual Elements:**
- 🎁 Gift icon overlay
- "Great Gift!" badge
- "Gift Wrap Available" tag
- "Ready Today" urgency badge
- Gift category label
- Quick "Add Gift Message" button

### 4. Gift Wrapping Option

**Component:** `GiftWrappingOption`

**Features:**
- Toggle to add gift wrapping
- Display wrapping price
- Show wrapping style preview (if available)
- Add to cart with wrapping

```typescript
interface GiftWrappingOptionProps {
  available: boolean;
  price: number;
  onToggle: (enabled: boolean) => void;
  previewImage?: string;
}
```

### 5. Gift Message Input

**Component:** `GiftMessageInput`

**Features:**
- Text area for message (250 char limit)
- Character counter
- Message type selector (handwritten/printed)
- Optional "From" and "To" fields
- Preview of how message will appear

```typescript
interface GiftMessageInputProps {
  onSave: (message: GiftMessage) => void;
  maxLength?: number;
  defaultMessage?: string;
}
```

### 6. Gift Bundle Creator (Vendor)

**Component:** `GiftBundleCreator`

**Features:**
- Bundle name and description inputs
- Product selector (multi-select from vendor's products)
- Quantity selector for each product
- Bundle price input
- Automatic savings calculation
- Image uploader for bundle
- Gift category and occasion selectors

### 7. Featured Gifts Section (Homepage)

**Component:** `FeaturedGiftsSection`

**Features:**
- Section title: "Perfect Last-Minute Gifts"
- 3 category cards (For Adults, For Kids, For Pets)
- Horizontal scrolling product carousel
- "View All Gifts" CTA button

## Search and Filtering

### OpenSearch Index Updates

Add gift-specific fields to product index:

```json
{
  "mappings": {
    "properties": {
      "isGiftWorthy": { "type": "boolean" },
      "giftCategories": { "type": "keyword" },
      "giftOccasions": { "type": "keyword" },
      "giftWrappingAvailable": { "type": "boolean" },
      "ageRange": { "type": "keyword" },
      "petType": { "type": "keyword" },
      "giftTags": { "type": "keyword" }
    }
  }
}
```

### Filter Query Structure

```typescript
interface GiftSearchFilters {
  categories?: GiftCategory[];
  occasions?: GiftOccasion[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: 'TODAY' | 'TOMORROW' | 'THIS_WEEK';
  ageRange?: AgeRange;
  petType?: PetType;
  giftWrappingAvailable?: boolean;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}
```

### Recommendation Algorithm

**Gift Finder Quiz Results:**

```typescript
function calculateGiftRecommendations(
  quizAnswers: QuizAnswers,
  products: Product[]
): Product[] {
  // 1. Filter by recipient category
  let filtered = products.filter(p => 
    p.giftCategories.includes(quizAnswers.recipient)
  );
  
  // 2. Filter by occasion
  if (quizAnswers.occasion) {
    filtered = filtered.filter(p =>
      p.giftOccasions.includes(quizAnswers.occasion)
    );
  }
  
  // 3. Filter by price range
  filtered = filtered.filter(p =>
    p.price >= quizAnswers.budget.min &&
    p.price <= quizAnswers.budget.max
  );
  
  // 4. Filter by availability
  if (quizAnswers.urgency === 'TODAY') {
    filtered = filtered.filter(p =>
      p.vendor.deliveryOptions.includes('SAME_DAY')
    );
  }
  
  // 5. Score and sort
  const scored = filtered.map(p => ({
    product: p,
    score: calculateRelevanceScore(p, quizAnswers)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, 12).map(s => s.product);
}

function calculateRelevanceScore(
  product: Product,
  answers: QuizAnswers
): number {
  let score = 0;
  
  // Exact category match: +10
  if (product.giftCategories.includes(answers.recipient)) {
    score += 10;
  }
  
  // Exact occasion match: +8
  if (product.giftOccasions.includes(answers.occasion)) {
    score += 8;
  }
  
  // Price in middle of range: +5
  const midPrice = (answers.budget.min + answers.budget.max) / 2;
  const priceDiff = Math.abs(product.price - midPrice);
  score += Math.max(0, 5 - (priceDiff / midPrice) * 5);
  
  // Gift wrapping available: +3
  if (product.giftWrappingAvailable) {
    score += 3;
  }
  
  // High rating: +2
  if (product.averageRating >= 4.5) {
    score += 2;
  }
  
  // Popular (many reviews): +1
  if (product.reviewCount >= 10) {
    score += 1;
  }
  
  return score;
}
```

## API Endpoints

### GraphQL Queries

```graphql
# Search gift products
query SearchGiftProducts(
  $filters: GiftSearchFilters!
  $limit: Int
  $nextToken: String
) {
  searchGiftProducts(
    filters: $filters
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      name
      price
      images
      isGiftWorthy
      giftCategories
      giftOccasions
      giftWrappingAvailable
      giftWrappingPrice
      vendor {
        id
        businessName
        logo
      }
    }
    nextToken
    total
  }
}

# Get gift recommendations from quiz
query GetGiftRecommendations($quizAnswers: QuizAnswersInput!) {
  getGiftRecommendations(quizAnswers: $quizAnswers) {
    products {
      id
      name
      price
      images
      giftCategories
      relevanceScore
    }
    totalMatches
  }
}

# Get gift bundle details
query GetGiftBundle($id: ID!) {
  getGiftBundle(id: $id) {
    id
    name
    description
    bundlePrice
    originalPrice
    savings
    products {
      product {
        id
        name
        price
        images
      }
      quantity
    }
    vendor {
      id
      businessName
    }
  }
}

# Get vendor gift analytics
query GetVendorGiftAnalytics($vendorId: ID!, $period: String!) {
  getVendorGiftAnalytics(vendorId: $vendorId, period: $period) {
    totalGiftOrders
    totalGiftRevenue
    giftOrdersByCategory
    giftOrdersByOccasion
    topGiftProducts {
      productId
      productName
      orderCount
      revenue
    }
  }
}
```

### GraphQL Mutations

```graphql
# Update product gift settings
mutation UpdateProductGiftSettings($input: UpdateProductGiftSettingsInput!) {
  updateProductGiftSettings(input: $input) {
    id
    isGiftWorthy
    giftCategories
    giftOccasions
    giftWrappingAvailable
    giftWrappingPrice
  }
}

# Create gift bundle
mutation CreateGiftBundle($input: CreateGiftBundleInput!) {
  createGiftBundle(input: $input) {
    id
    name
    bundlePrice
    savings
  }
}

# Add gift message to order item
mutation AddGiftMessage($input: AddGiftMessageInput!) {
  addGiftMessage(input: $input) {
    id
    message
    messageType
  }
}
```

## Error Handling

### Common Error Scenarios

1. **No Gift Products Found**
   - Display: "No gifts match your criteria. Try adjusting your filters."
   - Action: Show popular gifts or suggest removing filters

2. **Quiz Incomplete**
   - Display: "Please answer all questions to get recommendations"
   - Action: Highlight unanswered questions

3. **Bundle Creation Errors**
   - Invalid products: "One or more products are no longer available"
   - Price validation: "Bundle price must be less than original price"

4. **Gift Message Too Long**
   - Display: "Message exceeds 250 characters"
   - Action: Show character count and trim message

5. **Gift Wrapping Unavailable**
   - Display: "Gift wrapping is not available for this product"
   - Action: Suggest similar products with gift wrapping

## Testing Strategy

### Unit Tests

- Gift filter logic
- Recommendation algorithm
- Price calculation for bundles
- Message validation

### Integration Tests

- Gift product search with filters
- Quiz flow and recommendations
- Bundle creation and purchase
- Gift message attachment to orders

### E2E Tests

- Complete gift finder quiz flow
- Add gift-wrapped product to cart
- Create and purchase gift bundle
- Vendor gift analytics display

## Performance Considerations

### Caching Strategy

- Cache gift landing page for 5 minutes
- Cache featured gifts for 15 minutes
- Cache quiz recommendations for user session
- Cache bundle details for 10 minutes

### Optimization

- Lazy load product images
- Paginate gift search results (24 per page)
- Index gift fields in OpenSearch for fast filtering
- Pre-calculate bundle savings

### Monitoring

- Track gift page load times
- Monitor quiz completion rate
- Track gift conversion rate
- Monitor gift search performance

## Accessibility

- Keyboard navigation for quiz
- Screen reader support for gift badges
- ARIA labels for filter buttons
- High contrast mode for urgency indicators
- Alt text for all gift images

## Mobile Considerations

- Touch-friendly quiz buttons
- Swipeable gift categories
- Sticky filter bar on mobile
- Bottom sheet for gift message input
- Responsive grid for gift products

## Future Enhancements

1. **Gift Registry**: Allow users to create wish lists
2. **Gift Subscriptions**: Recurring gift deliveries
3. **Corporate Gifting**: Bulk orders for businesses
4. **Gift Cards**: Digital gift cards for Makeriess
5. **Gift Tracking**: Real-time delivery tracking for gifts
6. **Social Sharing**: Share gift ideas with friends
7. **Gift Reminders**: Remind users of upcoming occasions
8. **AI Recommendations**: ML-powered gift suggestions
