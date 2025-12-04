# Auto-Categorization Engine - Design Document

## Overview

The Auto-Categorization Engine is the core intelligence behind Makeriess's "set it and forget it" vendor experience. It automatically analyzes products synced from POS systems and assigns appropriate categories, gift tags, and metadata without requiring vendor input.

## Design Philosophy

**Zero Vendor Friction**: Vendors should only need to connect their POS once. Everything else happens automatically.

**High Confidence, Auto-Publish**: When we're confident (90%+), publish immediately.
**Medium Confidence, Flag for Review**: When uncertain (70-89%), publish but suggest review.
**Low Confidence, Hold**: When very uncertain (<70%), require vendor approval.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  POS System (Square/Toast/Shopify)                          │
│  Product Data: name, description, category, price, images   │
└────────────────────┬────────────────────────────────────────┘
                     │ Sync Event (every 15 min or webhook)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  POS Sync Lambda                                             │
│  - Fetch new/updated products                                │
│  - Detect changes (new, updated, deleted)                    │
│  - Normalize data format                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Auto-Categorization Engine Lambda                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Text Analysis                                    │   │
│  │     - Extract keywords from name/description         │   │
│  │     - Normalize text (lowercase, remove special chars)│  │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. Main Category Detection                          │   │
│  │     - FOOD: bakery, restaurant, food keywords        │   │
│  │     - CRAFTS: handmade, artisan, craft keywords      │   │
│  │     - FLOWERS: flower, plant, bouquet keywords       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. Gift-Worthiness Detection                        │   │
│  │     - Price range check ($10-$200)                   │   │
│  │     - Not consumable/service                         │   │
│  │     - Has gift keywords or suitable category         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. Gift Category Assignment                         │   │
│  │     - Adults: wine, candle, jewelry, soap            │   │
│  │     - Kids: toy, children, baby, plush               │   │
│  │     - Pets: dog, cat, pet, treat                     │   │
│  │     - Home: decor, plant, art, pillow                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  5. Confidence Scoring                               │   │
│  │     - Calculate based on keyword matches             │   │
│  │     - Adjust for price appropriateness               │   │
│  │     - Factor in category clarity                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  6. Metadata Generation                              │   │
│  │     - Search tags                                    │   │
│  │     - Dietary tags (for food)                        │   │
│  │     - Age range (for kids products)                  │   │
│  │     - Pet type (for pet products)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Decision Engine                                             │
│  - If confidence >= 90%: Auto-publish                        │
│  - If confidence 70-89%: Publish + flag for review           │
│  - If confidence < 70%: Hold for vendor review               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  DynamoDB + OpenSearch                                       │
│  - Store categorized products                                │
│  - Index for search                                          │
│  - Track confidence scores                                   │
│  - Flag review status                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Customer-Facing Site + Vendor Dashboard                    │
│  - Products appear in correct categories                    │
│  - Gifts section populated                                   │
│  - Vendors see review flags (if needed)                      │
└─────────────────────────────────────────────────────────────┘
```

## Categorization Algorithm

### 1. Text Analysis

```typescript
interface ProductText {
  name: string;
  description: string;
  category: string;
  combinedText: string;  // All text combined and normalized
  keywords: string[];    // Extracted keywords
}

function analyzeText(product: POSProduct): ProductText {
  const name = product.name || '';
  const description = product.description || '';
  const category = product.category || '';
  
  // Combine and normalize
  const combinedText = `${name} ${description} ${category}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract keywords (words 3+ chars, excluding common words)
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that'];
  const keywords = combinedText
    .split(' ')
    .filter(word => word.length >= 3 && !stopWords.includes(word));
  
  return {
    name,
    description,
    category,
    combinedText,
    keywords
  };
}
```

### 2. Main Category Detection

```typescript
enum MainCategory {
  FOOD = 'FOOD',
  CRAFTS = 'CRAFTS',
  FLOWERS = 'FLOWERS',
  OTHER = 'OTHER'
}

const CATEGORY_KEYWORDS = {
  FOOD: [
    'bread', 'cake', 'pastry', 'cookie', 'pie', 'tart', 'muffin', 'scone',
    'sandwich', 'salad', 'soup', 'pizza', 'pasta', 'burger', 'taco',
    'coffee', 'tea', 'juice', 'smoothie', 'latte', 'espresso',
    'bakery', 'restaurant', 'cafe', 'food', 'meal', 'dish', 'cuisine',
    'chocolate', 'candy', 'dessert', 'sweet', 'treat', 'snack'
  ],
  CRAFTS: [
    'handmade', 'artisan', 'craft', 'handcrafted', 'homemade',
    'jewelry', 'necklace', 'bracelet', 'earring', 'ring',
    'pottery', 'ceramic', 'clay', 'sculpture',
    'painting', 'art', 'print', 'canvas', 'artwork',
    'soap', 'candle', 'lotion', 'balm', 'scrub',
    'leather', 'wood', 'metal', 'glass', 'fabric',
    'knit', 'crochet', 'sewn', 'quilted', 'embroidered'
  ],
  FLOWERS: [
    'flower', 'bouquet', 'arrangement', 'floral', 'bloom',
    'rose', 'lily', 'tulip', 'orchid', 'sunflower', 'daisy',
    'plant', 'succulent', 'cactus', 'fern', 'ivy',
    'vase', 'pot', 'planter', 'garden', 'botanical'
  ]
};

function detectMainCategory(text: ProductText): {
  category: MainCategory;
  confidence: number;
  matchedKeywords: string[];
} {
  const scores: Record<MainCategory, number> = {
    FOOD: 0,
    CRAFTS: 0,
    FLOWERS: 0,
    OTHER: 0
  };
  
  const matches: Record<MainCategory, string[]> = {
    FOOD: [],
    CRAFTS: [],
    FLOWERS: [],
    OTHER: []
  };
  
  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.combinedText.includes(keyword)) {
        scores[category as MainCategory]++;
        matches[category as MainCategory].push(keyword);
      }
    }
  }
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  const category = (Object.keys(scores) as MainCategory[])
    .find(cat => scores[cat] === maxScore) || MainCategory.OTHER;
  
  // Calculate confidence (0-100)
  const totalKeywords = text.keywords.length;
  const confidence = totalKeywords > 0 
    ? Math.min(100, (maxScore / totalKeywords) * 100)
    : 0;
  
  return {
    category,
    confidence,
    matchedKeywords: matches[category]
  };
}
```

### 3. Gift-Worthiness Detection

```typescript
const GIFT_KEYWORDS = [
  'gift', 'present', 'birthday', 'anniversary', 'celebration',
  'special', 'unique', 'handmade', 'artisan', 'custom',
  'personalized', 'engraved', 'monogram', 'luxury', 'premium'
];

const NON_GIFT_KEYWORDS = [
  'bulk', 'wholesale', 'catering', 'service', 'class', 'lesson',
  'subscription', 'membership', 'ticket', 'voucher'
];

function isGiftWorthy(product: POSProduct, text: ProductText): {
  isGift: boolean;
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;
  
  // Price check (gifts typically $10-$200)
  if (product.price >= 10 && product.price <= 200) {
    score += 30;
    reasons.push('Price in gift range');
  } else if (product.price < 10) {
    score -= 20;
    reasons.push('Price too low for typical gift');
  } else if (product.price > 200) {
    score -= 10;
    reasons.push('Price high (luxury gift)');
  }
  
  // Check for gift keywords
  const giftKeywordMatches = GIFT_KEYWORDS.filter(kw => 
    text.combinedText.includes(kw)
  );
  if (giftKeywordMatches.length > 0) {
    score += giftKeywordMatches.length * 15;
    reasons.push(`Gift keywords: ${giftKeywordMatches.join(', ')}`);
  }
  
  // Check for non-gift keywords (disqualifiers)
  const nonGiftMatches = NON_GIFT_KEYWORDS.filter(kw =>
    text.combinedText.includes(kw)
  );
  if (nonGiftMatches.length > 0) {
    score -= nonGiftMatches.length * 25;
    reasons.push(`Non-gift keywords: ${nonGiftMatches.join(', ')}`);
  }
  
  // Category-based scoring
  if (text.category.toLowerCase().includes('gift')) {
    score += 40;
    reasons.push('Category indicates gift');
  }
  
  // Crafts/handmade are often gifts
  if (text.combinedText.includes('handmade') || 
      text.combinedText.includes('artisan')) {
    score += 20;
    reasons.push('Handmade/artisan product');
  }
  
  // Consumables (food) are less likely gifts unless special
  if (text.combinedText.includes('meal') || 
      text.combinedText.includes('lunch') ||
      text.combinedText.includes('dinner')) {
    score -= 15;
    reasons.push('Consumable meal');
  }
  
  // Normalize to 0-100
  const confidence = Math.max(0, Math.min(100, score));
  const isGift = confidence >= 50;
  
  return {
    isGift,
    confidence,
    reasons
  };
}
```

### 4. Gift Category Assignment

```typescript
enum GiftCategory {
  ADULTS = 'ADULTS',
  KIDS = 'KIDS',
  PETS = 'PETS',
  HOME = 'HOME'
}

const GIFT_CATEGORY_KEYWORDS = {
  ADULTS: [
    'wine', 'beer', 'spirits', 'alcohol',
    'candle', 'soap', 'lotion', 'bath', 'spa',
    'jewelry', 'necklace', 'bracelet', 'earring',
    'coffee', 'tea', 'gourmet', 'artisan',
    'chocolate', 'truffle', 'confection',
    'men', 'women', 'adult', 'him', 'her'
  ],
  KIDS: [
    'toy', 'game', 'puzzle', 'book',
    'kids', 'children', 'child', 'baby', 'toddler',
    'plush', 'stuffed', 'doll', 'action figure',
    'educational', 'learning', 'play',
    'boy', 'girl', 'infant', 'newborn'
  ],
  PETS: [
    'dog', 'puppy', 'canine',
    'cat', 'kitten', 'feline',
    'pet', 'animal',
    'treat', 'chew', 'toy',
    'collar', 'leash', 'harness',
    'bed', 'bowl', 'food'
  ],
  HOME: [
    'decor', 'decoration', 'decorative',
    'plant', 'succulent', 'flower', 'vase',
    'pillow', 'cushion', 'throw',
    'art', 'print', 'painting', 'frame',
    'candle', 'diffuser', 'scent',
    'kitchen', 'dining', 'table',
    'home', 'house', 'living'
  ]
};

function assignGiftCategories(text: ProductText): {
  categories: GiftCategory[];
  confidence: Record<GiftCategory, number>;
} {
  const scores: Record<GiftCategory, number> = {
    ADULTS: 0,
    KIDS: 0,
    PETS: 0,
    HOME: 0
  };
  
  // Count keyword matches
  for (const [category, keywords] of Object.entries(GIFT_CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.combinedText.includes(keyword)) {
        scores[category as GiftCategory] += 10;
      }
    }
  }
  
  // Normalize scores to 0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  const confidence: Record<GiftCategory, number> = {
    ADULTS: Math.min(100, (scores.ADULTS / maxScore) * 100),
    KIDS: Math.min(100, (scores.KIDS / maxScore) * 100),
    PETS: Math.min(100, (scores.PETS / maxScore) * 100),
    HOME: Math.min(100, (scores.HOME / maxScore) * 100)
  };
  
  // Select categories with confidence >= 50%
  const categories = (Object.keys(confidence) as GiftCategory[])
    .filter(cat => confidence[cat] >= 50);
  
  // Default to ADULTS if no clear match
  if (categories.length === 0) {
    categories.push(GiftCategory.ADULTS);
    confidence.ADULTS = 60;
  }
  
  return {
    categories,
    confidence
  };
}
```

### 5. Overall Confidence Calculation

```typescript
function calculateOverallConfidence(
  mainCategoryConf: number,
  giftWorthinessConf: number,
  giftCategoryConf: number[]
): number {
  // Weighted average
  const weights = {
    mainCategory: 0.3,
    giftWorthiness: 0.4,
    giftCategory: 0.3
  };
  
  const avgGiftCategoryConf = giftCategoryConf.length > 0
    ? giftCategoryConf.reduce((a, b) => a + b, 0) / giftCategoryConf.length
    : 0;
  
  const overall = 
    (mainCategoryConf * weights.mainCategory) +
    (giftWorthinessConf * weights.giftWorthiness) +
    (avgGiftCategoryConf * weights.giftCategory);
  
  return Math.round(overall);
}
```

## Complete Auto-Categorization Flow

```typescript
interface AutoCategorizationResult {
  mainCategory: MainCategory;
  isGiftWorthy: boolean;
  giftCategories: GiftCategory[];
  giftOccasions: GiftOccasion[];
  ageRange?: AgeRange;
  petType?: PetType;
  searchTags: string[];
  dietaryTags: string[];
  confidence: number;
  autoTagged: boolean;
  reviewRequired: boolean;
  reasons: string[];
}

async function autoCategorizProduct(
  product: POSProduct
): Promise<AutoCategorizationResult> {
  // 1. Analyze text
  const text = analyzeText(product);
  
  // 2. Detect main category
  const mainCategoryResult = detectMainCategory(text);
  
  // 3. Check gift-worthiness
  const giftResult = isGiftWorthy(product, text);
  
  // 4. Assign gift categories (if gift-worthy)
  let giftCategories: GiftCategory[] = [];
  let giftCategoryConfidence: Record<GiftCategory, number> = {
    ADULTS: 0,
    KIDS: 0,
    PETS: 0,
    HOME: 0
  };
  
  if (giftResult.isGift) {
    const giftCatResult = assignGiftCategories(text);
    giftCategories = giftCatResult.categories;
    giftCategoryConfidence = giftCatResult.confidence;
  }
  
  // 5. Calculate overall confidence
  const confidence = calculateOverallConfidence(
    mainCategoryResult.confidence,
    giftResult.confidence,
    Object.values(giftCategoryConfidence)
  );
  
  // 6. Determine if review required
  const reviewRequired = confidence < 70;
  
  // 7. Generate metadata
  const searchTags = generateSearchTags(text);
  const dietaryTags = mainCategoryResult.category === MainCategory.FOOD
    ? detectDietaryTags(text)
    : [];
  
  // 8. Detect age range (if KIDS category)
  const ageRange = giftCategories.includes(GiftCategory.KIDS)
    ? detectAgeRange(text)
    : undefined;
  
  // 9. Detect pet type (if PETS category)
  const petType = giftCategories.includes(GiftCategory.PETS)
    ? detectPetType(text)
    : undefined;
  
  return {
    mainCategory: mainCategoryResult.category,
    isGiftWorthy: giftResult.isGift,
    giftCategories,
    giftOccasions: ['BIRTHDAY', 'THANK_YOU', 'JUST_BECAUSE'],
    ageRange,
    petType,
    searchTags,
    dietaryTags,
    confidence,
    autoTagged: true,
    reviewRequired,
    reasons: [
      ...mainCategoryResult.matchedKeywords.map(k => `Main: ${k}`),
      ...giftResult.reasons
    ]
  };
}
```

## Vendor Dashboard Integration

### Product List View

```typescript
interface VendorProductView {
  id: string;
  name: string;
  price: number;
  image: string;
  autoCategorizationStatus: {
    isAutoTagged: boolean;
    confidence: number;
    mainCategory: MainCategory;
    isGiftWorthy: boolean;
    giftCategories: GiftCategory[];
    reviewRequired: boolean;
    vendorOverride: boolean;
  };
}
```

### Review UI

```
┌─────────────────────────────────────────────────────────┐
│  Product: Lavender Soap Bar                             │
│  Price: $12                                              │
│  Image: [soap image]                                     │
├─────────────────────────────────────────────────────────┤
│  🎁 Auto-tagged as gift (Confidence: 85%)               │
│  Categories: For Adults, For Home                        │
│  Main Category: CRAFTS                                   │
│                                                          │
│  [✓ Keep as gift] [✗ Remove from gifts] [Edit]         │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Caching
- Cache keyword lists in memory
- Cache vendor preferences
- Cache categorization results for 24 hours

### Batch Processing
- Process products in batches of 50
- Use parallel Lambda invocations for large syncs
- Queue low-priority re-categorizations

### Monitoring
- Track categorization accuracy
- Monitor confidence score distribution
- Alert on high review-required rates

## Future Enhancements

1. **Machine Learning**: Train ML model on vendor feedback
2. **Image Analysis**: Use AWS Rekognition for visual categorization
3. **Vendor Patterns**: Learn from vendor's manual overrides
4. **Seasonal Adjustments**: Boost holiday-related gifts in December
5. **Price Trends**: Adjust gift price ranges by region
6. **Customer Behavior**: Use purchase data to improve categorization

## Testing Strategy

### Unit Tests
- Test each categorization function independently
- Test edge cases (empty descriptions, unusual prices)
- Test keyword matching accuracy

### Integration Tests
- Test full categorization pipeline
- Test confidence score calculations
- Test review threshold logic

### A/B Testing
- Compare auto-categorization vs manual
- Measure customer discovery rates
- Track vendor satisfaction

## Success Metrics

- **Auto-Categorization Rate**: % of products auto-published (target: 80%+)
- **Confidence Distribution**: % in each confidence bucket
- **Vendor Override Rate**: % of products vendors manually adjust (target: <10%)
- **Customer Discovery**: % of gift products viewed/purchased
- **Vendor Satisfaction**: Survey score on auto-categorization (target: 4.5/5)
