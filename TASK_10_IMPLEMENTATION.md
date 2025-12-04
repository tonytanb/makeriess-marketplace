# Task 10 Implementation: Analytics Service with Kinesis and QuickSight

## Overview
Implemented a comprehensive analytics service using AWS Kinesis, Firehose, Glue, Athena, and QuickSight for real-time and historical vendor analytics.

## Architecture

```
Frontend → AppSync → trackUserInteraction → Kinesis Stream
                                                  ↓
                                          analyticsEventProcessor → DynamoDB (Real-time)
                                                  ↓
                                            Firehose → S3 (Parquet)
                                                  ↓
                                            Glue Crawler → Athena → QuickSight
```

## Components Implemented

### 1. Lambda Functions

#### trackUserInteraction
- **Location**: `amplify/data/functions/trackUserInteraction/`
- **Purpose**: Receives user interaction events from frontend and sends to Kinesis
- **Events Tracked**:
  - ProductView
  - ProductFavorite
  - CartAdd
  - VendorView
  - OrderCreated
  - OrderCompleted
- **Integration**: AppSync GraphQL mutation

#### analyticsEventProcessor
- **Location**: `amplify/data/functions/analyticsEventProcessor/`
- **Purpose**: Processes events from Kinesis stream and aggregates metrics in DynamoDB
- **Trigger**: Kinesis stream event source mapping
- **Features**:
  - Real-time metric aggregation
  - Daily metrics per vendor
  - Daily metrics per product
  - Order event tracking
  - Batch processing with error handling

#### getVendorAnalytics
- **Location**: `amplify/data/functions/getVendorAnalytics/`
- **Purpose**: Retrieves vendor analytics data
- **Data Sources**:
  - DynamoDB for real-time metrics (last 30 days)
  - Athena for historical trends (weekly/monthly aggregations)
- **Returns**:
  - Summary statistics
  - Daily metrics
  - Top products
  - Historical trends

### 2. Infrastructure (CloudFormation)

#### Resources Created
- **Kinesis Data Stream**: `makeriess-analytics-stream-{env}`
  - 1 shard (provisioned mode)
  - 24-hour retention
  
- **Kinesis Firehose**: `makeriess-analytics-firehose-{env}`
  - Reads from Kinesis stream
  - Converts JSON to Parquet
  - Delivers to S3 with partitioning
  - 5 MB buffer / 5 minute interval
  
- **S3 Buckets**:
  - Analytics Data: `makeriess-analytics-data-{env}-{accountId}`
  - Athena Results: `makeriess-analytics-results-{env}-{accountId}`
  
- **Glue Database**: `makeriess_analytics_{env}`
  - Table: `vendor_events`
  - Partitioned by year/month/day
  
- **Glue Crawler**: `makeriess-analytics-crawler-{env}`
  - Scheduled daily at 2 AM
  - Updates schema automatically
  
- **DynamoDB Table**: `MakeriessAnalytics-{env}`
  - On-demand billing
  - GSI for vendor-based queries
  - TTL enabled

### 3. Athena Queries

**Location**: `amplify/custom/analytics/athena-queries.sql`

**Views Created**:
1. `daily_vendor_performance` - Daily aggregated metrics
2. `product_performance` - Product-level analytics
3. `conversion_funnel` - Conversion rates at each stage
4. `customer_behavior` - Customer engagement patterns
5. `hourly_traffic` - Traffic patterns by hour/day

**Sample Queries**:
- Top performing products
- Revenue trends over time
- Customer retention cohort analysis
- Average order completion time
- Product category performance

### 4. QuickSight Dashboard

**Location**: `amplify/custom/analytics/quicksight-dashboard-config.json`

**Visuals**:
1. KPI Summary (Revenue, Orders, AOV, Completion Rate)
2. Revenue Trend (Line chart)
3. Orders Trend (Line chart)
4. Top Products (Table)
5. Conversion Funnel (Funnel chart)
6. Traffic Heatmap (Heat map)
7. Engagement Metrics (Bar chart)

### 5. GraphQL Schema Updates

**Location**: `amplify/data/resource.ts`

**New Operations**:
```graphql
mutation trackUserInteraction(
  eventType: String!
  vendorId: ID
  customerId: ID
  productId: ID
  orderId: ID
  metadata: AWSJSON
): TrackInteractionResponse

query getVendorAnalytics(
  vendorId: ID!
  startDate: String
  endDate: String
  period: String
): VendorAnalyticsResponse
```

### 6. Deployment Script

**Location**: `scripts/deploy-analytics.sh`

**Features**:
- Deploys CloudFormation stack
- Creates/updates infrastructure
- Sets up event source mapping
- Outputs configuration values
- Provides next steps

**Usage**:
```bash
./scripts/deploy-analytics.sh dev
```

## Data Flow

### Real-time Path (Low Latency)
1. User interacts with product/vendor
2. Frontend calls `trackUserInteraction` mutation
3. Lambda sends event to Kinesis stream
4. `analyticsEventProcessor` Lambda processes event
5. Metrics aggregated in DynamoDB
6. `getVendorAnalytics` query returns real-time data

### Historical Path (High Volume)
1. Events flow through Kinesis to Firehose
2. Firehose converts to Parquet and stores in S3
3. Glue crawler catalogs data daily
4. Athena queries S3 data via Glue catalog
5. QuickSight visualizes historical trends

## DynamoDB Schema

### Vendor Daily Metrics
```
PK: VENDOR#{vendorId}
SK: METRICS#{YYYY-MM-DD}
Attributes:
  - productViews: number
  - profileViews: number
  - productFavorites: number
  - cartAdds: number
  - orders: number
  - completedOrders: number
  - revenue: number
```

### Product Daily Metrics
```
PK: PRODUCT#{productId}
SK: METRICS#{YYYY-MM-DD}
GSI1PK: VENDOR#{vendorId}
GSI1SK: PRODUCT#METRICS#{YYYY-MM-DD}
Attributes:
  - views: number
  - favorites: number
  - cartAdds: number
  - orders: number
  - revenue: number
  - vendorId: string
```

### Order Events
```
PK: ORDER#{orderId}
SK: EVENT#{timestamp}
Attributes:
  - eventType: string
  - vendorId: string
  - customerId: string
  - total: number
  - items: array
```

## Event Types

### ProductView
Tracks when a user views a product detail page.

### ProductFavorite
Tracks when a user adds/removes a product from favorites.

### CartAdd
Tracks when a user adds a product to cart.

### VendorView
Tracks when a user views a vendor profile page.

### OrderCreated
Tracks when an order is created (includes items and totals).

### OrderCompleted
Tracks when an order is completed (includes completion time).

## Metrics Provided

### Summary Metrics
- Total revenue
- Total orders
- Completed orders
- Average order value
- Conversion rate (views → orders)
- Completion rate (orders → completed)

### Daily Metrics
- Product views
- Profile views
- Favorites
- Cart adds
- Orders
- Revenue

### Product Analytics
- Top products by revenue
- Product views
- Product favorites
- Product orders
- Conversion rate per product

### Historical Trends
- Weekly/monthly aggregations
- Long-term performance trends
- Seasonal patterns

## Setup Instructions

### 1. Deploy Infrastructure
```bash
./scripts/deploy-analytics.sh dev
```

### 2. Update Lambda Environment Variables
After deployment, update Lambda functions with:
- `KINESIS_STREAM_NAME`
- `ANALYTICS_TABLE`
- `ATHENA_DATABASE`
- `ATHENA_OUTPUT_LOCATION`

### 3. Run Glue Crawler
```bash
aws glue start-crawler --name makeriess-analytics-crawler-dev
```

### 4. Create Athena Views
Execute queries from `amplify/custom/analytics/athena-queries.sql` in Athena console.

### 5. Set Up QuickSight
1. Enable QuickSight in AWS account
2. Grant permissions to S3 and Athena
3. Create data source (Athena)
4. Create datasets from views
5. Build dashboard using config file
6. Set up row-level security for vendors

## Usage Examples

### Track Product View (Frontend)
```typescript
await client.graphql({
  query: mutations.trackUserInteraction,
  variables: {
    eventType: 'ProductView',
    vendorId: 'vendor_123',
    productId: 'product_789',
    customerId: currentUser.id,
  },
});
```

### Get Vendor Analytics (Frontend)
```typescript
const result = await client.graphql({
  query: queries.getVendorAnalytics,
  variables: {
    vendorId: 'vendor_123',
    startDate: '2025-10-01',
    endDate: '2025-11-08',
    period: 'daily',
  },
});

console.log(result.data.getVendorAnalytics.summary);
console.log(result.data.getVendorAnalytics.topProducts);
```

## Monitoring

### CloudWatch Metrics to Monitor
- Kinesis: `IncomingRecords`, `WriteProvisionedThroughputExceeded`
- Firehose: `DeliveryToS3.Success`, `DeliveryToS3.DataFreshness`
- Lambda: `Invocations`, `Errors`, `Duration`, `IteratorAge`
- DynamoDB: `ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`

### Recommended Alarms
- Kinesis iterator age > 1 hour
- Lambda error rate > 5%
- Firehose delivery failures
- DynamoDB throttling events

## Cost Optimization

1. **Kinesis**: Use on-demand mode for variable traffic
2. **S3**: Lifecycle policies move old data to cheaper storage
3. **DynamoDB**: On-demand billing for unpredictable workloads
4. **Athena**: Partitioning reduces scan costs
5. **QuickSight**: SPICE caching reduces Athena query costs

## Requirements Satisfied

✅ **13.1**: Kinesis Data Stream for real-time event ingestion
- Stream created with configurable shard count
- 24-hour retention for replay capability
- Batch processing with error handling

✅ **13.2**: Kinesis Firehose for S3 delivery
- Automatic JSON to Parquet conversion
- GZIP compression for storage efficiency
- Partitioned by date for query optimization
- 5-minute buffering for cost efficiency

✅ **13.3**: AWS Glue for data cataloging
- Automated schema detection
- Daily crawler schedule
- Partition management
- Table versioning

✅ **13.4**: Athena queries for vendor analytics
- Pre-built views for common queries
- Optimized queries with partitioning
- Support for complex aggregations
- Historical trend analysis

✅ **13.5**: QuickSight dashboards for vendor insights
- Comprehensive dashboard configuration
- Multiple visualization types
- Real-time and historical data
- Row-level security for multi-tenancy

## Documentation

- **Setup Guide**: `amplify/data/functions/README_ANALYTICS_SERVICE.md`
- **Athena Queries**: `amplify/custom/analytics/athena-queries.sql`
- **Dashboard Config**: `amplify/custom/analytics/quicksight-dashboard-config.json`
- **Infrastructure**: `amplify/custom/analytics/analytics-infrastructure.json`

## Testing Recommendations

1. **Unit Tests**: Test event processing logic in Lambda functions
2. **Integration Tests**: Test end-to-end event flow
3. **Load Tests**: Verify Kinesis throughput under load
4. **Data Quality**: Validate metrics accuracy
5. **Query Performance**: Benchmark Athena query times

## Future Enhancements

1. **Real-time Dashboards**: Use Kinesis Data Analytics for real-time aggregations
2. **Anomaly Detection**: ML-based anomaly detection on metrics
3. **Predictive Analytics**: Forecast future trends
4. **Custom Reports**: Allow vendors to create custom reports
5. **Data Export**: Enable vendors to export their data
6. **Benchmarking**: Compare vendor performance to category averages

## Notes

- All Lambda functions include comprehensive error handling
- DynamoDB uses atomic counters for accurate metrics
- Kinesis batch processing includes partial failure handling
- Athena queries are optimized with partitioning
- QuickSight dashboard supports multi-tenancy with RLS
- Infrastructure is environment-aware (dev/staging/prod)
- Deployment script is idempotent and safe to re-run
