# Monitoring and Error Tracking Setup

This document describes the comprehensive monitoring and error tracking infrastructure for the Makeriess marketplace platform.

## Overview

The monitoring system provides:
- **Structured Logging**: Consistent JSON-formatted logs across all Lambda functions
- **Error Tracking**: Centralized error handling with automatic alerting
- **Custom Metrics**: Business and performance metrics in CloudWatch
- **Distributed Tracing**: X-Ray tracing for end-to-end request tracking
- **Automated Alerts**: SNS notifications for critical errors and threshold breaches
- **Dashboards**: Real-time CloudWatch dashboards for system health

## Architecture

```
┌─────────────────┐
│ Lambda Function │
└────────┬────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────┐                      ┌──────────────────┐
│  CloudWatch     │                      │   AWS X-Ray      │
│  Logs & Metrics │                      │  Distributed     │
│                 │                      │  Tracing         │
└────────┬────────┘                      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  CloudWatch     │
│  Alarms         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SNS Topic      │
│  (Alerts)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email/Slack    │
│  Notifications  │
└─────────────────┘
```

## Components

### 1. Structured Logging (`shared/logger.ts`)

Provides consistent logging format across all Lambda functions.

**Features:**
- JSON-formatted logs for easy parsing
- Log levels: DEBUG, INFO, WARN, ERROR
- Contextual logging with request IDs, user IDs, etc.
- Child loggers for scoped contexts
- Execution time measurement

**Usage:**

```typescript
import { createLogger } from '../shared/logger';

const logger = createLogger({
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
});

// Set request context
logger.setContext({
  requestId: context.requestId,
  customerId: 'cust_123',
});

// Log messages
logger.info('Processing order', { orderId: 'order_456' });
logger.error('Payment failed', error, { paymentIntentId: 'pi_789' });

// Measure execution time
const result = await logger.measureTime('DatabaseQuery', async () => {
  return await fetchData();
});
```

**Log Format:**

```json
{
  "timestamp": "2025-11-21T10:30:00.000Z",
  "level": "ERROR",
  "message": "Payment processing failed",
  "context": {
    "functionName": "processPayment",
    "requestId": "abc-123",
    "customerId": "cust_456"
  },
  "error": {
    "name": "PaymentError",
    "message": "Insufficient funds",
    "stack": "...",
    "code": "insufficient_funds"
  },
  "metadata": {
    "paymentIntentId": "pi_789",
    "amount": 45.50
  }
}
```

### 2. Error Handling (`shared/errorHandler.ts`)

Centralized error handling with automatic alerting for critical errors.

**Custom Error Classes:**
- `ValidationError`: Input validation failures (400)
- `NotFoundError`: Resource not found (404)
- `UnauthorizedError`: Authentication failures (401)
- `PaymentError`: Payment processing failures (402)
- `ExternalServiceError`: Third-party service failures (502)

**Features:**
- Automatic error-to-HTTP response conversion
- Critical error detection and alerting
- Retry logic with exponential backoff
- Error context preservation

**Usage:**

```typescript
import {
  withErrorHandling,
  ValidationError,
  NotFoundError,
  retryWithBackoff,
} from '../shared/errorHandler';

// Wrap handler with error handling
export const handler = withErrorHandling(async (event, context) => {
  // Throw custom errors
  if (!input.customerId) {
    throw new ValidationError('Customer ID is required');
  }

  const product = await getProduct(productId);
  if (!product) {
    throw new NotFoundError('Product not found', 'Product', productId);
  }

  // Retry with backoff
  const result = await retryWithBackoff(
    () => externalAPICall(),
    { maxRetries: 3, initialDelayMs: 1000 }
  );

  return { statusCode: 200, body: JSON.stringify(result) };
});
```

**Critical Error Alerting:**

Critical errors automatically trigger SNS alerts to the development team:
- Payment errors
- External service 5xx errors
- Database errors
- Timeout errors

### 3. Custom Metrics (`shared/metrics.ts`)

Track business and performance metrics in CloudWatch.

**Metric Types:**
- **Business Metrics**: Orders, payments, POS syncs
- **Performance Metrics**: API latency, error rates
- **Custom Metrics**: Any application-specific metrics

**Usage:**

```typescript
import {
  recordOrderMetric,
  recordPaymentMetric,
  recordLatency,
  measureExecutionTime,
  flushMetrics,
} from '../shared/metrics';

// Record business metrics
recordOrderMetric('created', orderTotal, vendorId);
recordPaymentMetric('success', amount, 'stripe');

// Record performance metrics
recordLatency('createOrder', durationMs, true);

// Measure execution time automatically
const result = await measureExecutionTime('DatabaseQuery', async () => {
  return await query();
});

// Flush metrics before Lambda termination
await flushMetrics();
```

**Available Metrics:**

| Metric Name | Description | Dimensions |
|------------|-------------|------------|
| `OrderCount` | Number of orders | MetricType (created/completed/cancelled/failed), VendorId |
| `OrderValue` | Order dollar amount | MetricType, VendorId |
| `PaymentCount` | Number of payments | MetricType (success/failed/refunded), PaymentMethod |
| `PaymentAmount` | Payment dollar amount | MetricType, PaymentMethod |
| `APILatency` | API response time (ms) | Operation, Status (Success/Error) |
| `ErrorCount` | Number of errors | ErrorType, Operation |
| `POSSyncCount` | POS sync operations | VendorId, Provider, Status |
| `POSProductsUpdated` | Products synced | VendorId, Provider |

### 4. Distributed Tracing (`shared/tracing.ts`)

AWS X-Ray integration for end-to-end request tracking.

**Features:**
- Automatic AWS SDK instrumentation
- Custom subsegments for operations
- Annotations for filtering traces
- Metadata for detailed context

**Usage:**

```typescript
import {
  traceAWSClient,
  traceOperation,
  addAnnotation,
  addMetadata,
  traceDatabaseOperation,
  traceExternalService,
} from '../shared/tracing';

// Wrap AWS clients with tracing
const dynamoClient = traceAWSClient(new DynamoDBClient({}));

// Add annotations (indexed, filterable)
addAnnotation('customerId', 'cust_123');
addAnnotation('operation', 'createOrder');

// Add metadata (not indexed, can be complex)
addMetadata('orderDetails', { items: 3, total: 45.50 });

// Trace custom operations
await traceOperation('ValidateOrder', async () => {
  return await validateOrder(input);
}, { itemCount: 3 });

// Trace database operations
await traceDatabaseOperation('GetItem', 'Orders', async () => {
  return await docClient.send(command);
});

// Trace external service calls
await traceExternalService('Stripe', 'CreatePaymentIntent', async () => {
  return await stripe.paymentIntents.create(params);
});
```

**X-Ray Service Map:**

X-Ray automatically generates a service map showing:
- Lambda function invocations
- DynamoDB queries
- External API calls
- Error rates and latencies

### 5. CloudWatch Alarms

Automated alarms for critical thresholds.

**Lambda Function Alarms:**
- **Error Rate**: > 5% errors in 5 minutes
- **Throttles**: > 10 throttles in 5 minutes
- **Duration**: P99 > 3 seconds
- **Concurrent Executions**: > 80% of reserved concurrency

**Business Metric Alarms:**
- **Order Completion Rate**: < 90%
- **Payment Failure Rate**: > 10%
- **API Latency**: P99 > 3 seconds
- **Error Count**: > 50 errors in 5 minutes

**Configuration:**

```typescript
import { MonitoringStack } from './amplify/custom/monitoring/resource';

const monitoring = new MonitoringStack(stack, {
  alertEmail: 'dev-team@makeriess.com',
  environment: 'production',
});

// Create alarms for Lambda function
monitoring.createLambdaAlarms(processOrderFunction, 'processOrder');

// Create business metric alarms
monitoring.createBusinessMetricAlarms(stack);
```

### 6. CloudWatch Dashboard

Real-time monitoring dashboard with key metrics.

**Dashboard Sections:**
1. **Lambda Metrics**: Invocations, errors, duration, throttles
2. **Business Metrics**: Orders, payments, POS syncs
3. **Performance Metrics**: API latency (P50, P90, P99)
4. **Error Metrics**: Error count by type

**Access:**
- AWS Console → CloudWatch → Dashboards → `makeriess-monitoring-{env}`

## Setup Instructions

### 1. Configure Alert Email

Update the monitoring configuration with your team's email:

```typescript
// amplify/backend.ts
import { MonitoringStack } from './custom/monitoring/resource';

const monitoring = new MonitoringStack(backend.stack, {
  alertEmail: 'your-team@example.com', // Update this
  environment: process.env.ENV || 'development',
});
```

### 2. Enable X-Ray Tracing

X-Ray tracing is enabled by default for all Lambda functions. To verify:

```typescript
// amplify/data/functions/*/resource.ts
export const myFunction = defineFunction({
  name: 'myFunction',
  entry: './handler.ts',
  // X-Ray tracing is enabled by default in Amplify Gen 2
});
```

### 3. Update Lambda Functions

Update existing Lambda functions to use monitoring utilities:

```typescript
// Before
export const handler = async (event: any) => {
  console.log('Processing request');
  try {
    // ... logic
    return { statusCode: 200, body: '...' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: '...' };
  }
};

// After
import { createLogger } from '../shared/logger';
import { withErrorHandling } from '../shared/errorHandler';
import { recordMetric, flushMetrics } from '../shared/metrics';
import { traceAWSClient } from '../shared/tracing';

const logger = createLogger();
const dynamoClient = traceAWSClient(new DynamoDBClient({}));

const handlerImpl = async (event: any, context: any) => {
  logger.setContext({ requestId: context.requestId });
  logger.info('Processing request');

  try {
    // ... logic
    recordMetric('OperationSuccess', 1);
    await flushMetrics();
    return { statusCode: 200, body: '...' };
  } catch (error) {
    await flushMetrics();
    throw error; // Let error handler deal with it
  }
};

export const handler = withErrorHandling(handlerImpl);
```

### 4. Deploy Monitoring Infrastructure

```bash
# Deploy Amplify backend with monitoring
npx amplify sandbox

# Or for production
npx amplify deploy --branch main
```

### 5. Verify Setup

1. **Check CloudWatch Logs:**
   - AWS Console → CloudWatch → Log Groups
   - Look for `/aws/lambda/processOrder-{env}`
   - Verify JSON-formatted logs

2. **Check CloudWatch Metrics:**
   - AWS Console → CloudWatch → Metrics
   - Look for `Makeriess/Application` namespace
   - Verify custom metrics are being recorded

3. **Check X-Ray Traces:**
   - AWS Console → X-Ray → Traces
   - Filter by annotation: `customerId = "cust_123"`
   - Verify service map is populated

4. **Check Alarms:**
   - AWS Console → CloudWatch → Alarms
   - Verify alarms are created and in OK state

5. **Test Alerts:**
   - Trigger a test error in a Lambda function
   - Verify SNS email notification is received

## Best Practices

### 1. Logging

- **Use appropriate log levels:**
  - DEBUG: Detailed debugging information
  - INFO: General informational messages
  - WARN: Warning messages for potential issues
  - ERROR: Error messages for failures

- **Include context:**
  ```typescript
  logger.setContext({
    requestId: context.requestId,
    customerId: input.customerId,
    orderId: order.id,
  });
  ```

- **Don't log sensitive data:**
  ```typescript
  // Bad
  logger.info('Payment details', { cardNumber: '4242...' });

  // Good
  logger.info('Payment details', { last4: '4242' });
  ```

### 2. Error Handling

- **Use custom error classes:**
  ```typescript
  throw new ValidationError('Invalid input', { field: 'email' });
  ```

- **Preserve error context:**
  ```typescript
  try {
    await operation();
  } catch (error) {
    logger.error('Operation failed', error, { orderId });
    throw error; // Re-throw to trigger alerts
  }
  ```

- **Retry transient failures:**
  ```typescript
  await retryWithBackoff(() => externalAPICall(), {
    maxRetries: 3,
    initialDelayMs: 1000,
  });
  ```

### 3. Metrics

- **Record business metrics:**
  ```typescript
  recordOrderMetric('completed', order.total, order.vendorId);
  ```

- **Measure performance:**
  ```typescript
  const result = await measureExecutionTime('DatabaseQuery', async () => {
    return await query();
  });
  ```

- **Flush before termination:**
  ```typescript
  try {
    // ... logic
  } finally {
    await flushMetrics();
  }
  ```

### 4. Tracing

- **Add meaningful annotations:**
  ```typescript
  addAnnotation('customerId', customerId);
  addAnnotation('operation', 'createOrder');
  ```

- **Trace external calls:**
  ```typescript
  await traceExternalService('Stripe', 'CreatePaymentIntent', async () => {
    return await stripe.paymentIntents.create(params);
  });
  ```

- **Use subsegments for operations:**
  ```typescript
  await traceOperation('ValidateOrder', async () => {
    return await validateOrder(input);
  });
  ```

## Troubleshooting

### Logs Not Appearing

1. Check CloudWatch Log Groups exist
2. Verify Lambda has CloudWatch Logs permissions
3. Check log retention settings

### Metrics Not Recording

1. Verify `flushMetrics()` is called
2. Check CloudWatch Metrics namespace
3. Verify Lambda has CloudWatch PutMetricData permissions

### X-Ray Traces Missing

1. Verify X-Ray tracing is enabled on Lambda
2. Check X-Ray daemon is running
3. Verify Lambda has X-Ray permissions

### Alarms Not Triggering

1. Check alarm configuration and thresholds
2. Verify SNS topic subscription is confirmed
3. Check alarm evaluation periods

## Monitoring Costs

Estimated monthly costs for monitoring:

- **CloudWatch Logs**: $0.50/GB ingested + $0.03/GB stored
- **CloudWatch Metrics**: $0.30 per custom metric
- **CloudWatch Alarms**: $0.10 per alarm
- **X-Ray Traces**: $5.00 per 1 million traces recorded
- **SNS Notifications**: $0.50 per 1 million requests

**Estimated Total**: ~$50-100/month for typical usage

## Additional Resources

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS X-Ray Documentation](https://docs.aws.amazon.com/xray/)
- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [X-Ray SDK for Node.js](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs.html)

## Support

For issues or questions about monitoring:
1. Check CloudWatch Logs for error messages
2. Review X-Ray traces for request flow
3. Contact the development team
