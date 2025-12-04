# Monitoring Quick Reference

Quick reference for using monitoring utilities in Lambda functions.

## Basic Setup

```typescript
import { createLogger } from '../shared/logger';
import { withErrorHandling } from '../shared/errorHandler';
import { recordMetric, flushMetrics } from '../shared/metrics';
import { traceAWSClient } from '../shared/tracing';

const logger = createLogger();
const dynamoClient = traceAWSClient(new DynamoDBClient({}));

const handlerImpl = async (event: any, context: any) => {
  logger.setContext({ requestId: context.requestId });
  
  try {
    // Your logic
    await flushMetrics();
    return { statusCode: 200, body: '...' };
  } catch (error) {
    await flushMetrics();
    throw error;
  }
};

export const handler = withErrorHandling(handlerImpl);
```

## Logging

```typescript
// Set context
logger.setContext({ customerId: 'cust_123', orderId: 'order_456' });

// Log messages
logger.debug('Debug message', { detail: 'value' });
logger.info('Info message', { detail: 'value' });
logger.warn('Warning message', { detail: 'value' });
logger.error('Error message', error, { detail: 'value' });

// Measure execution time
const result = await logger.measureTime('OperationName', async () => {
  return await operation();
});
```

## Error Handling

```typescript
// Throw custom errors
throw new ValidationError('Invalid input', { field: 'email' });
throw new NotFoundError('Resource not found', 'Product', 'prod_123');
throw new UnauthorizedError('Access denied');
throw new PaymentError('Payment failed', 'insufficient_funds');
throw new ExternalServiceError('API error', 'Stripe', 502);

// Retry with backoff
const result = await retryWithBackoff(
  () => externalAPICall(),
  { maxRetries: 3, initialDelayMs: 1000 }
);
```

## Metrics

```typescript
// Business metrics
recordOrderMetric('created', 45.50, 'vendor_123');
recordPaymentMetric('success', 45.50, 'stripe');
recordPOSSyncMetric('vendor_123', 'square', true, 25);

// Performance metrics
recordLatency('createOrder', 1250, true);
recordError('ValidationError', 'createOrder');

// Measure execution time
const result = await measureExecutionTime('DatabaseQuery', async () => {
  return await query();
});

// Flush before termination
await flushMetrics();
```

## Tracing

```typescript
// Wrap AWS clients
const dynamoClient = traceAWSClient(new DynamoDBClient({}));
const s3Client = traceAWSClient(new S3Client({}));

// Add annotations (indexed, filterable)
addAnnotation('customerId', 'cust_123');
addAnnotation('operation', 'createOrder');

// Add metadata (not indexed, detailed)
addMetadata('orderDetails', { items: 3, total: 45.50 });

// Trace operations
await traceOperation('ValidateOrder', async () => {
  return await validateOrder(input);
});

await traceDatabaseOperation('GetItem', 'Orders', async () => {
  return await docClient.send(command);
});

await traceExternalService('Stripe', 'CreatePaymentIntent', async () => {
  return await stripe.paymentIntents.create(params);
});
```

## Common Patterns

### Order Processing

```typescript
const handlerImpl = async (event: any, context: any) => {
  logger.setContext({ requestId: context.requestId });
  logger.info('Processing order');

  try {
    const input = JSON.parse(event.body);
    addAnnotation('customerId', input.customerId);

    const order = await measureExecutionTime('CreateOrder', async () => {
      return await createOrder(input);
    });

    recordOrderMetric('created', order.total, order.vendorId);
    await flushMetrics();

    logger.info('Order created successfully', { orderId: order.id });
    return { statusCode: 201, body: JSON.stringify(order) };
  } catch (error) {
    await flushMetrics();
    throw error;
  }
};
```

### Payment Processing

```typescript
const handlerImpl = async (event: any, context: any) => {
  logger.setContext({ requestId: context.requestId });
  logger.info('Processing payment');

  try {
    const { orderId, amount } = JSON.parse(event.body);
    addAnnotation('orderId', orderId);

    const paymentIntent = await traceExternalService(
      'Stripe',
      'CreatePaymentIntent',
      async () => {
        return await stripe.paymentIntents.create({
          amount: amount * 100,
          currency: 'usd',
        });
      }
    );

    recordPaymentMetric('success', amount, 'stripe');
    await flushMetrics();

    logger.info('Payment processed', { paymentIntentId: paymentIntent.id });
    return { statusCode: 200, body: JSON.stringify(paymentIntent) };
  } catch (error) {
    recordPaymentMetric('failed', amount, 'stripe');
    await flushMetrics();
    throw new PaymentError('Payment processing failed', error.code);
  }
};
```

### POS Sync

```typescript
const handlerImpl = async (event: any, context: any) => {
  logger.setContext({ requestId: context.requestId });
  logger.info('Syncing POS products');

  try {
    const { vendorId, provider } = event;
    addAnnotation('vendorId', vendorId);

    const products = await retryWithBackoff(
      () => fetchPOSProducts(provider),
      { maxRetries: 3 }
    );

    await measureExecutionTime('SaveProducts', async () => {
      return await saveProducts(products);
    });

    recordPOSSyncMetric(vendorId, provider, true, products.length);
    await flushMetrics();

    logger.info('POS sync completed', { productCount: products.length });
    return { statusCode: 200, body: JSON.stringify({ synced: products.length }) };
  } catch (error) {
    recordPOSSyncMetric(vendorId, provider, false);
    await flushMetrics();
    throw new ExternalServiceError('POS sync failed', provider);
  }
};
```

## CloudWatch Queries

### Find Errors

```
fields @timestamp, level, message, error.message
| filter level = "ERROR"
| sort @timestamp desc
| limit 50
```

### Performance Analysis

```
fields message, metadata.duration
| filter metadata.duration > 0
| stats avg(metadata.duration) as avgDuration, max(metadata.duration) as maxDuration by message
| sort avgDuration desc
```

### Order Metrics

```
fields @timestamp, message, metadata.totalAmount
| filter message = "Orders created successfully"
| stats count() as orderCount, sum(metadata.totalAmount) as revenue by bin(@timestamp, 1h)
```

## Viewing Metrics

### CloudWatch Console

1. Go to CloudWatch → Metrics
2. Select `Makeriess/Application`
3. Choose metric to view

### CLI

```bash
aws cloudwatch get-metric-statistics \
  --namespace Makeriess/Application \
  --metric-name OrderCount \
  --dimensions Name=MetricType,Value=created \
  --start-time 2025-11-21T00:00:00Z \
  --end-time 2025-11-21T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

## X-Ray Console

1. Go to X-Ray → Traces
2. Filter by annotation: `customerId = "cust_123"`
3. View service map
4. Analyze trace details

## Alarms

### Check Alarm Status

```bash
aws cloudwatch describe-alarms \
  --alarm-names processOrder-error-rate
```

### Test Alert

```bash
# Trigger an error in Lambda
# Check email for SNS notification
```

## Best Practices

✅ **DO:**
- Set context at start of handler
- Use appropriate log levels
- Record business metrics
- Flush metrics before termination
- Wrap AWS clients with tracing
- Use custom error classes

❌ **DON'T:**
- Log sensitive data
- Forget to flush metrics
- Swallow errors silently
- Create too many custom metrics
- Add PII to annotations

## Resources

- [Full Setup Guide](MONITORING_SETUP.md)
- [CloudWatch Queries](CLOUDWATCH_QUERIES.md)
- [Utilities README](../amplify/data/functions/shared/MONITORING_README.md)
