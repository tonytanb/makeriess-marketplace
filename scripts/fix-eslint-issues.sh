#!/bin/bash

# Script to systematically fix ESLint issues
# Usage: ./scripts/fix-eslint-issues.sh [phase]

set -e

PHASE=${1:-"all"}

echo "🔧 ESLint Issue Fixer"
echo "===================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Phase 1: Auto-fix what we can
phase1() {
    echo "Phase 1: Running ESLint auto-fix..."
    echo "-----------------------------------"
    
    # Run ESLint with --fix flag
    if npm run lint -- --fix; then
        print_status "Auto-fix completed successfully"
    else
        print_warning "Some issues couldn't be auto-fixed"
    fi
    
    echo ""
}

# Phase 2: Generate detailed report
phase2() {
    echo "Phase 2: Generating detailed error report..."
    echo "--------------------------------------------"
    
    # Generate full report
    npm run lint > eslint-report.txt 2>&1 || true
    
    # Count errors by type
    echo ""
    echo "Error Summary:"
    echo "-------------"
    grep -o "@typescript-eslint/no-unused-vars" eslint-report.txt | wc -l | xargs echo "Unused variables:"
    grep -o "react-hooks/rules-of-hooks" eslint-report.txt | wc -l | xargs echo "React Hooks violations:"
    grep -o "react/no-unescaped-entities" eslint-report.txt | wc -l | xargs echo "Unescaped characters:"
    grep -o "@next/next/no-img-element" eslint-report.txt | wc -l | xargs echo "Image optimization:"
    
    print_status "Report saved to eslint-report.txt"
    echo ""
}

# Phase 3: Check specific file types
phase3() {
    echo "Phase 3: Checking critical files..."
    echo "-----------------------------------"
    
    # Check files with React Hooks issues (most critical)
    echo "Checking React Hooks violations..."
    npx eslint "src/app/product/[id]/page.tsx" "src/app/vendor/[id]/page.tsx" || true
    
    echo ""
}

# Phase 4: Verify fixes
phase4() {
    echo "Phase 4: Verifying all fixes..."
    echo "-------------------------------"
    
    if npm run lint; then
        print_status "All ESLint issues resolved! 🎉"
        echo ""
        echo "Next steps:"
        echo "1. Update .github/workflows/ci-cd.yml to set continue-on-error: false"
        echo "2. Reduce max-warnings back to 0"
        echo "3. Commit changes"
    else
        print_error "Still have ESLint issues to fix"
        echo ""
        echo "Run: npm run lint -- --fix"
        echo "Then manually fix remaining issues"
    fi
    
    echo ""
}

# Main execution
case $PHASE in
    "1"|"phase1")
        phase1
        ;;
    "2"|"phase2")
        phase2
        ;;
    "3"|"phase3")
        phase3
        ;;
    "4"|"phase4")
        phase4
        ;;
    "all")
        phase1
        phase2
        phase3
        phase4
        ;;
    *)
        echo "Usage: $0 [1|2|3|4|all]"
        echo ""
        echo "Phases:"
        echo "  1 - Run auto-fix"
        echo "  2 - Generate report"
        echo "  3 - Check critical files"
        echo "  4 - Verify all fixes"
        echo "  all - Run all phases"
        exit 1
        ;;
esac

echo "Done!"
