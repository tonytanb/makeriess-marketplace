# Amazon OpenSearch Service Setup Guide

This guide walks through setting up OpenSearch for product search in Makeriess.

## Overview

OpenSearch provides:
- Fast full-text search across products
- Geospatial filtering (find products near you)
- Faceted search (filter by category, dietary tags, price)
- Autocomplete and search suggestions
- Relevance scoring and ranking

## Prerequisites

- AWS Account with OpenSearch permissions
- VPC with at least 3 subnets (for production)
- IAM role for Lambda access

## Domain Configuration

### Basic Settings

- **Domain name**: `makeriess-products`
- **Version**: OpenSearch 2.11
- **Deployment type**: Production (3 availability zones)

### Cluster Configuration

- **Instance type**: t3.medium.search
- **Number of nodes**: 3 (for high availability)
- **Dedicated master nodes**: Not required for this size
- **Storage per node**: 100GB EBS (gp3)

### Network Configuration

**Option 1: VPC Access (Recommended for Production)**
- Deploy in private subnets
- Access via Lambda functions in same VPC
- More secure, better performance

**Option 2: Public Access (Development Only)**
- Public endpoint with IP-based access policy
- Easier for development and testing
- Less secure

## Creating the Domain

### Option 1: AWS Console

1. Go to Amazon OpenSearch Service
2. Click "Create domain"
3. Configure:

**Step 1: Domain settings**
- Domain name: `makeriess-products`
- Deployment type: Production
- Version: OpenSearch 2.11

**Step 2: Data nodes**
- Instance type: t3.medium.search
- Number of nodes: 3
- Storage: 100GB EBS gp3 per node

**Step 3: Network**
- VPC access (recommended)
- Select VPC and 3 subnets
- Security group: Allow HTTPS (443) from Lambda security group

**Step 4: Security**
- Enable fine-grained access control
- Create master user or use IAM
- Enable encryption at rest
- Enable node-to-node encryption
- Require HTTPS

**Step 5: Access policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole"
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:ACCOUNT_ID:domain/makeriess-products/*"
    }
  ]
}
```

4. Click "Create"
5. Wait 15-30 minutes for domain creation

### Option 2: AWS CLI

```bash
aws opensearch create-domain \
  --domain-name makeriess-products \
  --engine-version OpenSearch_2.11 \
  --cluster-config \
    InstanceType=t3.medium.search,\
    InstanceCount=3,\
    DedicatedMasterEnabled=false,\
    ZoneAwarenessEnabled=true,\
    ZoneAwarenessConfig={AvailabilityZoneCount=3} \
  --ebs-options \
    EBSEnabled=true,\
    VolumeType=gp3,\
    VolumeSize=100,\
    Iops=3000,\
    Throughput=125 \
  --encryption-at-rest-options Enabled=true \
  --node-to-node-encryption-options Enabled=true \
  --domain-endpoint-options \
    EnforceHTTPS=true,\
    TLSSecurityPolicy=Policy-Min-TLS-1-2-2019-07 \
  --advanced-security-options \
    Enabled=true,\
    InternalUserDatabaseEnabled=false,\
    MasterUserOptions={MasterUserARN=arn:aws:iam::ACCOUNT_ID:role/OpenSearchMasterRole} \
  --access-policies file://access-policy.json
```

### Option 3: CloudFormation

```yaml
Resources:
  OpenSearchDomain:
    Type: AWS::OpenSearchService::Domain
    Properties:
      DomainName: makeriess-products
      EngineVersion: OpenSearch_2.11
      ClusterConfig:
        InstanceType: t3.medium.search
        InstanceCount: 3
        DedicatedMasterEnabled: false
        ZoneAwarenessEnabled: true
        ZoneAwarenessConfig:
          AvailabilityZoneCount: 3
      EBSOptions:
        EBSEnabled: true
        VolumeType: gp3
        VolumeSize: 100
        Iops: 3000
        Throughput: 125
      EncryptionAtRestOptions:
        Enabled: true
      NodeToNodeEncryptionOptions:
        Enabled: true
      DomainEndpointOptions:
        EnforceHTTPS: true
        TLSSecurityPolicy: Policy-Min-TLS-1-2-2019-07
      AdvancedSecurityOptions:
        Enabled: true
        InternalUserDatabaseEnabled: false
        MasterUserOptions:
          MasterUserARN: !GetAtt OpenSearchMasterRole.Arn
      AccessPolicies:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !GetAtt LambdaExecutionRole.Arn
            Action: 'es:*'
            Resource: !Sub '${OpenSearchDomain.Arn}/*'
```

## Create Product Index

After domain is active, create the index:

```bash
# Get the domain endpoint
OPENSEARCH_ENDPOINT=$(aws opensearch describe-domain \
  --domain-name makeriess-products \
  --query 'DomainStatus.Endpoint' \
  --output text)

# Create index with mapping
curl -X PUT "https://${OPENSEARCH_ENDPOINT}/products" \
  -H 'Content-Type: application/json' \
  -d @product-index-mapping.json
```

**product-index-mapping.json**:
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "1s",
    "analysis": {
      "analyzer": {
        "product_name_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "edge_ngram_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "edge_ngram_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "productId": { "type": "keyword" },
      "vendorId": { "type": "keyword" },
      "vendorName": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "name": {
        "type": "text",
        "analyzer": "product_name_analyzer",
        "fields": {
          "autocomplete": { "type": "text", "analyzer": "autocomplete_analyzer" },
          "keyword": { "type": "keyword" }
        }
      },
      "description": { "type": "text" },
      "category": { "type": "keyword" },
      "dietaryTags": { "type": "keyword" },
      "price": { "type": "float" },
      "location": { "type": "geo_point" },
      "isAvailable": { "type": "boolean" },
      "isVisible": { "type": "boolean" },
      "badges": { "type": "keyword" },
      "trendScore": { "type": "float" },
      "rating": { "type": "float" },
      "reviewCount": { "type": "integer" },
      "orderCount": { "type": "integer" },
      "viewCount": { "type": "integer" },
      "favoriteCount": { "type": "integer" },
      "images": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

## Index Sample Data

```bash
# Index a product
curl -X POST "https://${OPENSEARCH_ENDPOINT}/products/_doc" \
  -H 'Content-Type: application/json' \
  -d '{
    "productId": "prod_123",
    "vendorId": "vend_456",
    "vendorName": "Local Bakery",
    "name": "Sourdough Bread",
    "description": "Artisan sourdough made with organic flour",
    "category": "Food & pastries",
    "dietaryTags": ["vegan", "organic"],
    "price": 8.50,
    "location": { "lat": 40.7128, "lon": -74.0060 },
    "isAvailable": true,
    "isVisible": true,
    "badges": ["trending", "new"],
    "trendScore": 0.85,
    "rating": 4.8,
    "reviewCount": 24,
    "images": ["https://example.com/bread.jpg"],
    "createdAt": "2025-11-06T10:00:00Z",
    "updatedAt": "2025-11-06T10:00:00Z"
  }'
```

## Example Search Queries

### Full-Text Search with Filters

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "sourdough bread",
            "fields": ["name^3", "description"],
            "type": "best_fields",
            "fuzziness": "AUTO"
          }
        },
        { "term": { "isAvailable": true } },
        { "term": { "isVisible": true } }
      ],
      "filter": [
        { "terms": { "dietaryTags": ["vegan"] } },
        { "range": { "price": { "gte": 5, "lte": 20 } } },
        {
          "geo_distance": {
            "distance": "5mi",
            "location": { "lat": 40.7128, "lon": -74.0060 }
          }
        }
      ]
    }
  },
  "sort": [
    { "trendScore": { "order": "desc" } },
    { "_score": { "order": "desc" } }
  ],
  "size": 20
}
```

### Autocomplete

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name.autocomplete": {
              "query": "sour",
              "operator": "and"
            }
          }
        },
        { "term": { "isVisible": true } }
      ]
    }
  },
  "size": 10,
  "_source": ["productId", "name", "vendorName"]
}
```

### Geospatial Search (Nearby Products)

```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "isAvailable": true } },
        { "term": { "isVisible": true } }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "10mi",
            "location": { "lat": 40.7128, "lon": -74.0060 }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "_geo_distance": {
        "location": { "lat": 40.7128, "lon": -74.0060 },
        "order": "asc",
        "unit": "mi"
      }
    }
  ]
}
```

### Category Facets

```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "isAvailable": true } },
        { "term": { "isVisible": true } }
      ]
    }
  },
  "aggs": {
    "categories": {
      "terms": { "field": "category", "size": 10 }
    },
    "dietary_tags": {
      "terms": { "field": "dietaryTags", "size": 20 }
    },
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 10 },
          { "from": 10, "to": 25 },
          { "from": 25, "to": 50 },
          { "from": 50 }
        ]
      }
    }
  },
  "size": 0
}
```

## Lambda Integration

### Install OpenSearch Client

```bash
npm install @opensearch-project/opensearch
```

### Lambda Function Example

```typescript
import { Client } from '@opensearch-project/opensearch';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

const client = new Client({
  ...AwsSigv4Signer({
    region: 'us-east-1',
    service: 'es',
    getCredentials: () => {
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: process.env.OPENSEARCH_ENDPOINT,
});

export async function searchProducts(query: string, location: { lat: number; lon: number }) {
  const result = await client.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^3', 'description'],
                fuzziness: 'AUTO',
              },
            },
            { term: { isAvailable: true } },
            { term: { isVisible: true } },
          ],
          filter: [
            {
              geo_distance: {
                distance: '10mi',
                location,
              },
            },
          ],
        },
      },
      sort: [
        { trendScore: { order: 'desc' } },
        { _score: { order: 'desc' } },
      ],
      size: 20,
    },
  });

  return result.body.hits.hits.map((hit: any) => hit._source);
}
```

## Monitoring

### CloudWatch Metrics

Monitor these key metrics:
- ClusterStatus.green
- SearchableDocuments
- SearchRate
- IndexingRate
- CPUUtilization
- JVMMemoryPressure
- FreeStorageSpace

### Set Up Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name opensearch-cluster-red \
  --alarm-description "OpenSearch cluster status is red" \
  --metric-name ClusterStatus.red \
  --namespace AWS/ES \
  --statistic Maximum \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=DomainName,Value=makeriess-products \
  --evaluation-periods 1
```

## Cost Estimation

**Monthly Cost** (3 x t3.medium.search):
- Instance hours: 3 × $0.073/hr × 730 hrs = $160
- Storage: 300GB × $0.135/GB = $41
- Data transfer: ~$10
- **Total: ~$211/month**

**Cost Optimization**:
- Use t3.small.search for development ($80/month)
- Reduce to 1 node for dev/staging
- Use Reserved Instances for production (30-40% savings)

## Best Practices

1. **Index Design**
   - Use appropriate field types
   - Disable indexing for fields you don't search
   - Use keyword type for exact matches

2. **Query Optimization**
   - Use filters instead of queries when possible
   - Implement pagination with search_after
   - Cache frequent queries

3. **Monitoring**
   - Set up CloudWatch alarms
   - Monitor JVM memory pressure
   - Track slow queries

4. **Security**
   - Use VPC deployment for production
   - Enable fine-grained access control
   - Rotate credentials regularly

5. **Backup**
   - Enable automated snapshots
   - Test restore procedures
   - Keep snapshots for 30 days

## Troubleshooting

### Cluster is Yellow/Red
- Check node health
- Verify sufficient storage
- Review JVM memory pressure

### Slow Queries
- Analyze slow query logs
- Add appropriate filters
- Optimize index mappings

### High Memory Usage
- Reduce shard count
- Optimize field data cache
- Increase instance size

## Next Steps

After OpenSearch setup:
- Implement product sync Lambda
- Set up DynamoDB Streams to OpenSearch pipeline
- Create search API endpoints
- Implement autocomplete UI
