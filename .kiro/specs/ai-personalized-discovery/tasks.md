# Implementation Plan

- [ ] 1. Extend data models for AI personalization
  - Add new fields to Vendor model: cuisineTypes, businessType, ambianceType, authenticityLevel, googleMapsPlaceId, appleMapsPlaceId, authenticityScore, popularityScore, lastMapDataUpdate
  - Add hasPreferenceProfile field to Customer model
  - Create UserPreferences model with userId as partition key, including explicitPreferences, inferredPreferences, behavioralSignals, recommendationFeedback, and metadata fields
  - Create VendorMetadata model with vendorId as partition key, including all vendor attributes, map service data, and computed scores
  - Create BehavioralSignals model with userId as partition key and timestamp#eventType as sort key, with 90-day TTL
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 2. Implement Preference Learning Module
- [ ] 2.1 Create preference learning Lambda function
  - Write Lambda handler that processes behavioral events (orders, favorites, views, reviews, feedback)
  - Implement getOrCreateProfile function to retrieve or initialize user preference profiles
  - Implement extractCuisinePreferences function to extract cuisine types from vendor data
  - Implement updatePreferenceWeights function with weight delta logic (+0.15 for orders, +0.20 for favorites, +0.05 for views, ±0.20/0.15 for reviews, ±0.10/0.15 for feedback)
  - Implement weight normalization to keep values in 0-1 range
  - Implement calculateProfileCompleteness function to score profile completeness (0-100)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.2, 6.3, 6.4, 6.5_

- [ ] 2.2 Create event handlers for behavioral signals
  - Implement onOrderPlaced handler to extract cuisine, business type, ambiance, and price range preferences
  - Implement onVendorFavorited handler to increase weights by 0.20 for all vendor attributes
  - Implement onVendorViewed handler to increase weights by 0.05 when duration exceeds 30 seconds
  - Implement onReviewSubmitted handler to adjust weights by ±0.20/0.15 based on rating (4-5 stars positive, 1-2 stars negative)
  - Implement onRecommendationFeedback handler to adjust weights by ±0.10/0.15/0.03 for thumbs up/down/dismissed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.2, 6.3, 6.4_

- [ ] 2.3 Integrate behavioral signal tracking into existing flows
  - Add trackBehavioralSignal calls to order creation flow
  - Add trackBehavioralSignal calls to favorite vendor flow
  - Add trackBehavioralSignal calls to vendor profile view tracking (track time spent)
  - Add trackBehavioralSignal calls to review submission flow
  - Store signals in BehavioralSignals table with 90-day TTL
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Implement Map Integration Service
- [ ] 3.1 Create map integration Lambda function
  - Write Lambda handler for vendor enrichment
  - Implement fetchGoogleMapsData function using Google Places API (Place Search + Place Details)
  - Implement fetchAppleMapsData function using Apple MapKit JS Search API
  - Implement enrichVendor function to fetch and store map data for a vendor
  - Implement getCachedMapData function to retrieve cached map data from VendorMetadata table
  - Store API keys in AWS Secrets Manager and retrieve them securely
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.2 Implement rate limiting and error handling
  - Create API request queue with exponential backoff (1s, 2s, 4s, 8s) for rate limit handling
  - Implement queueAPIRequest function to manage request queuing
  - Handle 429 rate limit responses with retry logic (up to 3 attempts)
  - Implement error handling for API unavailability (fall back to cached data)
  - Implement error handling for invalid addresses (log warning, skip enrichment)
  - Log all API errors for monitoring
  - _Requirements: 3.5_

- [ ] 3.3 Create scheduled job for refreshing stale map data
  - Create EventBridge rule to trigger daily at 2 AM
  - Implement refreshStaleData function to query vendors with lastMapDataUpdate older than 7 days
  - Batch process vendors (100 per run) to avoid rate limits
  - Update VendorMetadata table with fresh map data
  - _Requirements: 3.4_

- [ ] 4. Implement AI Recommendation Engine
- [ ] 4.1 Create recommendation engine Lambda function
  - Write Lambda handler for generating personalized recommendations
  - Implement generateRecommendations function that takes userId, latitude, longitude, and limit
  - Implement getPopularVendors fallback function for users with insufficient data (<3 orders)
  - Query nearby vendors within radius using existing getNearbyVendors function
  - Fetch user preference profile from UserPreferences table
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.5_

- [ ] 4.2 Implement scoring algorithm
  - Implement calculateMatchScore function with weighted scoring: cuisine (40%), business type (25%), ambiance (20%), authenticity (15%)
  - Implement calculateCuisineScore to match vendor cuisines against user preferences
  - Implement calculateBusinessTypeScore with 25% weight for family-owned preference
  - Implement calculateAmbianceScore with 20% weight for hole-in-the-wall/casual preference
  - Implement calculateAuthenticityScore with 30% weight for traditional cuisine preference
  - Add popularity bonus (up to +10 points) based on vendor popularityScore
  - Return MatchScore with totalScore (0-100) and breakdown of component scores
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.3 Implement explanation generation
  - Implement generateExplanation function to create human-readable reasons for recommendations
  - Generate explanations based on top matching attributes (cuisine, business type, ambiance, authenticity)
  - Include Google Maps rating in explanation if rating >= 4.5 stars
  - Limit explanations to top 3 reasons, joined with bullet separator
  - Return explanation string with each recommendation
  - _Requirements: 5.4_

- [ ] 4.4 Implement ranking and filtering
  - Sort recommendations by totalScore in descending order
  - Filter out vendors user has already ordered from in last 30 days (optional diversity)
  - Filter out vendors user has given thumbs down feedback
  - Limit results to requested limit (default 20)
  - Calculate distance for each vendor from user location
  - Return array of RecommendationResult objects
  - _Requirements: 4.5, 5.1, 5.2_

- [ ] 5. Create GraphQL API for personalization features
- [ ] 5.1 Add getPersonalizedRecommendations query
  - Define GraphQL query with latitude, longitude, and limit arguments
  - Create Lambda function resource and handler
  - Implement handler to call recommendation engine
  - Return PersonalizedRecommendationsResult with recommendations array, userProfileCompleteness, and isPersonalized flag
  - Add authorization rule (authenticated users only)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.2 Add getUserPreferenceProfile query
  - Define GraphQL query to retrieve user's preference profile
  - Create Lambda function resource and handler
  - Implement handler to fetch UserPreferences by userId
  - Return UserPreferenceProfile or null if not exists
  - Add authorization rule (owner only)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.3_

- [ ] 5.3 Add updateExplicitPreferences mutation
  - Define GraphQL mutation with cuisineTypes, businessType, ambiancePreference, authenticityPreference arguments
  - Create Lambda function resource and handler
  - Implement handler to update or create user preference profile
  - Assign weight of 1.0 to all explicit preferences
  - Set hasPreferenceProfile flag on Customer model
  - Return updated UserPreferenceProfile
  - Add authorization rule (owner only)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.4 Add submitRecommendationFeedback mutation
  - Define GraphQL mutation with vendorId and feedback (THUMBS_UP, THUMBS_DOWN, DISMISSED) arguments
  - Create Lambda function resource and handler
  - Implement handler to call Preference Learning Module's onRecommendationFeedback
  - Update recommendationFeedback in user profile
  - Trigger preference profile retraining after every 5 feedback interactions
  - Return success boolean
  - Add authorization rule (authenticated users only)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5.5 Add deletePreferenceProfile mutation
  - Define GraphQL mutation to delete user's preference profile
  - Create Lambda function resource and handler
  - Implement handler to delete UserPreferences record
  - Set hasPreferenceProfile flag to false on Customer model
  - Delete all associated BehavioralSignals records
  - Return success boolean
  - Add authorization rule (owner only)
  - _Requirements: 8.4, 8.5_

- [ ] 6. Build vendor settings UI for business attributes
- [ ] 6.1 Create vendor business attributes form
  - Create VendorBusinessAttributesForm component with cuisine types multi-select (Mexican, Latin American, Chinese, Asian, etc.)
  - Add business type radio buttons (Family-owned, Independent, Chain)
  - Add ambiance type select (Hole-in-the-wall, Casual, Upscale, Fine Dining)
  - Add authenticity level select (Traditional, Fusion, Modern)
  - Implement form validation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6.2 Integrate form into vendor settings page
  - Add business attributes section to vendor settings page
  - Load current vendor attributes on page load
  - Implement save handler to update Vendor model
  - Show success/error toast on save
  - Trigger vendor metadata update and recommendation recalculation on save
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7. Build customer preference settings UI
- [ ] 7.1 Create customer preference settings page
  - Create PreferenceSettingsPage component at /settings/preferences route
  - Add cuisine preferences section with multi-select checkboxes (Mexican, Latin American, Chinese, Asian, etc.)
  - Add business type preference radio buttons (Family-owned, Independent, Chain, No preference)
  - Add ambiance preference select (Hole-in-the-wall, Casual, Upscale, Fine Dining, No preference)
  - Add authenticity preference select (Traditional, Fusion, Modern, No preference)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7.2 Implement preference settings save functionality
  - Load current user preferences on page load using getUserPreferenceProfile query
  - Implement save handler using updateExplicitPreferences mutation
  - Show success/error toast on save
  - Display profile completeness score
  - Add link to preference settings from user profile menu
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7.3 Add privacy controls to preference settings
  - Add "View my data" button to display all stored preference data in modal
  - Add "Delete my preference profile" button with confirmation dialog
  - Implement deletePreferenceProfile mutation call on confirmation
  - Show warning about reverting to default recommendations
  - Add opt-out toggle for behavioral learning (use explicit preferences only)
  - _Requirements: 8.3, 8.4, 8.5_

- [ ] 8. Build personalized discovery feed UI
- [ ] 8.1 Create PersonalizedFeed component
  - Create PersonalizedFeed component to display vendor recommendations
  - Fetch recommendations using getPersonalizedRecommendations query with user location
  - Display top 10 recommendations in card grid layout
  - Show vendor image, name, cuisine types, rating, and distance
  - Display match score as percentage or visual indicator (e.g., "95% match")
  - Display explanation text below vendor name
  - _Requirements: 5.1, 5.4_

- [ ] 8.2 Add recommendation feedback controls
  - Add thumbs up and thumbs down buttons to each recommendation card
  - Add dismiss (X) button to each recommendation card
  - Implement submitRecommendationFeedback mutation call on button click
  - Remove card from feed on feedback submission
  - Show toast confirmation on feedback submission
  - Track feedback count and show "Learning your preferences..." message
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.3 Integrate personalized feed into home page
  - Add "Recommended for You" section to customer home page
  - Show PersonalizedFeed component if user has preference profile
  - Show "Set your preferences" CTA if user has no preference profile
  - Refresh recommendations when user location changes by >5 miles
  - Add loading skeleton while fetching recommendations
  - _Requirements: 5.1, 5.3, 5.5_

- [ ] 9. Enhance map view with personalized markers
- [ ] 9.1 Update map view to show personalized recommendations
  - Fetch personalized recommendations for map view using getPersonalizedRecommendations query
  - Display vendor markers with visual indicators showing match strength (color-coded or sized)
  - Show match score and explanation in marker popup/tooltip
  - Highlight top 5 matches with special marker style
  - Add filter toggle to show "All vendors" vs "Recommended for you"
  - _Requirements: 5.2, 5.4_

- [ ] 9.2 Add recommendation feedback to map markers
  - Add thumbs up/down buttons to marker popup
  - Implement submitRecommendationFeedback mutation call from map view
  - Update marker style on feedback submission
  - Refresh recommendations after feedback
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 10. Implement monitoring and analytics
- [ ] 10.1 Add CloudWatch metrics and alarms
  - Create custom CloudWatch metrics for recommendation latency (P50, P95, P99)
  - Create custom CloudWatch metrics for recommendation error rate
  - Create custom CloudWatch metrics for map API success rate and cache hit ratio
  - Create alarm for recommendation latency >1s for 5 minutes
  - Create alarm for error rate >5% for 5 minutes
  - Create alarm for map API failure rate >20% for 10 minutes
  - _Requirements: All (monitoring)_

- [ ] 10.2 Create analytics dashboard
  - Create CloudWatch dashboard for real-time recommendation performance
  - Add widgets for recommendation latency, error rate, throughput
  - Add widgets for user engagement metrics (profile completion rate, feedback submission rate)
  - Add widgets for map API usage and cost
  - Add widgets for recommendation quality metrics (click-through rate, order conversion rate)
  - _Requirements: All (observability)_

- [ ] 10.3 Implement A/B testing framework
  - Create feature flag for personalized vs non-personalized recommendations
  - Implement random assignment of users to control/treatment groups
  - Track conversion metrics for both groups
  - Create dashboard to compare performance between groups
  - _Requirements: All (testing)_

- [ ] 11. Security and compliance implementation
- [ ] 11.1 Implement data encryption and security
  - Enable encryption at rest for UserPreferences table using AWS KMS
  - Enable encryption at rest for BehavioralSignals table using AWS KMS
  - Store Google Maps and Apple Maps API keys in AWS Secrets Manager
  - Implement API key rotation policy (90 days)
  - Add API rate limiting at API Gateway level
  - Enable CloudTrail logging for all API calls
  - _Requirements: 8.1, 8.2_

- [ ] 11.2 Implement GDPR compliance features
  - Set 90-day TTL on BehavioralSignals table records
  - Implement data export functionality for user preference data
  - Verify deletePreferenceProfile mutation removes all user data within 24 hours
  - Add privacy policy link to preference settings page
  - Add data collection transparency notice to preference settings
  - Ensure no individual preference data is shared with vendors or third parties
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
