# DynamoDB Single-Table Design Setup

This guide explains the DynamoDB table structure for Makeriess using single-table design pattern.

## Why Single-Table Design?

- **Performance**: Fewer network calls, faster queries
- **Cost**: Lower costs with fewer tables
- **Scalability**: Better partition distribution
- **Simplicity**: One table to manage and monitor

## Table Configuration

### Primary Table

**Table Name**: `makeriess-main-table`

**Billing Mode**: ON_DEMAND (Pay per request)
- Automatically scales with traffic
- No capacity planning required
- Cost-effective for variable workloads

**Encryption**: AWS managed keys (AES-256)

### Key Structure

**Primary Key**:
- `PK` (Partition Key): String - Entity type + ID
- `SK` (Sort Key): String - Relationship or metadata

**Global Secondary Index 1 (GSI1)**:
- `GSI1PK` (Partition Key): String - Alternate access pattern
- `GSI1SK` (Sort Key): String - Alternate sort pattern

**Global Secondary Index 2 (GSI2)**:
- `GSI2PK` (Partition Key): String - Entity type for time-based queries
- `GSI2SK` (Sort Key): String - Timestamp for sorting

## Access Patterns

### Customer Patterns

| Pattern | Keys Used | Example |
|---------|-----------|---------|
| Get customer by ID | PK, SK | PK=`CUSTOMER#123`, SK=`METADATA` |
| Get customer by email | GSI1PK, GSI1SK | GSI1PK=`EMAIL#user@example.com`, GSI1SK=`CUSTOMER` |
| Get customer orders | PK, SK | PK=`CUSTOMER#123`, SK begins_with `ORDER#` |
| Get customer favorites | PK, SK | PK=`CUSTOMER#123`, SK begins_with `FAVORITE#` |

### Vendor Patterns

| Pattern | Keys Used | Example |
|---------|-----------|---------|
| Get vendor by ID | PK, SK | PK=`VENDOR#456`, SK=`METADATA` |
| Get vendor by email | GSI1PK, GSI1SK | GSI1PK=`EMAIL#vendor@example.com`, GSI1SK=`VENDOR` |
| Get vendor products | PK, SK | PK=`VENDOR#456`, SK begins_with `PRODUCT#` |
| Get vendor orders | GSI1PK, GSI1SK | GSI1PK=`VENDOR#456`, GSI1SK begins_with `ORDER#` |

### Product Patterns

| Pattern | Keys Used | Example |
|---------|-----------|---------|
| Get product by ID | PK, SK | PK=`PRODUCT#789`, SK=`METADATA` |
| Get products by vendor | GSI1PK, GSI1SK | GSI1PK=`VENDOR#456`, GSI1SK begins_with `PRODUCT#` |
| Get products by category | GSI2PK, GSI2SK | GSI2PK=`CATEGORY#Food`, GSI2SK begins_with `PRODUCT#` |
| Get product reviews | PK, SK | PK=`PRODUCT#789`, SK begins_with `REVIEW#` |

### Order Patterns

| Pattern | Keys Used | Example |
|---------|-----------|---------|
| Get order by ID | PK, SK | PK=`ORDER#321`, SK=`METADATA` |
| Get customer orders | GSI1PK, GSI1SK | GSI1PK=`CUSTOMER#123`, GSI1SK begins_with `ORDER#` |
| Get vendor orders | GSI2PK, GSI2SK | GSI2PK=`VENDOR#456`, GSI2SK begins_with `ORDER#` |
| Get recent orders | GSI2PK, GSI2SK | GSI2PK=`ORDER`, GSI2SK (sorted by timestamp) |

## Creating the Table

### Option 1: AWS Console

1. Go to DynamoDB Console
2. Click "Create table"
3. Configure:
   - Table name: `makeriess-main-table`
   - Partition key: `PK` (String)
   - Sort key: `SK` (String)
4. Table settings:
   - Capacity mode: On-demand
   - Encryption: AWS managed key
5. Create indexes:
   - GSI1: `GSI1PK` (String), `GSI1SK` (String)
   - GSI2: `GSI2PK` (String), `GSI2SK` (String)
6. Enable Point-in-time recovery
7. Add tags:
   - Environment: production
   - Application: makeriess

### Option 2: AWS CLI

```bash
aws dynamodb create-table \
  --table-name makeriess-main-table \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"GSI1\",
        \"KeySchema\": [
          {\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      },
      {
        \"IndexName\": \"GSI2\",
        \"KeySchema\": [
          {\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      }
    ]" \
  --sse-specification Enabled=true \
  --tags Key=Environment,Value=production Key=Application,Value=makeriess
```

### Option 3: CloudFormation/CDK

```yaml
# cloudformation-template.yaml
Resources:
  MakeriessMainTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: makeriess-main-table
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: GSI1PK
          AttributeType: S
        - AttributeName: GSI1SK
          AttributeType: S
        - AttributeName: GSI2PK
          AttributeType: S
        - AttributeName: GSI2SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: GSI1
          KeySchema:
            - AttributeName: GSI1PK
              KeyType: HASH
            - AttributeName: GSI1SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: GSI2
          KeySchema:
            - AttributeName: GSI2PK
              KeyType: HASH
            - AttributeName: GSI2SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      SSESpecification:
        SSEEnabled: true
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Environment
          Value: production
        - Key: Application
          Value: makeriess
```

## Enable Point-in-Time Recovery

```bash
aws dynamodb update-continuous-backups \
  --table-name makeriess-main-table \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## Example Data Operations

### Put Item (Create Customer)

```typescript
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

await client.send(new PutItemCommand({
  TableName: 'makeriess-main-table',
  Item: {
    PK: { S: 'CUSTOMER#cust_123' },
    SK: { S: 'METADATA' },
    GSI1PK: { S: 'EMAIL#user@example.com' },
    GSI1SK: { S: 'CUSTOMER' },
    email: { S: 'user@example.com' },
    name: { S: 'John Doe' },
    loyaltyPoints: { N: '0' },
    createdAt: { S: new Date().toISOString() },
  },
}));
```

### Query (Get Customer Orders)

```typescript
import { QueryCommand } from '@aws-sdk/client-dynamodb';

const result = await client.send(new QueryCommand({
  TableName: 'makeriess-main-table',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': { S: 'CUSTOMER#cust_123' },
    ':sk': { S: 'ORDER#' },
  },
}));
```

### Query GSI (Get Products by Category)

```typescript
const result = await client.send(new QueryCommand({
  TableName: 'makeriess-main-table',
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :pk AND begins_with(GSI2SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': { S: 'CATEGORY#Food & pastries' },
    ':sk': { S: 'PRODUCT#' },
  },
}));
```

## Cost Estimation

**On-Demand Pricing** (us-east-1):
- Write: $1.25 per million write request units
- Read: $0.25 per million read request units
- Storage: $0.25 per GB-month

**Example Monthly Cost** (1000 orders/day):
- Writes: ~100K/month = $0.13
- Reads: ~500K/month = $0.13
- Storage: ~1GB = $0.25
- **Total: ~$0.50/month**

## Monitoring

Enable CloudWatch alarms for:
- Read/Write throttling
- System errors
- User errors
- Consumed capacity

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name makeriess-table-throttles \
  --alarm-description "Alert on DynamoDB throttles" \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=TableName,Value=makeriess-main-table
```

## Best Practices

1. **Use batch operations** for multiple items
2. **Implement exponential backoff** for retries
3. **Use consistent naming** for PK/SK patterns
4. **Add timestamps** to all items
5. **Use TTL** for temporary data (sessions, caches)
6. **Monitor hot partitions** with CloudWatch
7. **Test access patterns** before production

## Next Steps

After DynamoDB setup:
- Task 1.4: Initialize OpenSearch domain
- Implement Lambda functions for data access
- Set up DynamoDB Streams for real-time processing
