#!/bin/bash

# Deployment script for Makeriess Marketplace
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
BRANCH=""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Makeriess Marketplace Deployment ===${NC}"
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

# Check if Amplify CLI is installed
if ! command -v ampx &> /dev/null; then
    echo -e "${RED}Error: Amplify CLI is not installed${NC}"
    echo "Install with: npm install -g @aws-amplify/backend-cli"
    exit 1
fi

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${RED}Error: You must be on the '$BRANCH' branch to deploy to $ENVIRONMENT${NC}"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: You have uncommitted changes${NC}"
    git status --short
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Running tests...${NC}"

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Linting failed${NC}"
    exit 1
fi

# Run type check
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Type checking failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Building application...${NC}"

# Build Next.js application
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Production deployment requires confirmation
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}WARNING: You are about to deploy to PRODUCTION${NC}"
    echo -e "This will affect live users."
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
fi

echo -e "${YELLOW}Step 4: Deploying to $ENVIRONMENT...${NC}"

# Deploy Amplify backend
npx ampx pipeline-deploy --branch $BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment successful${NC}"
echo ""

echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"

# Wait for deployment to propagate
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
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "URL: ${YELLOW}$URL${NC}"
echo -e "Branch: ${YELLOW}$BRANCH${NC}"
echo -e "Commit: ${YELLOW}$(git rev-parse --short HEAD)${NC}"
echo ""

# Show next steps
if [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test the staging deployment"
    echo "2. Run E2E tests: npx playwright test"
    echo "3. If all looks good, merge to main for production deployment"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Monitor CloudWatch metrics"
    echo "2. Check error rates and latency"
    echo "3. Verify critical user flows"
    echo "4. Monitor Slack for alerts"
fi

echo ""
