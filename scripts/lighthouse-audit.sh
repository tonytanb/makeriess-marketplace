#!/bin/bash

# Lighthouse Performance Audit Script
# Runs Lighthouse audits on key pages and generates reports

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Lighthouse Performance Audit${NC}"

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${YELLOW}Lighthouse not found. Installing...${NC}"
    npm install -g lighthouse
fi

# Create reports directory
REPORTS_DIR="lighthouse-reports"
mkdir -p $REPORTS_DIR

# Base URL (can be overridden with environment variable)
BASE_URL=${LIGHTHOUSE_URL:-"http://localhost:3000"}

echo -e "${GREEN}Auditing: $BASE_URL${NC}"

# Pages to audit
declare -a pages=(
    "/"
    "/product/sample-product-id"
    "/vendor/sample-vendor-id"
    "/cart"
    "/favorites"
    "/map"
)

# Run Lighthouse for each page
for page in "${pages[@]}"; do
    PAGE_NAME=$(echo $page | sed 's/\//-/g' | sed 's/^-//')
    if [ -z "$PAGE_NAME" ]; then
        PAGE_NAME="home"
    fi
    
    echo -e "${YELLOW}Auditing: $page${NC}"
    
    lighthouse "$BASE_URL$page" \
        --output=html \
        --output=json \
        --output-path="$REPORTS_DIR/$PAGE_NAME" \
        --chrome-flags="--headless --no-sandbox" \
        --only-categories=performance,accessibility,best-practices,seo \
        --quiet
    
    # Extract performance score
    SCORE=$(cat "$REPORTS_DIR/$PAGE_NAME.report.json" | grep -o '"performance":[0-9.]*' | grep -o '[0-9.]*')
    SCORE_INT=$(echo "$SCORE * 100" | bc | cut -d. -f1)
    
    if [ $SCORE_INT -ge 90 ]; then
        echo -e "${GREEN}✓ $page: Performance Score = $SCORE_INT/100${NC}"
    elif [ $SCORE_INT -ge 50 ]; then
        echo -e "${YELLOW}⚠ $page: Performance Score = $SCORE_INT/100${NC}"
    else
        echo -e "${RED}✗ $page: Performance Score = $SCORE_INT/100${NC}"
    fi
done

echo -e "${GREEN}Audit complete! Reports saved to $REPORTS_DIR/${NC}"
echo -e "${YELLOW}Open the HTML reports to see detailed recommendations${NC}"

# Generate summary
echo -e "\n${GREEN}=== Performance Summary ===${NC}"
for page in "${pages[@]}"; do
    PAGE_NAME=$(echo $page | sed 's/\//-/g' | sed 's/^-//')
    if [ -z "$PAGE_NAME" ]; then
        PAGE_NAME="home"
    fi
    
    if [ -f "$REPORTS_DIR/$PAGE_NAME.report.json" ]; then
        PERF=$(cat "$REPORTS_DIR/$PAGE_NAME.report.json" | grep -o '"performance":[0-9.]*' | grep -o '[0-9.]*' | awk '{printf "%.0f", $1*100}')
        ACC=$(cat "$REPORTS_DIR/$PAGE_NAME.report.json" | grep -o '"accessibility":[0-9.]*' | grep -o '[0-9.]*' | awk '{printf "%.0f", $1*100}')
        BP=$(cat "$REPORTS_DIR/$PAGE_NAME.report.json" | grep -o '"best-practices":[0-9.]*' | grep -o '[0-9.]*' | awk '{printf "%.0f", $1*100}')
        SEO=$(cat "$REPORTS_DIR/$PAGE_NAME.report.json" | grep -o '"seo":[0-9.]*' | grep -o '[0-9.]*' | awk '{printf "%.0f", $1*100}')
        
        echo -e "$page:"
        echo -e "  Performance: $PERF/100"
        echo -e "  Accessibility: $ACC/100"
        echo -e "  Best Practices: $BP/100"
        echo -e "  SEO: $SEO/100"
    fi
done
