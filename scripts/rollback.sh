#!/bin/bash

# Rollback script for Makeriess Marketplace
# Usage: ./scripts/rollback.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}=== Makeriess Marketplace Rollback ===${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Set branch based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    BRANCH="develop"
elif [ "$ENVIRONMENT" = "production" ]; then
    BRANCH="main"
fi

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if AMPLIFY_APP_ID is set
if [ -z "$AMPLIFY_APP_ID" ]; then
    echo -e "${RED}Error: AMPLIFY_APP_ID environment variable is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Fetching deployment history...${NC}"

# Get recent successful deployments
DEPLOYMENTS=$(aws amplify list-jobs \
    --app-id $AMPLIFY_APP_ID \
    --branch-name $BRANCH \
    --max-results 10 \
    --query 'jobSummaries[?summary.status==`SUCCEED`].[summary.jobId,summary.commitId,summary.commitTime]' \
    --output text)

if [ -z "$DEPLOYMENTS" ]; then
    echo -e "${RED}Error: No successful deployments found${NC}"
    exit 1
fi

echo -e "${GREEN}Recent successful deployments:${NC}"
echo ""
echo "$DEPLOYMENTS" | nl
echo ""

# Get current deployment
CURRENT_JOB=$(aws amplify list-jobs \
    --app-id $AMPLIFY_APP_ID \
    --branch-name $BRANCH \
    --max-results 1 \
    --query 'jobSummaries[0].summary.jobId' \
    --output text)

echo -e "Current deployment: ${YELLOW}$CURRENT_JOB${NC}"
echo ""

# Prompt for deployment to rollback to
read -p "Enter the number of the deployment to rollback to (or 'q' to quit): " SELECTION

if [ "$SELECTION" = "q" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

# Get the selected job ID
ROLLBACK_JOB=$(echo "$DEPLOYMENTS" | sed -n "${SELECTION}p" | awk '{print $1}')

if [ -z "$ROLLBACK_JOB" ]; then
    echo -e "${RED}Error: Invalid selection${NC}"
    exit 1
fi

echo ""
echo -e "${RED}WARNING: You are about to rollback $ENVIRONMENT${NC}"
echo -e "From: ${YELLOW}$CURRENT_JOB${NC}"
echo -e "To: ${YELLOW}$ROLLBACK_JOB${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Step 3: Initiating rollback...${NC}"

# Start rollback job
aws amplify start-job \
    --app-id $AMPLIFY_APP_ID \
    --branch-name $BRANCH \
    --job-type RELEASE \
    --job-id $ROLLBACK_JOB

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Rollback failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Rollback initiated${NC}"
echo ""

echo -e "${YELLOW}Step 4: Monitoring rollback progress...${NC}"

# Wait for rollback to complete
MAX_WAIT=600  # 10 minutes
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS=$(aws amplify get-job \
        --app-id $AMPLIFY_APP_ID \
        --branch-name $BRANCH \
        --job-id $ROLLBACK_JOB \
        --query 'job.summary.status' \
        --output text)
    
    if [ "$STATUS" = "SUCCEED" ]; then
        echo -e "${GREEN}✓ Rollback completed successfully${NC}"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo -e "${RED}Error: Rollback failed${NC}"
        exit 1
    fi
    
    echo "Status: $STATUS (waiting...)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${RED}Error: Rollback timed out${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Verifying rollback...${NC}"

# Wait for changes to propagate
sleep 30

# Check if site is accessible
if [ "$ENVIRONMENT" = "staging" ]; then
    URL="https://staging.makeriess.com"
elif [ "$ENVIRONMENT" = "production" ]; then
    URL="https://makeriess.com"
fi

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Site is accessible at $URL${NC}"
else
    echo -e "${RED}Warning: Site returned HTTP $HTTP_STATUS${NC}"
fi

echo ""
echo -e "${GREEN}=== Rollback Complete ===${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Rolled back to: ${YELLOW}$ROLLBACK_JOB${NC}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify the application is working correctly"
echo "2. Check CloudWatch logs for errors"
echo "3. Monitor user reports"
echo "4. Investigate the root cause of the issue"
echo "5. Fix the issue and redeploy"
echo ""
