# Implementation Plan

- [x] 1. Project initialization and infrastructure setup
  - Initialize Next.js 14 project with TypeScript and Tailwind CSS
  - Configure AWS Amplify Gen 2 with backend resources
  - Set up project structure with folders for components, lib, and app routes
  - Configure environment variables and AWS credentials
  - _Requirements: 16.1, 16.2_

- [x] 1.1 Set up Amplify authentication with Cognito
  - Create Cognito user pools for customers and vendors with separate groups
  - Configure password policies and MFA settings
  - Implement social login providers (Google, Apple)
  - _Requirements: 17.1, 17.2, 17.3, 17.5_

- [x] 1.2 Configure Route 53 and domain setup
  - Document Route 53 domain registration process
  - Document DNS records configuration
  - Document SSL certificate setup from ACM for \*.makeriess.com
  - Document CloudFront distribution with custom domain
  - _Requirements: 16.2_

- [x] 1.3 Set up DynamoDB tables with single-table design
  - Document main DynamoDB table structure with PK, SK, and GSI indexes
  - Define access patterns for customers, vendors, products, and orders
  - Document on-demand capacity mode configuration
  - Document encryption at rest setup
  - _Requirements: 16.3_

- [x] 1.4 Initialize OpenSearch domain for product search
  - Document OpenSearch domain configuration with 3 t3.medium nodes
  - Document index mappings for products with geo-point location field
  - Document IAM roles for Lambda access
  - _Requirements: 3.4_

- [x] 2. Implement GraphQL API with AppSync
  - Create AppSync API with GraphQL schema for all types
  - Define Customer, Vendor, Product, Order, and Review types
  - Implement queries for searchProducts, getNearbyVendors, getRecommendedProducts
  - Implement mutations for CRUD operations
  - Configure Cognito authorization rules
  - _Requirements: 1.1, 3.1, 4.1, 5.1_

- [x] 2.1 Create AppSync resolvers for DynamoDB
  - Implement VTL resolvers for getCustomer, getVendor, getProduct queries
  - Create resolvers for createOrder, updateProduct mutations
  - Configure batch resolvers for efficient data fetching
  - _Requirements: 1.1, 4.1, 5.1_

- [x] 2.2 Set up GraphQL subscriptions for real-time updates
  - Implement onProductUpdate subscription for vendor product changes
  - Create onOrderStatusChange subscription for customer order tracking
  - Configure subscription filters for user-specific updates
  - _Requirements: 11.1, 20.3_

- [x] 3. Build Product Service Lambda functions
  - Create product-sync Lambda for POS integration
  - Implement product search Lambda with OpenSearch queries
  - Build product CRUD Lambda with DynamoDB operations
  - Add geospatial filtering for location-based product discovery
  - _Requirements: 10.4, 11.1, 3.4_

- [x] 3.1 Implement POS integration for Square
  - Create OAuth flow for Square API connection
  - Store OAuth tokens securely in Secrets Manager
  - Implement initial product sync from Square catalog
  - Normalize Square product data to Makeriess schema
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 3.2 Implement POS integration for Toast
  - Create OAuth flow for Toast API connection
  - Store OAuth tokens securely in Secrets Manager
  - Implement initial product sync from Toast menu
  - Normalize Toast product data to Makeriess schema
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 3.3 Implement POS integration for Shopify
  - Create OAuth flow for Shopify API connection
  - Store OAuth tokens securely in Secrets Manager
  - Implement initial product sync from Shopify products
  - Normalize Shopify product data to Makeriess schema
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 3.4 Set up POS webhook handlers
  - Create API Gateway endpoints for POS webhooks
  - Implement webhook signature verification for each POS provider
  - Handle product update, delete, and inventory change events
  - Update DynamoDB and OpenSearch in real-time
  - _Requirements: 11.1, 11.2_

- [x] 3.5 Implement scheduled product sync
  - Create EventBridge rule to trigger sync every 15 minutes
  - Implement sync Lambda with retry logic and exponential backoff
  - Log sync history to DynamoDB with timestamp and status
  - Send alerts on repeated sync failures
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 4. Build Order Service Lambda functions
  - Create order processing Lambda for order creation and validation
  - Implement order status update Lambda
  - Build order history query Lambda
  - Add multi-vendor order splitting logic
  - _Requirements: 5.1, 5.2, 5.4, 9.1_

- [x] 4.1 Implement order validation logic
  - Validate vendor minimum order amounts per vendor in cart
  - Check product availability and inventory levels
  - Validate delivery address within vendor delivery zones
  - Calculate delivery fees based on distance and vendor zones
  - _Requirements: 5.3, 5.4, 9.2, 25.3, 25.4_

- [x] 4.2 Set up SQS queue for order processing
  - Create SQS queue for reliable order processing
  - Configure dead-letter queue for failed orders
  - Implement Lambda trigger from SQS queue
  - Add message deduplication and retry logic
  - _Requirements: 9.1_

- [x] 5. Build Payment Service with Stripe Connect
  - Create Stripe Connect onboarding flow for vendors
  - Implement payment intent creation for multi-vendor orders
  - Build split payment logic with platform commission (5-8%)
  - Handle payment confirmation and failure webhooks
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 5.1 Implement Stripe webhook handler
  - Create API Gateway endpoint for Stripe webhooks
  - Verify webhook signatures for security
  - Handle payment_intent.succeeded and payment_intent.failed events
  - Update order status in DynamoDB on payment confirmation
  - Publish PaymentConfirmed event to EventBridge
  - _Requirements: 9.4, 9.5_

- [x] 5.2 Add refund processing logic
  - Implement refund Lambda for order cancellations
  - Calculate prorated refunds for multi-vendor orders
  - Process refunds via Stripe API
  - Update order status and notify customer
  - _Requirements: 9.4_

- [x] 6. Build Vendor Service Lambda functions
  - Create vendor registration and profile management Lambda
  - Implement vendor dashboard data aggregation Lambda
  - Build vendor settings update Lambda (operating hours, delivery zones)
  - Add vendor pause/resume functionality
  - _Requirements: 10.1, 12.1, 25.1, 26.1, 26.3_

- [x] 6.1 Implement vendor operating hours management
  - Create UI and API for setting weekly operating hours
  - Implement logic to hide vendor products outside operating hours
  - Add "Currently closed" status display on vendor profiles
  - Allow scheduled orders for future time slots when vendor is open
  - _Requirements: 26.1, 26.2, 26.5_

- [x] 6.2 Implement custom delivery zones
  - Create map interface for vendors to draw delivery zone boundaries
  - Store delivery zone polygons in DynamoDB
  - Implement geospatial queries to check if address is in delivery zone
  - Calculate delivery fees based on customer address and vendor zones
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [x] 7. Build User Service Lambda functions
  - Create customer profile management Lambda
  - Implement favorites management (products and vendors)
  - Build saved addresses CRUD Lambda
  - Add loyalty points tracking and redemption logic
  - _Requirements: 6.1, 6.3, 6.4, 19.2, 22.3, 22.4_

- [x] 7.1 Implement saved payment methods
  - Integrate Stripe tokenization for payment method storage
  - Create API to save, list, and delete payment methods
  - Implement default payment method selection
  - Encrypt payment tokens with AWS KMS
  - _Requirements: 19.1, 19.3, 19.5_

- [x] 8. Build Notification Service Lambda functions
  - Create notification dispatcher Lambda for all notification types
  - Implement email notifications via Amazon SES
  - Set up push notifications via Amazon Pinpoint
  - Build SMS notifications for order updates
  - _Requirements: 15.1, 15.2, 15.3, 20.3_

- [x] 8.1 Set up EventBridge rules for notifications
  - Create rules to trigger notifications on OrderCreated events
  - Add rules for OrderStatusChanged events
  - Implement rules for vendor new product notifications
  - Configure notification preferences and opt-out handling
  - _Requirements: 15.1, 15.2, 15.4, 15.5_

- [x] 9. Build AI/ML Service Lambda functions
  - Create trend scoring Lambda using Amazon Bedrock
  - Implement product badge assignment (trending, limited, new, seasonal)
  - Build product description generation Lambda for manual uploads
  - Set up EventBridge schedule to run trend scoring every 6 hours
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 9.1 Implement Amazon Personalize integration
  - Create Personalize dataset group for user interactions
  - Import historical data (views, favorites, orders) to Personalize
  - Train recommendation model with user-personalization recipe
  - Build Lambda to fetch personalized recommendations
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 10. Build Analytics Service with Kinesis and QuickSight
  - Create Kinesis Data Stream for event ingestion
  - Set up Kinesis Firehose to deliver data to S3
  - Configure AWS Glue crawler for S3 data cataloging
  - Build Athena queries for vendor analytics
  - Create QuickSight dashboards for vendor insights
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11. Implement frontend authentication flows
  - Create login page with email/password and social login buttons
  - Build signup page with customer/vendor role selection
  - Implement password reset flow
  - Add protected route wrapper for authenticated pages
  - Configure Amplify Auth in frontend
  - _Requirements: 17.1, 17.2, 17.3_

- [x] 12. Build customer home page (Discover)
  - Create home page layout with header, address bar, and bottom nav
  - Implement address selector with saved addresses dropdown
  - Build delivery/pickup toggle component
  - Add "Deliver now" / "Schedule for later" dropdown
  - Create search bar with search button
  - _Requirements: 1.1, 1.3, 2.1, 2.3, 3.3_

- [x] 12.1 Implement category strip with filtering
  - Create horizontal scrolling category strip component
  - Fetch categories from backend
  - Implement category selection with active state
  - Filter product grid when category is selected
  - _Requirements: 3.1, 3.2_

- [x] 12.2 Build product grid with cards
  - Create ProductCard component with image, name, price, vendor, distance
  - Implement ProductGrid component with responsive layout
  - Add "Trending" badge display on product cards
  - Implement favorite button with toggle functionality
  - Add "Add to Cart" button with click handler
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 12.3 Implement product search functionality
  - Connect search bar to OpenSearch API
  - Display search results in product grid
  - Add search suggestions/autocomplete
  - Implement sort dropdown (distance, price, popularity, rating)
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 12.4 Add "Recommended for You" section
  - Fetch personalized recommendations from Personalize API
  - Display recommendations in horizontal scrolling row
  - Show fallback popular products for new users
  - _Requirements: 18.2, 18.3, 18.5_

- [x] 12.5 Add "Stores near you" vendor logos section
  - Fetch nearby vendors based on delivery address
  - Display vendor logos in horizontal scrolling row
  - Add click handler to navigate to vendor profile
  - _Requirements: 7.1, 7.2_

- [x] 13. Build product detail page
  - Create product detail page with large images and image carousel
  - Display product name, description, price, and vendor info
  - Show dietary tags and badges
  - Add quantity selector and "Add to Cart" button
  - Display product reviews and ratings
  - _Requirements: 4.4, 23.3_

- [x] 13.1 Implement dietary filter UI
  - Create filter panel with dietary restriction checkboxes
  - Add filters for vegan, vegetarian, gluten-free, dairy-free, nut-free, organic
  - Save dietary preferences to user profile
  - Apply filters to product search and grid
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [x] 14. Build vendor profile page
  - Create vendor profile page with cover image, logo, and description
  - Display vendor rating, review count, and distance
  - Show vendor operating hours with open/closed status
  - List vendor products in grid layout
  - Add favorite vendor button
  - _Requirements: 6.4, 26.2_

- [x] 15. Implement shopping cart functionality
  - Create cart drawer component that slides in from right
  - Display cart items grouped by vendor
  - Show vendor minimum order warnings
  - Calculate and display subtotals, fees, and total
  - Add quantity adjustment and remove item buttons
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15.1 Build cart state management with Zustand
  - Create Zustand store for cart state
  - Implement addToCart, removeFromCart, updateQuantity actions
  - Add cart persistence to localStorage
  - Sync cart with backend on user login
  - _Requirements: 5.1, 5.2_

- [x] 16. Build checkout flow
  - Create checkout page with order summary
  - Display saved addresses with selection and add new address form
  - Show saved payment methods with selection and add new payment form
  - Implement promo code input with validation
  - Display loyalty points balance and redemption option
  - _Requirements: 9.2, 19.3, 22.1, 22.2, 22.5_

- [x] 16.1 Integrate Stripe Elements for payment
  - Add Stripe.js and Elements to checkout page
  - Create card input component with Stripe Elements
  - Implement payment intent creation on checkout
  - Handle payment confirmation and redirect to order confirmation
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 16.2 Implement order confirmation page
  - Create order confirmation page with order details
  - Display order number and estimated delivery time
  - Show order items grouped by vendor
  - Add "Track Order" button
  - Send order confirmation email
  - _Requirements: 9.5, 15.1, 20.1_

- [x] 17. Build order tracking page
  - Create order history page listing all customer orders
  - Implement order detail view with status timeline
  - Display current order status with visual progress indicator
  - Show estimated delivery time
  - Add contact vendor button
  - _Requirements: 20.1, 20.2, 20.4, 20.5_

- [x] 18. Implement favorites page
  - Create favorites page with toggle between products and vendors
  - Display favorite products in grid layout
  - Show favorite vendors with quick access to their products
  - Add unfavorite button with confirmation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 19. Build map view
  - Create map page using Amazon Location Service
  - Display vendor pins on map based on delivery address
  - Implement vendor mini card popup on pin click
  - Center map on customer delivery address
  - Add zoom and pan controls
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 20. Build Reels/Stories Feature with Automated Social Media Aggregation
  - Create Story data model with platform tracking and expiration
  - Implement Lambda function to sync social content from TikTok/Instagram
  - Build scheduled sync (EventBridge cron every 15 minutes)
  - Add hashtag/mention detection (@makeries, #makeries)
  - Implement content moderation queue with auto-approve for verified vendors
  - Create GraphQL queries for reels feed with location-based filtering
  - Build feed algorithm (featured, nearby, trending, recent, personalized)
  - Implement story analytics tracking (views, completion rate, interactions)
  - Add Vendor model fields for social handles and sync preferences
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 20.1 Build reels frontend UI
  - Create reels page with vertical scrolling feed
  - Implement video player with auto-play on scroll
  - Add interactive action buttons (Shop Now, Visit Vendor, Share, Like)
  - Display vendor attribution and link to original post
  - Implement story expiration (24 hours)
  - Add loading states and error handling
  - Optimize video loading and preloading
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 20.2 Implement social media sync service
  - Build Lambda function to fetch posts from TikTok/Instagram APIs
  - Implement rate limiting and error handling
  - Add video download and S3 storage (or CDN linking)
  - Create webhook handlers for real-time updates (future)
  - Build admin moderation dashboard for story approval
  - Add sync status monitoring and alerting
  - _Requirements: 8.4, 8.5_

- [x] 21. Build customer profile page
  - Create profile page with user info display and edit form
  - Show loyalty points balance and history
  - Display saved addresses with edit and delete options
  - List saved payment methods with delete option
  - Add dietary preferences management
  - _Requirements: 19.2, 22.3, 22.5, 23.4_

- [x] 22. Implement review and rating system
  - Create review submission form with star rating and text input
  - Add photo upload for reviews (up to 3 images)
  - Display reviews on product detail and vendor profile pages
  - Show vendor responses below customer reviews
  - Implement review prompt after order completion
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 23. Build vendor portal dashboard
  - Create vendor dashboard with key metrics (sales, orders, views)
  - Display recent orders with status
  - Show top-performing products
  - Add quick actions (pause orders, view analytics)
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 24. Implement vendor POS connection flow
  - Create POS connection page with provider selection (Square, Toast, Shopify)
  - Build OAuth flow for each POS provider
  - Display connection status and last sync time
  - Add reconnect and disconnect buttons
  - Show sync logs and errors
  - _Requirements: 10.1, 10.2, 10.3, 11.5_

- [x] 25. Build vendor product management
  - Create product list page with all synced products
  - Add visibility toggle for each product
  - Implement manual product upload form (CSV and individual)
  - Show product sync status and last updated time
  - Add bulk actions (hide/show multiple products)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 26. Implement vendor order management
  - Create vendor order list with filters (pending, preparing, completed)
  - Build order detail view with customer info and items
  - Add order status update buttons
  - Implement order notification to customer on status change
  - _Requirements: 20.2, 20.3_

- [x] 27. Build vendor analytics dashboard
  - Integrate QuickSight embedded dashboard in vendor portal
  - Display sales trends with daily, weekly, monthly views
  - Show top products by revenue and order count
  - Display customer engagement metrics (views, favorites, cart adds)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 28. Implement vendor promotions and flash sales
  - Create promotion creation form with start/end dates and discount
  - Display countdown timer on product cards during active promotions
  - Apply promotional pricing automatically during promotion period
  - Revert to regular pricing when promotion ends
  - Send push notifications to customers who favorited the vendor
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [x] 29. Implement Progressive Web App features
  - Create service worker for offline caching
  - Add web app manifest with icons and theme colors
  - Implement install prompt for home screen
  - Cache previously viewed products and vendor data
  - Queue cart and favorite actions while offline and sync when online
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

- [x] 30. Implement image optimization
  - Use Next.js Image component for all product and vendor images
  - Configure automatic WebP conversion
  - Implement lazy loading for images below the fold
  - Generate responsive image sizes (320w, 640w, 1024w, 1920w)
  - Add blur placeholder during image load
  - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_

- [x] 31. Implement social sharing
  - Add share buttons on product detail and vendor profile pages
  - Generate unique shareable URLs with Open Graph metadata
  - Implement Web Share API for native mobile sharing
  - Track referral sources for orders
  - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5_

- [x] 32. Set up monitoring and error tracking
  - Configure CloudWatch Logs for all Lambda functions
  - Set up X-Ray tracing for distributed tracing
  - Create CloudWatch alarms for error rates and latency
  - Implement error logging with context and stack traces
  - Set up alerts to development team for critical errors
  - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_

- [x] 33. Implement CI/CD pipeline
  - Create GitHub Actions workflow for automated testing
  - Add build and deploy steps for Amplify
  - Configure E2E tests to run on staging deployment
  - Set up manual approval gate for production deployment
  - Implement canary deployment with 10% traffic for 1 hour
  - _Requirements: 16.1, 16.2_

- [x] 34. Performance optimization and final polish
  - Run Lighthouse audit and achieve 90+ performance score
  - Implement code splitting for route-based lazy loading
  - Optimize bundle size with tree shaking and minification
  - Add loading skeletons for better perceived performance
  - Implement error boundaries for graceful error handling
  - _Requirements: 28.5_
