# Task 32: Monitoring and Error Tracking Implementation

## Overview

Implemented comprehensive monitoring and error tracking infrastructure for the Makeriess marketplace platform, including structured logging, custom metrics, distributed tracing, automated alerts, and CloudWatch dashboards.

## Implementation Summary

### 1. Structured Logging (`amplify/data/functions/shared/logger.ts`)

Created a centralized logging utility that provides:
- **JSON-formatted logs** for easy parsing and analysis
- **Log levels**: DEBUG, INFO, WARN, ERROR
- **Contextual logging** with request IDs, user IDs, and custom context
- **Child loggers** for scoped contexts
- **Execution time measurement** for performance tracking

**Key Features:**
```typescript
const logger = createLogger({ functionName: 'myFunction' });
logger.setContext({ requestId: '123', customerId: 'cust_456' });
logger.info('Processing order', { orderId: 'order_789' });
logger.error('Payment failed', error, { paymentIntentId: 'pi_abc' });
await logger.measureTime('DatabaseQuery', async () => fetchData());
```

### 2. Error Handling (`amplify/data/functions/shared/errorHandler.ts`)

Implemented centralized error handling with:
- **Custom error classes**: ValidationError, NotFoundError, UnauthorizedError, PaymentError, ExternalServiceError
- **Automatic error-to-HTTP response conversion**
- **Critical error detection and alerting** via SNS
- **Retry logic with exponential backoff**
- **Error context preservation** for debugging

**Key Features:**
```typescript
export const handler = withErrorHandling(async (event) => {
  if (!input.valid) {
    throw new ValidationError('Invalid input', { field: 'email' });
  }
  
  const result = await retryWithBackoff(
    () => externalAPICall(),
    { maxRetries: 3, initialDelayMs: 1000 }
  );
  
  return { statusCode: 200, body: JSON.stringify(result) };
});
```

**Critical Error Alerting:**
- Payment errors
- External service 5xx errors
- Database errors
- Timeout errors

### 3. Custom Metrics (`amplify/data/functions/shared/metrics.ts`)

Created CloudWatch custom metrics tracking for:
- **Business metrics**: Orders, payments, POS syncs
- **Performance metrics**: API latency, error rates
- **Automatic batching and flushing** to CloudWatch

**Available Metrics:**
- `OrderCount` - Number of orders (dimensions: MetricType, VendorId)
- `OrderValue` - Order dollar amount
- `PaymentCount` - Number of payments (dimensions: MetricType, PaymentMethod)
- `PaymentAmount` - Payment dollar amount
- `APILatency` - API response time (dimensions: Operation, Status)
- `ErrorCount` - Number of errors (dimensions: ErrorType, Operation)
- `POSSyncCount` - POS sync operations (dimensions: VendorId, Provider, Status)

**Key Features:**
```typescript
recordOrderMetric('created', 45.50, 'vendor_123');
recordPaymentMetric('success', 45.50, 'stripe');
recordLatency('createOrder', 1250, true);
await measureExecutionTime('DatabaseQuery', async () => query());
await flushMetrics(); // Call before Lambda termination
```

### 4. Distributed Tracing (`amplify/data/functions/shared/tracing.ts`)

Implemented AWS X-Ray integration for:
- **Automatic AWS SDK instrumentation**
- **Custom subsegments** for tracking operations
- **Annotations** for filtering traces (indexed)
- **Metadata** for detailed context (not indexed)

**Key Features:**
```typescript
const dynamoClient = traceAWSClient(new DynamoDBClient({}));

addAnnotation('customerId', 'cust_123');
addMetadata('orderDetails', { items: 3, total: 45.50 });

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

### 5. CloudWatch Alarms (`amplify/custom/monitoring/resource.ts`)

Created automated alarms for:

**Lambda Function Alarms:**
- Error rate > 5% in 5 minutes
- Throttles > 10 in 5 minutes
- P99 duration > 3 seconds
- Concurrent executions > 80% of reserved concurrency

**Business Metric Alarms:**
- Order completion rate < 90%
- Payment failure rate > 10%
- API latency P99 > 3 seconds
- Error count > 50 in 5 minutes

**Alert Delivery:**
- SNS topic for critical alerts
- Email notifications to development team
- 2-minute alert delivery for critical errors

### 6. CloudWatch Dashboard

Created real-time monitoring dashboard with:
- **Lambda metrics**: Invocations, errors, duration, throttles
- **Business metrics**: Orders (created/completed/failed), payments (success/failed)
- **Performance metrics**: API latency (P50, P90, P99)
- **Error metrics**: Error count by type

### 7. Example Implementation

Created `handler-with-monitoring.ts` showing complete integration:
- Structured logging with context
- Error handling with retry logic
- Custom metrics recording
- X-Ray tracing for all operations
- Proper metric flushing

## Files Created

### Core Utilities
1. `amplify/data/functions/shared/logger.ts` - Structured logging utility
2. `amplify/data/functions/shared/errorHandler.ts` - Error handling and alerting
3. `amplify/data/functions/shared/metrics.ts` - CloudWatch custom metrics
4. `amplify/data/functions/shared/tracing.ts` - AWS X-Ray tracing

### Infrastructure
5. `amplify/custom/monitoring/resource.ts` - CloudWatch alarms and dashboard

### Documentation
6. `docs/MONITORING_SETUP.md` - Complete monitoring setup guide
7. `docs/CLOUDWATCH_QUERIES.md` - CloudWatch Logs Insights query examples
8. `amplify/data/functions/shared/MONITORING_README.md` - Quick reference guide

### Examples & Tools
9. `amplify/data/functions/processOrder/handler-with-monitoring.ts` - Example implementation
10. `scripts/add-monitoring-to-lambda.sh` - Helper script for adding monitoring

### Dependencies
11. `package.json` - Added `aws-xray-sdk-core` and `@aws-sdk/client-cloudwatch`

## Usage Instructions

### For New Lambda Functions

```typescript
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
    // Your logic here
    recordMetric('Success', 1);
    await flushMetrics();
    return { statusCode: 200, body: '...' };
  } catch (error) {
    await flushMetrics();
    throw error;
  }
};

export const handler = withErrorHandling(handlerImpl);
```

### For Existing Lambda Functions

1. Run the helper script:
   ```bash
   chmod +x scripts/add-monitoring-to-lambda.sh
   ./scripts/add-monitoring-to-lambda.sh <function-name>
   ```

2. Update the handler implementation following the example in `handler-with-monitoring.ts`

3. Test locally and deploy:
   ```bash
   npx amplify sandbox
   ```

### Setting Up Alerts

1. Update `amplify/backend.ts` with your alert email:
   ```typescript
   import { MonitoringStack } from './custom/monitoring/resource';
   
   const monitoring = new MonitoringStack(backend.stack, {
     alertEmail: 'your-team@example.com',
     environment: process.env.ENV || 'development',
   });
   ```

2. Deploy the monitoring infrastructure:
   ```bash
   npx amplify deploy
   ```

3. Confirm SNS subscription via email

### Viewing Logs and Metrics

**CloudWatch Logs:**
- AWS Console → CloudWatch → Log Groups
- Select `/aws/lambda/<function-name>`
- Use Logs Insights for advanced queries (see `docs/CLOUDWATCH_QUERIES.md`)

**CloudWatch Metrics:**
- AWS Console → CloudWatch → Metrics
- Select `Makeriess/Application` namespace
- View custom business and performance metrics

**X-Ray Traces:**
- AWS Console → X-Ray → Traces
- Filter by annotations: `customerId`, `operation`, etc.
- View service map for request flow

**CloudWatch Dashboard:**
- AWS Console → CloudWatch → Dashboards
- Select `makeriess-monitoring-{env}`
- View real-time system health

## Requirements Satisfied

✅ **30.1** - Configure CloudWatch Logs for all Lambda functions
- Structured JSON logging with consistent format
- Automatic log group creation
- Contextual logging with request IDs

✅ **30.2** - Set up X-Ray tracing for distributed tracing
- AWS SDK instrumentation
- Custom subsegments for operations
- Annotations and metadata for filtering

✅ **30.3** - Create CloudWatch alarms for error rates and latency
- Lambda function alarms (error rate, throttles, duration)
- Business metric alarms (order completion, payment failure)
- API latency alarms (P99 > 3s)

✅ **30.4** - Implement error logging with context and stack traces
- Custom error classes with context
- Stack trace preservation
- Error metadata for debugging

✅ **30.5** - Set up alerts to development team for critical errors
- SNS topic for critical alerts
- Email notifications
- Automatic critical error detection

## Testing

### 1. Test Logging

```bash
# Deploy function
npx amplify sandbox

# Invoke function
aws lambda invoke --function-name processOrder output.json

# Check logs
aws logs tail /aws/lambda/processOrder --follow
```

### 2. Test Metrics

```bash
# Wait 1-2 minutes for metrics to appear
aws cloudwatch get-metric-statistics \
  --namespace Makeriess/Application \
  --metric-name OrderCount \
  --dimensions Name=MetricType,Value=created \
  --start-time 2025-11-21T00:00:00Z \
  --end-time 2025-11-21T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### 3. Test X-Ray Tracing

```bash
# Invoke function
aws lambda invoke --function-name processOrder output.json

# View traces in X-Ray console
# AWS Console → X-Ray → Traces
```

### 4. Test Alerts

```bash
# Trigger an error in a Lambda function
# Check email for SNS notification
```

## Performance Impact

- **Logging**: ~1-2ms per log entry
- **Metrics**: ~5-10ms per batch flush
- **Tracing**: ~2-5ms overhead per traced operation
- **Error Handling**: Negligible

**Total overhead**: ~10-20ms per Lambda invocation

## Cost Estimate

Monthly costs for monitoring:

- **CloudWatch Logs**: $0.50/GB ingested + $0.03/GB stored
- **CloudWatch Metrics**: $0.30 per custom metric (~20 metrics = $6)
- **CloudWatch Alarms**: $0.10 per alarm (~15 alarms = $1.50)
- **X-Ray Traces**: $5.00 per 1M traces recorded
- **SNS Notifications**: $0.50 per 1M requests

**Estimated Total**: ~$50-100/month for typical usage

## Next Steps

1. **Update Existing Lambda Functions**
   - Run `add-monitoring-to-lambda.sh` for each function
   - Update handler implementations
   - Test and deploy

2. **Configure Alert Email**
   - Update `amplify/backend.ts` with team email
   - Deploy and confirm SNS subscription

3. **Create Saved Queries**
   - Save frequently used CloudWatch Logs Insights queries
   - Share with team

4. **Set Up Dashboards**
   - Customize CloudWatch dashboard widgets
   - Add business-specific metrics

5. **Monitor and Tune**
   - Review alarm thresholds after 1 week
   - Adjust based on actual traffic patterns
   - Add new metrics as needed

## Additional Resources

- [Monitoring Setup Guide](docs/MONITORING_SETUP.md)
- [CloudWatch Queries](docs/CLOUDWATCH_QUERIES.md)
- [Monitoring Utilities README](amplify/data/functions/shared/MONITORING_README.md)
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS X-Ray Documentation](https://docs.aws.amazon.com/xray/)

## Support

For issues or questions:
1. Check CloudWatch Logs for error messages
2. Review X-Ray traces for request flow
3. Consult documentation in `docs/` directory
4. Contact the development team
