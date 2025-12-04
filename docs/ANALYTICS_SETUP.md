# Vendor Analytics Dashboard Setup

This document describes the vendor analytics dashboard implementation for the Makeriess marketplace platform.

## Overview

The vendor analytics dashboard provides comprehensive insights into vendor performance, including:
- Sales trends (daily, weekly, monthly views)
- Top products by revenue and order count
- Customer engagement metrics (views, favorites, cart adds)
- Conversion rates and order completion rates

## Architecture

### Data Flow

```
User Interactions → Kinesis Stream → Firehose → S3 (Parquet) → Athena/QuickSight
                                                    ↓
                                              DynamoDB (Real-time)
```

### Components

1. **Kinesis Data Stream**: Ingests real-time analytics events
2. **Kinesis Firehose**: Delivers data to S3 in Parquet format
3. **S3 Buckets**: 
   - `makeriess-analytics-data-{env}`: Stores event data
   - `makeriess-analytics-results-{env}`: Stores Athena query results
4. **AWS Glue**: Catalogs data and runs scheduled crawlers
5. **Amazon Athena**: Queries historical data for trends
6. **DynamoDB**: Stores aggregated metrics for fast access
7. **Lambda Functions**: Process events and aggregate metrics

## Frontend Implementation

### Analytics Page

Location: `src/app/vendor/analytics/page.tsx`

Features:
- Date range selector (last 7/30/90 days, custom range)
- Period toggle (daily, weekly, monthly)
- Summary metrics cards
- Sales trend chart
- Customer engagement chart
- Top products table
- Export to CSV functionality

### Components

1. **AnalyticsMetricCard** (`src/components/vendor/AnalyticsMetricCard.tsx`)
   - Displays key metrics with icons
   - Supports currency, percentage, and number formats
   - Shows change indicators

2. **SalesTrendChart** (`src/components/vendor/SalesTrendChart.tsx`)
   - Horizontal bar chart showing revenue over time
   - Displays order counts
   - Responsive design

3. **TopProductsTable** (`src/components/vendor/TopProductsTable.tsx`)
   - Table view of top 10 products
   - Shows views, favorites, cart adds, orders, revenue
   - Conversion rate indicators

4. **EngagementMetricsChart** (`src/components/vendor/EngagementMetricsChart.tsx`)
   - Visual representation of engagement metrics
   - Progress bars for views, favorites, cart adds
   - Calculated rates (favorite rate, cart add rate)

### API Hook

Location: `src/lib/hooks/useAnalytics.ts`

```typescript
const { data, isLoading, error } = useVendorAnalytics({
  vendorId: 'vendor_123',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  period: 'daily',
});
```

## Backend Implementation

### Lambda Function

Location: `amplify/data/functions/getVendorAnalytics/handler.ts`

Responsibilities:
- Query DynamoDB for real-time metrics
- Query Athena for historical trends
- Aggregate data by period (daily, weekly, monthly)
- Calculate summary statistics
- Return top products by revenue

### Data Models

#### DynamoDB Schema

```
PK: VENDOR#{vendorId}
SK: METRICS#{date}

Attributes:
- productViews: number
- profileViews: number
- productFavorites: number
- cartAdds: number
- orders: number
- completedOrders: number
- revenue: number
```

#### Athena Schema

```sql
CREATE EXTERNAL TABLE vendor_events (
  eventType STRING,
  timestamp STRING,
  vendorId STRING,
  customerId STRING,
  productId STRING,
  orderId STRING,
  metadata STRUCT<
    action: STRING,
    quantity: INT,
    total: DOUBLE,
    items: ARRAY<STRUCT<productId:STRING, quantity:INT, subtotal:DOUBLE>>,
    completionTime: INT
  >
)
PARTITIONED BY (year STRING, month STRING, day STRING)
STORED AS PARQUET
LOCATION 's3://makeriess-analytics-data-{env}/vendor-events/';
```

## Event Tracking

### Event Types

1. **ProductView**
   ```json
   {
     "eventType": "ProductView",
     "timestamp": "2025-11-18T10:30:00Z",
     "vendorId": "vendor_123",
     "customerId": "customer_456",
     "productId": "product_789",
     "metadata": {}
   }
   ```

2. **ProductFavorite**
   ```json
   {
     "eventType": "ProductFavorite",
     "timestamp": "2025-11-18T10:31:00Z",
     "vendorId": "vendor_123",
     "customerId": "customer_456",
     "productId": "product_789",
     "metadata": { "action": "add" }
   }
   ```

3. **CartAdd**
   ```json
   {
     "eventType": "CartAdd",
     "timestamp": "2025-11-18T10:32:00Z",
     "vendorId": "vendor_123",
     "customerId": "customer_456",
     "productId": "product_789",
     "metadata": { "quantity": 2 }
   }
   ```

4. **OrderCreated**
   ```json
   {
     "eventType": "OrderCreated",
     "timestamp": "2025-11-18T10:35:00Z",
     "vendorId": "vendor_123",
     "customerId": "customer_456",
     "orderId": "order_101",
     "metadata": {
       "total": 45.50,
       "items": [
         { "productId": "product_789", "quantity": 2, "subtotal": 45.50 }
       ]
     }
   }
   ```

5. **OrderCompleted**
   ```json
   {
     "eventType": "OrderCompleted",
     "timestamp": "2025-11-18T11:00:00Z",
     "vendorId": "vendor_123",
     "customerId": "customer_456",
     "orderId": "order_101",
     "metadata": { "completionTime": 25 }
   }
   ```

## Deployment

### Infrastructure Deployment

1. Deploy analytics infrastructure:
   ```bash
   cd scripts
   ./deploy-analytics.sh dev
   ```

2. Verify resources:
   - Kinesis stream: `makeriess-analytics-stream-dev`
   - Firehose: `makeriess-analytics-firehose-dev`
   - S3 buckets created
   - Glue database and tables created
   - DynamoDB table: `MakeriessAnalytics-dev`

### Lambda Deployment

Lambda functions are automatically deployed with Amplify:
```bash
npx ampx sandbox
```

## Usage

### Accessing the Dashboard

1. Navigate to `/vendor/analytics` in the vendor portal
2. Select date range and period
3. View metrics and charts
4. Export data as CSV if needed

### Metrics Explained

- **Total Revenue**: Sum of all completed orders
- **Total Orders**: Number of orders placed
- **Total Views**: Product views + profile views
- **Conversion Rate**: (Orders / Product Views) × 100
- **Avg Order Value**: Total Revenue / Total Orders
- **Completion Rate**: (Completed Orders / Total Orders) × 100
- **Cart Add Rate**: (Cart Adds / Product Views) × 100
- **Favorite Rate**: (Favorites / Product Views) × 100

## Performance Considerations

1. **Caching**: Analytics data is cached for 5 minutes in React Query
2. **Pagination**: Top products limited to 10 items
3. **Date Range**: Recommend limiting to 90 days for optimal performance
4. **Athena Queries**: Timeout after 30 seconds
5. **DynamoDB**: Uses on-demand billing for variable traffic

## Future Enhancements

### Phase 2 (QuickSight Integration)
- Embed QuickSight dashboards for advanced visualizations
- Custom report builder
- Scheduled email reports
- Comparative analytics (vs. previous period)

### Phase 3 (Advanced Analytics)
- Predictive analytics (sales forecasting)
- Customer segmentation
- Product recommendation insights
- A/B testing results

## Troubleshooting

### No Data Showing

1. Check if events are being tracked:
   ```bash
   aws kinesis describe-stream --stream-name makeriess-analytics-stream-dev
   ```

2. Verify Firehose delivery:
   ```bash
   aws s3 ls s3://makeriess-analytics-data-dev/vendor-events/
   ```

3. Check DynamoDB for metrics:
   ```bash
   aws dynamodb scan --table-name MakeriessAnalytics-dev --limit 10
   ```

### Slow Query Performance

1. Check Athena query execution time
2. Verify Glue crawler has run recently
3. Consider partitioning optimization
4. Review DynamoDB read capacity

### Missing Metrics

1. Verify event tracking is implemented in frontend
2. Check Lambda function logs for errors
3. Ensure proper IAM permissions
4. Validate event schema matches expected format

## Support

For issues or questions:
- Check CloudWatch logs for Lambda functions
- Review Kinesis stream metrics
- Contact platform team for infrastructure issues
