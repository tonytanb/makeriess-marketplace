# Requirements Document

## Introduction

Makeriess is a curated local marketplace web application that enables customers to discover and order products from nearby food makers, craft vendors, and boutique shops. The platform combines the discovery experience of Etsy with the convenience of Uber Eats, built on Next.js and AWS Amplify. Vendors connect their existing POS systems (Square, Toast, Shopify) to automatically sync their menus, prices, and inventory. The system supports multi-vendor checkout with split payments and provides real-time product updates.

## Glossary

- **Makeriess Platform**: The web application system that connects customers with local vendors
- **Customer**: End user who browses and purchases products from vendors
- **Vendor**: Local business owner who sells products through the platform
- **POS System**: Point of Sale system (Square, Toast, or Shopify) that vendors use for their business
- **Product Feed**: Real-time synchronized product catalog from vendor POS systems
- **Multi-Vendor Cart**: Shopping cart that can contain items from multiple vendors simultaneously
- **Split Payment**: Payment processing that distributes funds to multiple vendors with platform commission
- **AppSync API**: AWS GraphQL API service that provides unified data access
- **Trending Badge**: Visual indicator for popular or high-engagement products
- **Delivery Zone**: Geographic area within which delivery is available from a vendor

## Requirements

### Requirement 1

**User Story:** As a customer, I want to enter my delivery address and see products available near me, so that I can discover local vendors within my delivery range

#### Acceptance Criteria

1. WHEN the Customer accesses the home page, THE Makeriess Platform SHALL display an address input field with saved address options (home, work, other)
2. WHEN the Customer enters a delivery address, THE Makeriess Platform SHALL calculate distance to all vendors and filter the Product Feed to show only vendors within delivery range
3. THE Makeriess Platform SHALL persist the Customer's selected address for subsequent sessions
4. WHEN the Customer changes their delivery address, THE Makeriess Platform SHALL refresh the Product Feed within 2 seconds to reflect the new location
5. WHERE the Customer has no saved addresses, THE Makeriess Platform SHALL prompt for address entry before displaying products

### Requirement 2

**User Story:** As a customer, I want to toggle between delivery and pickup modes and schedule orders, so that I can choose how and when I receive my products

#### Acceptance Criteria

1. THE Makeriess Platform SHALL display a toggle control with "Delivery" and "Pickup" options on the home page
2. WHEN the Customer selects "Pickup", THE Makeriess Platform SHALL display vendor locations and filter products to show only pickup-enabled vendors
3. THE Makeriess Platform SHALL display a scheduling dropdown with "Deliver now" and "Schedule for later" options
4. WHEN the Customer selects "Schedule for later", THE Makeriess Platform SHALL display a date and time picker with available delivery windows
5. WHEN the Customer schedules an order, THE Makeriess Platform SHALL validate that the selected time falls within vendor operating hours

### Requirement 3

**User Story:** As a customer, I want to browse products by category and search for specific items, so that I can quickly find what I'm looking for

#### Acceptance Criteria

1. THE Makeriess Platform SHALL display a horizontal category strip with options including "Food & pastries", "Local finds", "Drinks", "Crafts", and "Seasonal"
2. WHEN the Customer selects a category, THE Makeriess Platform SHALL filter the Product Feed to show only products matching that category within 1 second
3. THE Makeriess Platform SHALL provide a search input field that accepts text queries for makers, items, or neighborhoods
4. WHEN the Customer enters a search query, THE Makeriess Platform SHALL return matching results using Amazon OpenSearch Service with relevance ranking
5. THE Makeriess Platform SHALL display a sort dropdown with options for distance, price, popularity, and rating

### Requirement 4

**User Story:** As a customer, I want to view product details including images, prices, vendor information, and trending indicators, so that I can make informed purchasing decisions

#### Acceptance Criteria

1. THE Makeriess Platform SHALL display each product with an image, name, price, vendor name, and distance from delivery address
2. WHERE a product meets trending criteria, THE Makeriess Platform SHALL display a "Trending" badge on the product card
3. THE Makeriess Platform SHALL provide a favorite button on each product card that toggles saved status
4. WHEN the Customer clicks on a product, THE Makeriess Platform SHALL display detailed product information including description, ingredients or materials, and vendor profile
5. THE Makeriess Platform SHALL display an "Add to Cart" button on each product card that adds the item to the multi-vendor cart

### Requirement 5

**User Story:** As a customer, I want to add items from multiple vendors to my cart and see vendor-specific minimums, so that I can complete a multi-vendor order

#### Acceptance Criteria

1. THE Makeriess Platform SHALL maintain a Multi-Vendor Cart that groups items by vendor
2. WHEN the Customer adds an item to cart, THE Makeriess Platform SHALL update the cart count indicator in real-time
3. THE Makeriess Platform SHALL display vendor-specific minimum order amounts for each vendor in the cart
4. WHEN a vendor's items in the cart do not meet the minimum order amount, THE Makeriess Platform SHALL display a warning message with the remaining amount needed
5. THE Makeriess Platform SHALL calculate and display subtotals per vendor, delivery fees, platform fees, and total order amount

### Requirement 6

**User Story:** As a customer, I want to view my favorite products and vendors in a dedicated section, so that I can quickly reorder from my preferred sources

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a Favorites view accessible from the bottom navigation bar
2. THE Makeriess Platform SHALL display a toggle control to switch between favorite products and favorite vendors
3. WHEN the Customer views favorite products, THE Makeriess Platform SHALL display a grid of saved products with current prices and availability
4. WHEN the Customer views favorite vendors, THE Makeriess Platform SHALL display vendor cards with logo, name, distance, and quick access to their product catalog
5. WHEN the Customer unfavorites an item, THE Makeriess Platform SHALL remove it from the favorites view immediately

### Requirement 7

**User Story:** As a customer, I want to view vendors on a map with location pins and mini cards, so that I can discover nearby businesses geographically

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a Map view accessible from the bottom navigation bar
2. THE Makeriess Platform SHALL display vendor locations as pins on an interactive map using Amazon Location Service
3. WHEN the Customer clicks on a vendor pin, THE Makeriess Platform SHALL display a mini card with vendor name, featured products, and distance
4. THE Makeriess Platform SHALL center the map on the Customer's delivery address with appropriate zoom level
5. THE Makeriess Platform SHALL update vendor pins dynamically when the Customer pans or zooms the map

### Requirement 8

**User Story:** As a customer, I want to view short vendor videos in a Reels format, so that I can learn about vendors through engaging content

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a Reels view accessible from the bottom navigation bar
2. THE Makeriess Platform SHALL display vendor videos in a vertical scrolling feed format
3. THE Makeriess Platform SHALL embed videos from Instagram and TikTok sources
4. WHEN the Customer scrolls to a video, THE Makeriess Platform SHALL auto-play the video content
5. THE Makeriess Platform SHALL provide controls to like, share, and navigate to the vendor's product page from each video

### Requirement 9

**User Story:** As a customer, I want to complete checkout with split payments across multiple vendors, so that I can purchase from several vendors in one transaction

#### Acceptance Criteria

1. THE Makeriess Platform SHALL process payments using Stripe Connect for multi-vendor split payments
2. WHEN the Customer initiates checkout, THE Makeriess Platform SHALL validate that all vendor minimum order amounts are met
3. THE Makeriess Platform SHALL calculate and apply a platform commission of 5-8% to each vendor's subtotal
4. THE Makeriess Platform SHALL distribute payment amounts to each vendor's connected Stripe account within 24 hours of order completion
5. THE Makeriess Platform SHALL provide the Customer with a single consolidated receipt showing all vendor purchases and fees

### Requirement 10

**User Story:** As a vendor, I want to connect my POS system to automatically sync my products, so that my inventory stays current without manual updates

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a vendor portal with OAuth authentication for POS system connection
2. THE Makeriess Platform SHALL support integration with Square, Toast, and Shopify POS systems
3. WHEN a Vendor connects their POS system, THE Makeriess Platform SHALL securely store OAuth tokens in AWS Secrets Manager
4. THE Makeriess Platform SHALL execute an initial sync of all products, prices, images, and inventory levels from the POS System within 5 minutes of connection
5. THE Makeriess Platform SHALL normalize POS data to a unified schema and store it in DynamoDB

### Requirement 11

**User Story:** As a vendor, I want my product updates and inventory changes to sync automatically, so that customers always see accurate availability

#### Acceptance Criteria

1. WHEN a product is updated in the POS System, THE Makeriess Platform SHALL receive a webhook notification and update the Product Feed within 30 seconds
2. WHEN a product is marked as sold out in the POS System, THE Makeriess Platform SHALL immediately hide the product from customer search results
3. THE Makeriess Platform SHALL execute a scheduled sync every 15 minutes to catch any missed webhook updates
4. WHEN a sync fails, THE Makeriess Platform SHALL retry up to 3 times with exponential backoff and log the error
5. THE Makeriess Platform SHALL maintain a sync history log for each vendor showing timestamp, status, and items updated

### Requirement 12

**User Story:** As a vendor, I want to manage which products appear on the platform, so that I can showcase only my top sellers or seasonal items

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a vendor dashboard with a list of all synced products
2. THE Makeriess Platform SHALL display a visibility toggle for each product allowing the Vendor to show or hide it from customers
3. WHEN a Vendor hides a product, THE Makeriess Platform SHALL remove it from the Product Feed within 10 seconds
4. WHERE a Vendor does not have a connected POS System, THE Makeriess Platform SHALL provide manual product upload via CSV file or form entry
5. THE Makeriess Platform SHALL validate manual product entries for required fields (name, price, category, image) before saving

### Requirement 13

**User Story:** As a vendor, I want to view analytics about my sales and product performance, so that I can make data-driven business decisions

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a vendor analytics dashboard powered by Amazon QuickSight
2. THE Makeriess Platform SHALL display sales trends over time with daily, weekly, and monthly views
3. THE Makeriess Platform SHALL show top-performing products ranked by revenue and order count
4. THE Makeriess Platform SHALL display customer engagement metrics including product views, favorites, and cart additions
5. THE Makeriess Platform SHALL update analytics data with a maximum delay of 1 hour from transaction completion

### Requirement 14

**User Story:** As the platform, I want to automatically identify trending products using AI, so that customers discover popular and high-quality items

#### Acceptance Criteria

1. THE Makeriess Platform SHALL use Amazon Bedrock to analyze product engagement metrics and calculate trend scores
2. THE Makeriess Platform SHALL recalculate trend scores every 6 hours based on recent views, favorites, orders, and ratings
3. WHEN a product's trend score exceeds the threshold, THE Makeriess Platform SHALL apply a "Trending" badge to the product card
4. THE Makeriess Platform SHALL apply additional badges including "Limited", "New", and "Seasonal" based on inventory and recency data
5. THE Makeriess Platform SHALL use Amazon Bedrock to generate product descriptions for vendors who upload products manually

### Requirement 15

**User Story:** As the platform, I want to send order notifications and promotional messages to customers, so that they stay informed and engaged

#### Acceptance Criteria

1. WHEN an order is placed, THE Makeriess Platform SHALL send an order confirmation notification to the Customer via email within 2 minutes
2. WHEN an order status changes, THE Makeriess Platform SHALL send a status update notification using Amazon SNS
3. THE Makeriess Platform SHALL provide opt-in push notifications for promotional offers using Amazon Pinpoint
4. WHEN a Customer's favorite vendor adds new products, THE Makeriess Platform SHALL send a notification within 24 hours
5. THE Makeriess Platform SHALL respect Customer notification preferences and provide unsubscribe options for promotional messages

### Requirement 16

**User Story:** As the platform, I want to host the application with global delivery and automatic scaling, so that customers experience fast load times and high availability

#### Acceptance Criteria

1. THE Makeriess Platform SHALL deploy the Next.js application using AWS Amplify with continuous deployment from the main branch
2. THE Makeriess Platform SHALL serve static assets through Amazon CloudFront with edge caching for sub-second load times
3. THE Makeriess Platform SHALL automatically scale backend Lambda functions based on request volume
4. THE Makeriess Platform SHALL maintain 99.9% uptime measured over each calendar month
5. WHEN deployment occurs, THE Makeriess Platform SHALL execute zero-downtime deployments with automatic rollback on failure

### Requirement 17

**User Story:** As the platform, I want to provide secure authentication for customers and vendors, so that user data and transactions are protected

#### Acceptance Criteria

1. THE Makeriess Platform SHALL implement user authentication using Amazon Cognito with email and password
2. THE Makeriess Platform SHALL support social login options including Google and Apple Sign-In
3. THE Makeriess Platform SHALL enforce password requirements of minimum 8 characters with uppercase, lowercase, and number
4. WHEN a user attempts login with incorrect credentials 5 times, THE Makeriess Platform SHALL temporarily lock the account for 15 minutes
5. THE Makeriess Platform SHALL maintain separate user pools for customers and vendors with role-based access control

### Requirement 18

**User Story:** As a customer, I want to receive personalized product recommendations based on my browsing and purchase history, so that I discover items I'm likely to enjoy

#### Acceptance Criteria

1. THE Makeriess Platform SHALL track Customer browsing behavior including product views, search queries, and cart additions
2. THE Makeriess Platform SHALL use Amazon Personalize to generate personalized product recommendations for each Customer
3. WHEN the Customer views the home page, THE Makeriess Platform SHALL display a "Recommended for You" section with at least 6 personalized products
4. THE Makeriess Platform SHALL update recommendation models daily based on new interaction data
5. WHERE a Customer has insufficient history, THE Makeriess Platform SHALL display popular products from nearby vendors as fallback recommendations

### Requirement 19

**User Story:** As a customer, I want to save my payment methods and delivery addresses, so that checkout is faster on repeat orders

#### Acceptance Criteria

1. THE Makeriess Platform SHALL securely store Customer payment methods using Stripe's tokenization
2. THE Makeriess Platform SHALL allow Customers to save multiple delivery addresses with custom labels
3. WHEN the Customer initiates checkout, THE Makeriess Platform SHALL display saved payment methods and addresses for quick selection
4. THE Makeriess Platform SHALL provide one-click reordering for previous orders with saved payment and address
5. THE Makeriess Platform SHALL encrypt all stored payment tokens and personal information at rest using AWS KMS

### Requirement 20

**User Story:** As a customer, I want to track my order status in real-time, so that I know when to expect delivery

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide an order tracking page showing current status for each vendor's items
2. THE Makeriess Platform SHALL display order status stages including "Confirmed", "Preparing", "Ready for pickup/Out for delivery", and "Completed"
3. WHEN an order status changes, THE Makeriess Platform SHALL send a push notification to the Customer within 1 minute
4. WHERE delivery is in progress, THE Makeriess Platform SHALL display estimated delivery time with 15-minute accuracy
5. THE Makeriess Platform SHALL provide a contact button to message the vendor directly about order questions

### Requirement 21

**User Story:** As a customer, I want to rate and review products and vendors after purchase, so that I can share my experience with other customers

#### Acceptance Criteria

1. WHEN an order is completed, THE Makeriess Platform SHALL prompt the Customer to rate products and vendors within 24 hours
2. THE Makeriess Platform SHALL accept ratings on a 5-star scale with optional text review up to 500 characters
3. THE Makeriess Platform SHALL display average ratings and review counts on product cards and vendor profiles
4. THE Makeriess Platform SHALL allow Customers to upload up to 3 photos with each review
5. WHEN a Vendor responds to a review, THE Makeriess Platform SHALL display the response below the Customer's review

### Requirement 22

**User Story:** As a customer, I want to apply promo codes and see loyalty rewards, so that I can save money on orders

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a promo code input field during checkout
2. WHEN the Customer applies a valid promo code, THE Makeriess Platform SHALL calculate and display the discount amount before payment
3. THE Makeriess Platform SHALL track Customer order history and award loyalty points at 1 point per dollar spent
4. THE Makeriess Platform SHALL allow Customers to redeem loyalty points for discounts at a rate of 100 points equals $1
5. THE Makeriess Platform SHALL display current loyalty point balance in the Customer profile section

### Requirement 23

**User Story:** As a customer, I want to filter products by dietary restrictions and preferences, so that I can find items that meet my needs

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide filter options including "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free", and "Organic"
2. WHEN the Customer selects dietary filters, THE Makeriess Platform SHALL display only products matching all selected criteria
3. THE Makeriess Platform SHALL display dietary badges on product cards when applicable
4. THE Makeriess Platform SHALL allow Customers to save dietary preferences in their profile for automatic filtering
5. WHERE a product lacks dietary information, THE Makeriess Platform SHALL display "Not specified" and allow Customers to contact the vendor

### Requirement 24

**User Story:** As a vendor, I want to create limited-time offers and flash sales, so that I can drive urgency and increase sales

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a vendor dashboard interface to create time-limited promotions with start and end dates
2. WHEN a Vendor creates a promotion, THE Makeriess Platform SHALL display a countdown timer on affected product cards
3. THE Makeriess Platform SHALL automatically apply promotional pricing during the active promotion period
4. WHEN a promotion ends, THE Makeriess Platform SHALL revert products to regular pricing within 1 minute
5. THE Makeriess Platform SHALL send push notifications to Customers who have favorited the vendor when a flash sale begins

### Requirement 25

**User Story:** As a vendor, I want to set custom delivery zones and fees, so that I can control my delivery coverage and costs

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a map interface for Vendors to draw custom delivery zone boundaries
2. THE Makeriess Platform SHALL allow Vendors to set different delivery fees for different zones or distance ranges
3. WHEN a Customer's address falls outside a Vendor's delivery zone, THE Makeriess Platform SHALL hide that vendor's products from delivery mode
4. THE Makeriess Platform SHALL calculate and display delivery fees per vendor during checkout based on the Customer's address
5. THE Makeriess Platform SHALL allow Vendors to set minimum order amounts that vary by delivery zone

### Requirement 26

**User Story:** As a vendor, I want to manage my operating hours and temporarily pause orders, so that I can control when I accept new orders

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide a vendor dashboard to set weekly operating hours with different times per day
2. WHEN a Vendor is outside operating hours, THE Makeriess Platform SHALL display "Currently closed" on the vendor profile and hide products from "Deliver now" mode
3. THE Makeriess Platform SHALL provide a "Pause orders" toggle that immediately stops new orders while keeping the vendor visible
4. WHEN a Vendor pauses orders, THE Makeriess Platform SHALL display "Not accepting orders" with an estimated return time
5. THE Makeriess Platform SHALL allow Customers to schedule orders for future time slots when the Vendor will be open

### Requirement 27

**User Story:** As the platform, I want to implement progressive web app capabilities, so that customers can install the app and receive offline functionality

#### Acceptance Criteria

1. THE Makeriess Platform SHALL implement a service worker for offline caching of previously viewed products and vendor data
2. THE Makeriess Platform SHALL provide an install prompt for Customers to add the app to their home screen
3. WHEN the Customer is offline, THE Makeriess Platform SHALL display cached content with a clear offline indicator
4. THE Makeriess Platform SHALL queue cart additions and favorites while offline and sync when connection is restored
5. THE Makeriess Platform SHALL meet all Progressive Web App criteria including HTTPS, manifest file, and installability

### Requirement 28

**User Story:** As the platform, I want to implement image optimization and lazy loading, so that the app loads quickly even with many product images

#### Acceptance Criteria

1. THE Makeriess Platform SHALL use Next.js Image component with automatic WebP conversion for all product images
2. THE Makeriess Platform SHALL implement lazy loading for product images below the fold
3. THE Makeriess Platform SHALL generate and serve responsive image sizes based on device viewport
4. THE Makeriess Platform SHALL display low-quality image placeholders while full images load
5. THE Makeriess Platform SHALL achieve a Lighthouse performance score of 90 or higher on mobile devices

### Requirement 29

**User Story:** As a customer, I want to share products and vendors with friends via social media or direct links, so that I can recommend great finds

#### Acceptance Criteria

1. THE Makeriess Platform SHALL provide share buttons on product detail pages and vendor profiles
2. THE Makeriess Platform SHALL generate unique shareable URLs with Open Graph metadata for rich social media previews
3. WHEN a Customer shares a product link, THE Makeriess Platform SHALL include product image, name, price, and vendor in the preview
4. THE Makeriess Platform SHALL track referral sources and attribute orders to sharing Customers for potential referral rewards
5. THE Makeriess Platform SHALL provide native share functionality on mobile devices using the Web Share API

### Requirement 30

**User Story:** As the platform, I want to implement comprehensive error tracking and monitoring, so that issues are detected and resolved quickly

#### Acceptance Criteria

1. THE Makeriess Platform SHALL integrate error tracking using AWS CloudWatch and X-Ray for distributed tracing
2. WHEN a critical error occurs, THE Makeriess Platform SHALL send alerts to the development team within 2 minutes
3. THE Makeriess Platform SHALL log all API requests with response times and error rates
4. THE Makeriess Platform SHALL monitor key metrics including page load time, API latency, and checkout completion rate
5. THE Makeriess Platform SHALL maintain error logs for 90 days with searchable indexing for debugging
