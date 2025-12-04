# Route 53 and Domain Setup Guide

This guide walks through setting up the domain and DNS configuration for Makeriess.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name decided (makeriess.com)

## Step 1: Register Domain

### Option A: Via AWS Console

1. Navigate to Route 53 > Registered domains
2. Click "Register domain"
3. Search for "makeriess.com"
4. Add to cart and proceed to checkout
5. Fill in registrant contact information
6. Enable privacy protection
7. Enable auto-renewal
8. Complete purchase

### Option B: Via AWS CLI

```bash
aws route53domains register-domain \
  --domain-name makeriess.com \
  --duration-in-years 1 \
  --auto-renew \
  --admin-contact file://contact.json \
  --registrant-contact file://contact.json \
  --tech-contact file://contact.json \
  --privacy-protect-admin-contact \
  --privacy-protect-registrant-contact \
  --privacy-protect-tech-contact
```

## Step 2: Verify Hosted Zone

After domain registration, a hosted zone is automatically created.

```bash
# List hosted zones
aws route53 list-hosted-zones

# Get the hosted zone ID for makeriess.com
aws route53 list-hosted-zones --query "HostedZones[?Name=='makeriess.com.'].Id" --output text
```

Save the Hosted Zone ID - you'll need it later.

## Step 3: Request SSL Certificate

Request a wildcard certificate for *.makeriess.com:

```bash
aws acm request-certificate \
  --domain-name makeriess.com \
  --subject-alternative-names "*.makeriess.com" \
  --validation-method DNS \
  --region us-east-1
```

**Important**: Certificate must be in us-east-1 region for CloudFront.

Save the Certificate ARN from the output.

## Step 4: Validate Certificate

1. Get validation records:

```bash
aws acm describe-certificate \
  --certificate-arn YOUR_CERTIFICATE_ARN \
  --region us-east-1
```

2. Add CNAME records to Route 53:

```bash
# Create change batch JSON file
cat > change-batch.json <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "_VALIDATION_NAME_FROM_ACM",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{
        "Value": "_VALIDATION_VALUE_FROM_ACM"
      }]
    }
  }]
}
EOF

# Apply changes
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://change-batch.json
```

3. Wait for validation (5-30 minutes):

```bash
aws acm describe-certificate \
  --certificate-arn YOUR_CERTIFICATE_ARN \
  --region us-east-1 \
  --query "Certificate.Status"
```

Status should change to "ISSUED".

## Step 5: Configure Amplify Custom Domain

After deploying your Amplify app:

1. Go to Amplify Console
2. Select your app
3. Go to "Domain management"
4. Click "Add domain"
5. Enter "makeriess.com"
6. Select the ACM certificate
7. Add subdomains:
   - makeriess.com (root)
   - www.makeriess.com

Amplify will automatically:
- Create CloudFront distribution
- Configure DNS records
- Set up SSL/TLS

## Step 6: Create Additional DNS Records

For AppSync API endpoint:

```bash
# Get AppSync endpoint from Amplify outputs
APPSYNC_ENDPOINT=$(cat amplify_outputs.json | jq -r '.data.url')

# Create A record (ALIAS) for api.makeriess.com
# This will be done after AppSync is deployed
```

## Step 7: Update Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_DOMAIN=makeriess.com
HOSTED_ZONE_ID=Z1234567890ABC
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
```

## Verification

Test DNS resolution:

```bash
# Check domain resolves
dig makeriess.com

# Check SSL certificate
curl -I https://makeriess.com

# Check www subdomain
curl -I https://www.makeriess.com
```

## Cost Estimate

- Domain registration: ~$12/year
- Hosted zone: $0.50/month
- DNS queries: $0.40 per million queries
- ACM certificate: Free
- CloudFront: Pay as you go (included with Amplify)

## Troubleshooting

### Certificate validation stuck

- Verify CNAME records are correct
- Check DNS propagation: `dig _validation_name`
- Wait up to 72 hours for DNS propagation

### Domain not resolving

- Check nameservers match Route 53 hosted zone
- Verify A/CNAME records are created
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### SSL errors

- Ensure certificate is in us-east-1
- Verify certificate includes both root and wildcard
- Check certificate is attached to CloudFront distribution

## Next Steps

After completing Route 53 setup:
- Task 1.3: Set up DynamoDB tables
- Task 1.4: Initialize OpenSearch domain
