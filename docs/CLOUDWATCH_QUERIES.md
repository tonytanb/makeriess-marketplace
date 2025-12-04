# CloudWatch Logs Insights Queries

This document contains useful CloudWatch Logs Insights queries for monitoring and troubleshooting the Makeriess marketplace.

## Getting Started

1. Go to AWS Console → CloudWatch → Logs Insights
2. Select log group(s) to query
3. Paste query and click "Run query"
4. Adjust time range as needed

## Error Analysis Queries

### All Errors in Last Hour

```
fields @timestamp, level, message, context.functionName, error.name, error.message
| filter level = "ERROR"
| sort @timestamp desc
| limit 100
```

### Errors by Function

```
fields @timestamp, context.functionName, error.name, error.message
| filter level = "ERROR"
| stats count() as errorCount by context.functionName
| sort errorCount desc
```

### Errors by Type

```
fields @timestamp, error.name, error.message
| filter level = "ERROR"
| stats count() as errorCount by error.name
| sort errorCount desc
```

### Critical Errors (Payment, Database, Timeout)

```
fields @timestamp, context.functionName, error.name, error.message, error.stack
| filter level = "ERROR" and (error.name = "PaymentError" or error.name = "DynamoDBServiceException" or error.name = "TimeoutError")
| sort @timestamp desc
| limit 50
```

### Errors for Specific Customer

```
fields @timestamp, context.functionName, message, error.message
| filter level = "ERROR" and context.customerId = "cust_123"
| sort @timestamp desc
| limit 50
```

## Performance Analysis Queries

### Slow Operations (> 2 seconds)

```
fields @timestamp, message, metadata.duration, context.functionName
| filter metadata.duration > 2000
| sort metadata.duration desc
| limit 50
```

### Average Duration by Operation

```
fields message, metadata.duration
| filter metadata.duration > 0
| stats avg(metadata.duration) as avgDuration, max(metadata.duration) as maxDuration, count() as operationCount by message
| sort avgDuration desc
```

### P50, P90, P99 Latency

```
fields metadata.duration
| filter metadata.duration > 0
| stats pct(metadata.duration, 50) as p50, pct(metadata.duration, 90) as p90, pct(metadata.duration, 99) as p99
```

### Lambda Cold Starts

```
fields @timestamp, @initDuration, context.functionName
| filter @type = "REPORT" and @initDuration > 0
| stats count() as coldStarts, avg(@initDuration) as avgInitDuration by context.functionName
| sort coldStarts desc
```

## Business Metrics Queries

### Orders Created by Hour

```
fields @timestamp, message
| filter message = "Orders created successfully"
| stats count() as orderCount by bin(@timestamp, 1h)
| sort @timestamp desc
```

### Order Success Rate

```
fields message
| filter message in ["Orders created successfully", "Failed to process order"]
| stats count() as total, 
        sum(case when message = "Orders created successfully" then 1 else 0 end) as success,
        sum(case when message = "Failed to process order" then 1 else 0 end) as failed
| fields (success / total * 100) as successRate
```

### Average Order Value

```
fields metadata.totalAmount
| filter message = "Orders created successfully" and metadata.totalAmount > 0
| stats avg(metadata.totalAmount) as avgOrderValue, 
        sum(metadata.totalAmount) as totalRevenue,
        count() as orderCount
```

### Orders by Vendor

```
fields context.vendorId, metadata.totalAmount
| filter message = "Order saved successfully"
| stats count() as orderCount, sum(metadata.totalAmount) as revenue by context.vendorId
| sort revenue desc
```

### Payment Success Rate

```
fields message
| filter message in ["Payment succeeded", "Payment failed"]
| stats count() as total,
        sum(case when message = "Payment succeeded" then 1 else 0 end) as success,
        sum(case when message = "Payment failed" then 1 else 0 end) as failed
| fields (success / total * 100) as successRate
```

## User Activity Queries

### Active Users by Hour

```
fields @timestamp, context.customerId
| filter context.customerId != ""
| stats count_distinct(context.customerId) as activeUsers by bin(@timestamp, 1h)
| sort @timestamp desc
```

### User Actions

```
fields @timestamp, context.customerId, message
| filter context.customerId = "cust_123"
| sort @timestamp desc
| limit 100
```

### Most Active Users

```
fields context.customerId
| filter context.customerId != ""
| stats count() as actionCount by context.customerId
| sort actionCount desc
| limit 20
```

## POS Integration Queries

### POS Sync Success Rate

```
fields message, metadata.provider
| filter message in ["POS sync completed", "POS sync failed"]
| stats count() as total,
        sum(case when message = "POS sync completed" then 1 else 0 end) as success,
        sum(case when message = "POS sync failed" then 1 else 0 end) as failed
        by metadata.provider
| fields metadata.provider, (success / total * 100) as successRate
```

### POS Sync Errors

```
fields @timestamp, context.vendorId, metadata.provider, error.message
| filter level = "ERROR" and message like /POS sync/
| sort @timestamp desc
| limit 50
```

### Products Synced by Vendor

```
fields @timestamp, context.vendorId, metadata.productsUpdated
| filter message = "POS sync completed"
| stats sum(metadata.productsUpdated) as totalProducts by context.vendorId
| sort totalProducts desc
```

## Request Tracing Queries

### Trace Specific Request

```
fields @timestamp, level, message, metadata
| filter context.requestId = "abc-123-def-456"
| sort @timestamp asc
```

### Requests by Customer

```
fields @timestamp, context.requestId, message
| filter context.customerId = "cust_123"
| sort @timestamp desc
| limit 100
```

### Failed Requests

```
fields @timestamp, context.requestId, context.functionName, error.message
| filter level = "ERROR"
| stats count() as errorCount by context.requestId, context.functionName
| sort errorCount desc
```

## Security & Compliance Queries

### Unauthorized Access Attempts

```
fields @timestamp, context.customerId, error.message
| filter error.name = "UnauthorizedError"
| sort @timestamp desc
| limit 100
```

### Failed Authentication

```
fields @timestamp, message, metadata
| filter message like /authentication failed/i
| sort @timestamp desc
| limit 50
```

### Suspicious Activity (Multiple Failures)

```
fields context.customerId
| filter level = "ERROR"
| stats count() as errorCount by context.customerId
| filter errorCount > 10
| sort errorCount desc
```

## Debugging Queries

### All Logs for Specific Order

```
fields @timestamp, level, message, metadata
| filter context.orderId = "order_123" or metadata.orderId = "order_123"
| sort @timestamp asc
```

### All Logs for Specific Vendor

```
fields @timestamp, level, message, context.functionName
| filter context.vendorId = "vendor_456"
| sort @timestamp desc
| limit 100
```

### Recent Warnings

```
fields @timestamp, context.functionName, message, metadata
| filter level = "WARN"
| sort @timestamp desc
| limit 50
```

### Lambda Memory Usage

```
fields @timestamp, @maxMemoryUsed, @memorySize, context.functionName
| filter @type = "REPORT"
| stats avg(@maxMemoryUsed) as avgMemory, max(@maxMemoryUsed) as maxMemory by context.functionName
| sort maxMemory desc
```

## Custom Queries

### Query Template

```
fields @timestamp, level, message, context.functionName, metadata
| filter <your-filter-condition>
| stats <aggregation> by <field>
| sort <field> desc
| limit 100
```

### Common Filter Conditions

```
# By log level
filter level = "ERROR"
filter level in ["ERROR", "WARN"]

# By function
filter context.functionName = "processOrder"

# By user
filter context.customerId = "cust_123"

# By time range (in addition to UI time picker)
filter @timestamp >= "2025-11-21T00:00:00" and @timestamp < "2025-11-22T00:00:00"

# By message content
filter message like /order/i
filter message = "Orders created successfully"

# By metadata
filter metadata.duration > 2000
filter metadata.provider = "stripe"

# Complex conditions
filter level = "ERROR" and context.functionName = "processOrder" and metadata.orderId like /order_/
```

### Common Aggregations

```
# Count
stats count() as total

# Count distinct
stats count_distinct(context.customerId) as uniqueUsers

# Sum
stats sum(metadata.totalAmount) as totalRevenue

# Average
stats avg(metadata.duration) as avgDuration

# Min/Max
stats min(metadata.duration) as minDuration, max(metadata.duration) as maxDuration

# Percentiles
stats pct(metadata.duration, 50) as p50, pct(metadata.duration, 95) as p95

# Multiple aggregations
stats count() as total, avg(metadata.duration) as avgDuration by context.functionName
```

## Saved Queries

You can save frequently used queries in CloudWatch Logs Insights:

1. Run a query
2. Click "Save" button
3. Give it a name and description
4. Access saved queries from the "Queries" tab

### Recommended Saved Queries

1. **Error Dashboard**: All errors in last hour grouped by function
2. **Performance Dashboard**: P50/P90/P99 latency by operation
3. **Business Dashboard**: Order count, success rate, revenue
4. **User Activity**: Active users and their actions
5. **POS Sync Status**: Sync success rate by provider

## Tips & Best Practices

1. **Use Time Ranges Wisely**: Shorter time ranges = faster queries
2. **Limit Results**: Always use `limit` to avoid large result sets
3. **Index Fields**: Fields starting with `@` are indexed (faster queries)
4. **Case Sensitivity**: Field names are case-sensitive
5. **Regular Expressions**: Use `like` for pattern matching
6. **Aggregations**: Use `stats` for aggregations, not `fields`
7. **Sorting**: Sort after aggregations for better performance
8. **Save Queries**: Save frequently used queries for quick access

## Additional Resources

- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [CloudWatch Logs Insights Sample Queries](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-examples.html)
- [CloudWatch Logs Insights Tutorial](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
