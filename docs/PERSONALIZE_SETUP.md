# Amazon Personalize Setup Guide

This guide walks through setting up Amazon Personalize for personalized product recommendations in the Makeriess marketplace.

## Overview

Amazon Personalize is a machine learning service that creates personalized recommendations based on user behavior. We'll use it to recommend products to customers based on their browsing history, favorites, and purchases.

## Prerequisites

- AWS CLI configured with appropriate credentials
- IAM permissions for Amazon Personalize
- Historical interaction data (views, favorites, orders)

## Step 1: Create Dataset Group

A dataset group is a container for datasets, solutions, and campaigns.

```bash
aws personalize create-dataset-group \
  --name makeriess-recommendations \
  --domain ECOMMERCE \
  --region us-east-1
```

Save the `datasetGroupArn` from the response.

## Step 2: Create Interaction Schema

Create a file `interaction-schema.json`:

```json
{
  "type": "record",
  "name": "Interactions",
  "namespace": "com.amazonaws.personalize.schema",
  "fields": [
    {
      "name": "USER_ID",
      "type": "string"
    },
    {
      "name": "ITEM_ID",
      "type": "string"
    },
    {
      "name": "EVENT_TYPE",
      "type": "string"
    },
    {
      "name": "TIMESTAMP",
      "type": "long"
    },
    {
      "name": "EVENT_VALUE",
      "type": ["null", "float"],
      "default": null
    }
  ],
  "version": "1.0"
}
```

Create the schema:

```bash
aws personalize create-schema \
  --name makeriess-interactions-schema \
  --schema file://interaction-schema.json \
  --region us-east-1
```

Save the `schemaArn` from the response.

## Step 3: Create Interactions Dataset

```bash
aws personalize create-dataset \
  --name makeriess-interactions \
  --dataset-group-arn <dataset-group-arn> \
  --dataset-type Interactions \
  --schema-arn <schema-arn> \
  --region us-east-1
```

Save the `datasetArn` from the response.

## Step 4: Prepare Historical Data

### Export Data from DynamoDB

Create a script to export historical interactions:

```typescript
// scripts/export-personalize-data.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { writeFileSync } from 'fs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function exportInteractions() {
  const interactions: any[] = [];

  // Export product views
  // Export favorites
  // Export orders

  // Format as CSV
  const csv = [
    'USER_ID,ITEM_ID,EVENT_TYPE,TIMESTAMP,EVENT_VALUE',
    ...interactions.map(
      (i) =>
        `${i.userId},${i.itemId},${i.eventType},${i.timestamp},${i.eventValue || ''}`
    ),
  ].join('\n');

  writeFileSync('interactions.csv', csv);
  console.log(`Exported ${interactions.length} interactions`);
}

exportInteractions();
```

### Data Format

The CSV should look like:

```csv
USER_ID,ITEM_ID,EVENT_TYPE,TIMESTAMP,EVENT_VALUE
user_123,product_456,view,1699564800,
user_123,product_456,favorite,1699565000,1.0
user_123,product_789,cart-add,1699565200,1.0
user_123,product_456,purchase,1699566000,45.50
user_456,product_789,view,1699567000,
```

**Event Types**:
- `view` - User viewed a product
- `favorite` - User favorited a product (EVENT_VALUE = 1.0)
- `cart-add` - User added to cart (EVENT_VALUE = 1.0)
- `purchase` - User purchased (EVENT_VALUE = order amount)

**Timestamp**: Unix timestamp in seconds

## Step 5: Upload Data to S3

```bash
# Create S3 bucket
aws s3 mb s3://makeriess-personalize-data

# Upload interactions CSV
aws s3 cp interactions.csv s3://makeriess-personalize-data/interactions.csv
```

## Step 6: Create IAM Role for Import

Create a file `personalize-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "personalize.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create a file `personalize-s3-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::makeriess-personalize-data",
        "arn:aws:s3:::makeriess-personalize-data/*"
      ]
    }
  ]
}
```

Create the role:

```bash
# Create role
aws iam create-role \
  --role-name MakeriessPersonalizeRole \
  --assume-role-policy-document file://personalize-trust-policy.json

# Attach policy
aws iam put-role-policy \
  --role-name MakeriessPersonalizeRole \
  --policy-name PersonalizeS3Access \
  --policy-document file://personalize-s3-policy.json
```

Save the role ARN.

## Step 7: Import Historical Data

```bash
aws personalize create-dataset-import-job \
  --job-name makeriess-initial-import \
  --dataset-arn <dataset-arn> \
  --data-source dataLocation=s3://makeriess-personalize-data/interactions.csv \
  --role-arn <role-arn> \
  --region us-east-1
```

Check import status:

```bash
aws personalize describe-dataset-import-job \
  --dataset-import-job-arn <import-job-arn> \
  --region us-east-1
```

Wait for status to be `ACTIVE` (can take 10-30 minutes).

## Step 8: Create Solution

A solution is a trained ML model.

```bash
aws personalize create-solution \
  --name makeriess-user-personalization \
  --dataset-group-arn <dataset-group-arn> \
  --recipe-arn arn:aws:personalize:::recipe/aws-user-personalization \
  --region us-east-1
```

Save the `solutionArn`.

**Recipe Options**:
- `aws-user-personalization` - General recommendations (recommended)
- `aws-personalized-ranking` - Rerank items
- `aws-similar-items` - Similar item recommendations

## Step 9: Create Solution Version (Train Model)

```bash
aws personalize create-solution-version \
  --solution-arn <solution-arn> \
  --region us-east-1
```

Save the `solutionVersionArn`.

Check training status:

```bash
aws personalize describe-solution-version \
  --solution-version-arn <solution-version-arn> \
  --region us-east-1
```

Wait for status to be `ACTIVE` (can take 1-2 hours).

## Step 10: Create Campaign

A campaign deploys the trained model for real-time recommendations.

```bash
aws personalize create-campaign \
  --name makeriess-recommendations-campaign \
  --solution-version-arn <solution-version-arn> \
  --min-provisioned-tps 1 \
  --region us-east-1
```

Save the `campaignArn`.

**Provisioned TPS**:
- Start with 1 TPS (transactions per second)
- Scale up based on traffic
- Each TPS costs ~$0.20/hour (~$150/month)

Check campaign status:

```bash
aws personalize describe-campaign \
  --campaign-arn <campaign-arn> \
  --region us-east-1
```

Wait for status to be `ACTIVE` (can take 10-15 minutes).

## Step 11: Create Event Tracker

Event tracker allows real-time event ingestion.

```bash
aws personalize create-event-tracker \
  --name makeriess-event-tracker \
  --dataset-group-arn <dataset-group-arn> \
  --region us-east-1
```

Save the `trackingId` from the response.

## Step 12: Update Environment Variables

Add to your Amplify environment variables:

```bash
PERSONALIZE_CAMPAIGN_ARN=<campaign-arn>
PERSONALIZE_TRACKING_ID=<tracking-id>
```

## Step 13: Update Lambda IAM Permissions

Add to Lambda execution role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "personalize:GetRecommendations",
        "personalize:GetPersonalizedRanking"
      ],
      "Resource": "<campaign-arn>"
    },
    {
      "Effect": "Allow",
      "Action": [
        "personalize:PutEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 14: Test Recommendations

Test getting recommendations:

```bash
aws personalize-runtime get-recommendations \
  --campaign-arn <campaign-arn> \
  --user-id user_123 \
  --num-results 10 \
  --region us-east-1
```

Expected response:

```json
{
  "itemList": [
    {
      "itemId": "product_456",
      "score": 0.95
    },
    {
      "itemId": "product_789",
      "score": 0.87
    }
  ]
}
```

## Step 15: Test Event Tracking

Test tracking an event:

```bash
aws personalize-events put-events \
  --tracking-id <tracking-id> \
  --user-id user_123 \
  --session-id session_123 \
  --event-list '[{
    "eventId": "event_1",
    "eventType": "view",
    "sentAt": "2024-11-07T10:00:00Z",
    "itemId": "product_456"
  }]' \
  --region us-east-1
```

## Maintenance

### Retrain Model Weekly

Create a weekly EventBridge schedule to retrain:

```bash
aws personalize create-solution-version \
  --solution-arn <solution-arn> \
  --region us-east-1
```

After training completes, update campaign:

```bash
aws personalize update-campaign \
  --campaign-arn <campaign-arn> \
  --solution-version-arn <new-solution-version-arn> \
  --region us-east-1
```

### Monitor Metrics

CloudWatch metrics to monitor:
- `GetRecommendations` invocations
- `PutEvents` success rate
- Campaign latency
- Model accuracy (via offline metrics)

### Scale Campaign

Increase TPS based on traffic:

```bash
aws personalize update-campaign \
  --campaign-arn <campaign-arn> \
  --min-provisioned-tps 5 \
  --region us-east-1
```

## Cost Optimization

**Training**:
- Train weekly, not daily: ~$5/month
- Use smaller datasets for testing

**Campaign Hosting**:
- Start with 1 TPS: ~$30/month
- Scale up only when needed
- Use auto-scaling if available

**Event Tracking**:
- Free for first 100K events/month
- $0.05 per 1000 events after

**Total Estimated Cost**: $35-50/month for small-medium traffic

## Troubleshooting

### Import Job Fails

- Check S3 bucket permissions
- Verify CSV format (no headers, correct columns)
- Check IAM role trust policy

### Training Takes Too Long

- Normal for first training (1-2 hours)
- Subsequent trainings are faster
- Check dataset size (minimum 1000 interactions)

### No Recommendations Returned

- User needs interaction history
- Check campaign is ACTIVE
- Verify user ID format matches training data
- Use fallback to popular items

### Low Recommendation Quality

- Need more interaction data (minimum 1000 interactions)
- Retrain model with recent data
- Check event types are being tracked correctly
- Consider using different recipe

## Resources

- [Amazon Personalize Documentation](https://docs.aws.amazon.com/personalize/)
- [Personalize Recipes](https://docs.aws.amazon.com/personalize/latest/dg/working-with-predefined-recipes.html)
- [Best Practices](https://docs.aws.amazon.com/personalize/latest/dg/best-practices.html)
- [Pricing](https://aws.amazon.com/personalize/pricing/)
