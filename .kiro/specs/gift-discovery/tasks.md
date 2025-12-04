# Implementation Plan - Gift Discovery Feature

## Overview

This implementation plan breaks down the Gift Discovery feature into discrete, manageable coding tasks. Each task builds incrementally on previous work to create a complete gift shopping experience.

---

## Phase 1: Data Model & Backend Foundation

- [ ] 1. Extend Product data model with gift fields
  - Add gift-related fields to Product schema in `amplify/data/resource.ts`
  - Add `isGiftWorthy`, `giftCategories`, `giftOccasions` fields
  - Add `giftWrappingAvailable`, `giftWrappingPrice` fields
  - Add `ageRange`, `petType`, `giftTags` fields
  - Create enums for GiftCategory, GiftOccasion, AgeRange, PetType
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Create GiftBundle data model
  - Define GiftBundle schema with id, vendorId, name, description
  - Add products array with productId and quantity
  - Add bundlePrice, originalPrice, savings fields
  - Add images, giftCategories, giftOccasions fields
  - Add isActive, createdAt, updatedAt fields
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 3. Create GiftMessage data model
  - Define GiftMessage schema with id, orderId, orderItemId
  - Add message, messageType (HANDWRITTEN/PRINTED) fields
  - Add optional from, to fields
  - Add createdAt timestamp
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Create GiftAnalytics data model
  - Define GiftAnalytics schema with vendorId, period
  - Add totalGiftOrders, totalGiftRevenue fields
  - Add giftOrdersByCategory, giftOrdersByOccasion maps
  - Add topGiftProducts array with product details
  - Add averageGiftOrderValue, giftWrappingRevenue fields
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5. Update OpenSearch index for gift fields
  - Add gift-specific fields to product index mapping
  - Add isGiftWorthy boolean field
  - Add giftCategories, giftOccasions keyword fields
  - Add ageRange, petType keyword fields
  - Create index update Lambda function
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Implement gift product search query
  - Create searchGiftProducts GraphQL query
  - Implement filtering by giftCategories
  - Implement filtering by giftOccasions
  - Implement filtering by price range
  - Implement filtering by availability (same-day, next-day)
  - Add pagination support
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 7. Implement gift recommendation algorithm
  - Create getGiftRecommendations GraphQL query
  - Implement quiz answer processing
  - Implement product filtering by recipient category
  - Implement product filtering by occasion and budget
  - Implement relevance scoring algorithm
  - Return top 12 recommended products
  - _Requirements: 4.6, 4.7_

- [ ] 8. Implement gift bundle mutations
  - Create createGiftBundle mutation
  - Create updateGiftBundle mutation
  - Create deleteGiftBundle mutation
  - Implement bundle price validation (must be less than sum)
  - Calculate and store savings automatically
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement gift message mutations
  - Create addGiftMessage mutation
  - Validate message length (250 char max)
  - Store message with order item
  - Create getGiftMessages query for vendor orders
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Implement gift analytics aggregation
  - Create Lambda function to aggregate gift sales data
  - Calculate gift orders and revenue by category
  - Calculate gift orders by occasion
  - Identify top gift products
  - Schedule daily aggregation via EventBridge
  - Create getVendorGiftAnalytics query
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 2: Core UI Components

- [ ] 11. Create gift type definitions
  - Create `src/lib/types/gifts.ts` file
  - Define GiftCategory, GiftOccasion enums
  - Define AgeRange, PetType enums
  - Define GiftBundle, GiftMessage interfaces
  - Define GiftSearchFilters, QuizAnswers interfaces
  - Export all gift-related types
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 12. Create gift API utilities
  - Create `src/lib/api/gifts.ts` file
  - Implement searchGiftProducts function
  - Implement getGiftRecommendations function
  - Implement createGiftBundle function
  - Implement addGiftMessage function
  - Implement getVendorGiftAnalytics function
  - Add error handling for all API calls
  - _Requirements: 3.1, 4.6, 6.1, 7.1, 10.1_

- [ ] 13. Create GiftProductCard component
  - Create `src/components/gifts/GiftProductCard.tsx`
  - Display product with gift icon (🎁) overlay
  - Show "Great Gift!" badge
  - Show "Gift Wrap Available" tag if applicable
  - Show "Ready Today" urgency badge
  - Display primary gift category label
  - Add "Add Gift Message" quick action button
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 14. Create GiftCategoryCards component
  - Create `src/components/gifts/GiftCategoryCards.tsx`
  - Display 4 category cards: Adults, Kids, Pets, Home
  - Add icons for each category
  - Make cards clickable to filter gifts
  - Add hover effects and animations
  - _Requirements: 1.2, 9.3_

- [ ] 15. Create GiftFilterSidebar component
  - Create `src/components/gifts/GiftFilterSidebar.tsx`
  - Add recipient category checkboxes
  - Add occasion checkboxes
  - Add price range slider
  - Add availability radio buttons
  - Add age range filter (when Kids selected)
  - Add pet type filter (when Pets selected)
  - Add "Clear Filters" button
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 16. Create GiftWrappingOption component
  - Create `src/components/gifts/GiftWrappingOption.tsx`
  - Display toggle for gift wrapping
  - Show wrapping price
  - Show preview image if available
  - Update product price when toggled
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 17. Create GiftMessageInput component
  - Create `src/components/gifts/GiftMessageInput.tsx`
  - Add text area with 250 character limit
  - Display character counter
  - Add message type selector (handwritten/printed)
  - Add optional "From" and "To" fields
  - Show message preview
  - Add save/cancel buttons
  - _Requirements: 6.1, 6.2, 6.3_

---

## Phase 3: Gift Landing Page

- [ ] 18. Create gift landing page
  - Create `src/app/gifts/page.tsx`
  - Implement page layout with hero section
  - Add GiftCategoryCards component
  - Add occasion filter buttons
  - Add product grid with GiftProductCard components
  - Implement pagination
  - Add loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 19. Create GiftLandingHero component
  - Create `src/components/gifts/GiftLandingHero.tsx`
  - Add hero heading: "Last-Minute Gifts from Local Makers"
  - Add subheading about unique, thoughtful gifts
  - Add "Start Gift Finder" CTA button
  - Add background image or gradient
  - Make responsive for mobile
  - _Requirements: 1.1, 1.5_

- [ ] 20. Implement gift filtering logic
  - Add filter state management to gifts page
  - Connect filters to searchGiftProducts API
  - Update URL params when filters change
  - Implement filter persistence
  - Add filter count badge
  - Handle empty results state
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 21. Add urgency indicators to products
  - Calculate product availability based on vendor delivery options
  - Display "Available Today" for same-day delivery
  - Display "Ready in 2 Hours" for quick pickup
  - Display "Ready Tomorrow" for next-day
  - Add visual urgency badges with colors
  - _Requirements: 1.4, 8.4_

---

## Phase 4: Gift Finder Quiz

- [ ] 22. Create gift finder quiz page
  - Create `src/app/gifts/finder/page.tsx`
  - Implement multi-step quiz flow
  - Add progress indicator
  - Add navigation (back/next buttons)
  - Add quiz state management
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 23. Create GiftFinderQuiz component
  - Create `src/components/gifts/GiftFinderQuiz.tsx`
  - Create welcome screen with quiz intro
  - Create Question 1: "Who's it for?" with category options
  - Create Question 2: "What's the occasion?" with occasion options
  - Create Question 3: "What's your budget?" with price ranges
  - Create Question 4: "When do you need it?" with urgency options
  - Add visual icons for each option
  - Make options clickable cards
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 24. Create quiz results page
  - Display recommended products based on quiz answers
  - Show "Your Perfect Gifts" heading
  - Display 12 recommended products in grid
  - Add "Refine Results" button to adjust filters
  - Add "Start Over" button to retake quiz
  - Show relevance score or match percentage
  - _Requirements: 4.6, 4.7_

- [ ] 25. Implement quiz recommendation logic
  - Call getGiftRecommendations API with quiz answers
  - Display loading state while fetching
  - Handle no results scenario
  - Sort products by relevance score
  - Cache recommendations for session
  - _Requirements: 4.6, 4.7_

---

## Phase 5: Gift Bundles

- [ ] 26. Create gift bundle detail page
  - Create `src/app/gifts/bundles/[id]/page.tsx`
  - Display bundle name and description
  - Show all products in bundle with quantities
  - Display bundle price vs original price
  - Show savings amount and percentage
  - Add "Add Bundle to Cart" button
  - Show vendor information
  - _Requirements: 7.5, 7.6_

- [ ] 27. Create GiftBundleCard component
  - Create `src/components/gifts/GiftBundleCard.tsx`
  - Display bundle with "Bundle" badge
  - Show bundle image or product collage
  - Display savings prominently
  - Show product count in bundle
  - Add hover effects
  - Make clickable to bundle detail page
  - _Requirements: 7.5_

- [ ] 28. Create GiftBundleCreator component (Vendor)
  - Create `src/components/vendor/GiftBundleCreator.tsx`
  - Add bundle name and description inputs
  - Add product multi-select from vendor's products
  - Add quantity selector for each product
  - Add bundle price input with validation
  - Calculate and display savings automatically
  - Add image uploader for bundle
  - Add gift category and occasion selectors
  - Add save/cancel buttons
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 29. Add bundle management to vendor products page
  - Add "Create Gift Bundle" button to vendor products page
  - Display existing bundles in a separate section
  - Add edit/delete actions for bundles
  - Show bundle performance metrics
  - _Requirements: 7.1, 7.5_

---

## Phase 6: Gift Services Integration

- [ ] 30. Integrate gift wrapping into product detail page
  - Add GiftWrappingOption component to product page
  - Show wrapping option only if available
  - Update cart item with wrapping selection
  - Display wrapping price in cart
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 31. Integrate gift messages into cart
  - Add "Add Gift Message" button for each gift-worthy item in cart
  - Open GiftMessageInput modal on click
  - Save message to cart item
  - Display message preview in cart
  - Allow editing/removing messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 32. Update checkout to handle gift services
  - Display gift wrapping charges in order summary
  - Include gift messages in order data
  - Show gift items with special icon in order review
  - Pass gift data to order creation
  - _Requirements: 5.5, 6.5_

- [ ] 33. Update vendor order view for gift orders
  - Display gift icon for gift-worthy items
  - Show gift messages prominently
  - Indicate gift wrapping requirement
  - Add "Print Gift Message" button
  - _Requirements: 6.5_

---

## Phase 7: Homepage Integration

- [ ] 34. Create FeaturedGiftsSection component
  - Create `src/components/gifts/FeaturedGiftsSection.tsx`
  - Add section title: "Perfect Last-Minute Gifts"
  - Display 3 category cards (Adults, Kids, Pets)
  - Add horizontal scrolling product carousel
  - Show 8-12 featured gift products
  - Add "View All Gifts" CTA button
  - Make responsive for mobile
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 35. Integrate gifts section into homepage
  - Add FeaturedGiftsSection to homepage below hero
  - Fetch featured gift products
  - Add "Gifts 🎁" to main navigation menu
  - Update navigation to highlight gifts section
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 36. Update main navigation with gifts link
  - Add "Gifts" link to navigation bar
  - Add gift icon (🎁) next to text
  - Make prominent with special styling
  - Add hover effects
  - Ensure mobile menu includes gifts
  - _Requirements: 9.1_

---

## Phase 8: Vendor Gift Management

- [ ] 37. Create GiftProductSettings component
  - Create `src/components/vendor/GiftProductSettings.tsx`
  - Add "Gift-Worthy" toggle
  - Add gift category multi-select
  - Add gift occasion multi-select
  - Add age range selector (conditional)
  - Add pet type selector (conditional)
  - Add gift wrapping toggle and price input
  - Add gift tags input
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 38. Integrate gift settings into product upload/edit
  - Add GiftProductSettings to ManualProductUploadModal
  - Add GiftProductSettings to product edit form
  - Save gift settings with product data
  - Show gift settings in product list
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 39. Create GiftAnalyticsDashboard component
  - Create `src/components/vendor/GiftAnalyticsDashboard.tsx`
  - Display total gift orders and revenue
  - Show gift sales by category (pie chart)
  - Show gift sales by occasion (bar chart)
  - Display top 5 gift products table
  - Show average gift order value
  - Display gift wrapping revenue
  - Add date range selector
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 40. Add gift analytics to vendor analytics page
  - Add "Gift Sales" tab to vendor analytics page
  - Integrate GiftAnalyticsDashboard component
  - Fetch gift analytics data
  - Add export functionality for gift reports
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 9: Polish & Optimization

- [ ] 41. Add gift-specific SEO optimization
  - Add meta tags for gift pages
  - Create sitemap entries for gift categories
  - Add structured data for gift products
  - Optimize gift page titles and descriptions
  - Add Open Graph tags for social sharing
  - _Requirements: 1.1, 1.5_

- [ ] 42. Implement gift product caching
  - Cache gift landing page data
  - Cache featured gifts for homepage
  - Cache quiz recommendations for session
  - Cache bundle details
  - Set appropriate cache TTLs
  - _Requirements: 1.1, 9.5_

- [ ] 43. Add gift-related analytics tracking
  - Track gift page views
  - Track quiz completion rate
  - Track gift filter usage
  - Track gift conversion rate
  - Track bundle views and purchases
  - Track gift wrapping adoption rate
  - _Requirements: 10.1_

- [ ] 44. Create gift feature documentation
  - Document gift data models
  - Document gift API endpoints
  - Document gift components
  - Create vendor guide for gift features
  - Create customer FAQ for gifts
  - _Requirements: All_

- [ ] 45. Implement mobile-specific gift optimizations
  - Optimize quiz for mobile touch
  - Make gift filters mobile-friendly
  - Add swipeable gift categories
  - Optimize gift card layouts for small screens
  - Test gift message input on mobile
  - _Requirements: 1.1, 4.1, 9.3_

---

## Phase 10: Testing & Launch

- [ ]* 46. Write unit tests for gift features
  - Test gift filter logic
  - Test recommendation algorithm
  - Test bundle price calculations
  - Test message validation
  - Test gift analytics aggregation
  - _Requirements: All_

- [ ]* 47. Write integration tests for gift APIs
  - Test gift product search with filters
  - Test quiz flow and recommendations
  - Test bundle creation and purchase
  - Test gift message attachment
  - Test gift analytics queries
  - _Requirements: All_

- [ ]* 48. Perform E2E testing of gift flows
  - Test complete gift finder quiz flow
  - Test adding gift-wrapped product to cart
  - Test creating and purchasing gift bundle
  - Test gift message in order flow
  - Test vendor gift analytics display
  - _Requirements: All_

- [ ] 49. Conduct user acceptance testing
  - Test with sample customers
  - Test with sample vendors
  - Gather feedback on quiz experience
  - Validate gift discovery flow
  - Test on multiple devices and browsers
  - _Requirements: All_

- [ ] 50. Launch gift discovery feature
  - Deploy to production
  - Monitor error rates and performance
  - Track initial adoption metrics
  - Gather user feedback
  - Plan iteration based on data
  - _Requirements: All_

---

## Notes

- Tasks marked with `*` are optional testing tasks
- Each task should be completed before moving to the next
- Requirements are referenced for traceability
- Estimated total: 45 core tasks + 5 optional testing tasks
