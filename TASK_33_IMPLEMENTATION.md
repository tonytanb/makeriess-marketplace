# Task 33: CI/CD Pipeline Implementation

## Overview
Implemented a comprehensive CI/CD pipeline using GitHub Actions for the Makeriess Marketplace, including automated testing, security scanning, staging deployment, E2E testing, manual approval gates, and canary production deployment with automatic rollback capabilities.

## Implementation Details

### 1. GitHub Actions Workflows

#### Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
Complete deployment pipeline with the following jobs:

**Job 1: Test & Lint**
- Runs ESLint for code quality
- Performs TypeScript type checking
- Executes unit tests with coverage
- Builds Next.js application
- Caches build artifacts for faster subsequent runs

**Job 2: Security Scan**
- Runs npm audit for dependency vulnerabilities
- Executes Snyk security scanning
- Continues on error to not block deployments

**Job 3: Deploy to Staging**
- Triggers on push to `develop` branch
- Configures AWS credentials
- Deploys Amplify backend to staging
- Runs smoke tests
- Sends Slack notifications

**Job 4: E2E Tests (Staging)**
- Runs Playwright E2E tests against staging
- Tests critical user flows
- Uploads test results and artifacts
- Continues on error to allow manual review

**Job 5: Approve Production**
- Manual approval gate for production deployment
- Requires review of staging deployment and E2E results
- Uses GitHub environment protection rules

**Job 6: Deploy to Production (Canary)**
- Deploys to production with 10% traffic split
- Monitors CloudWatch metrics for 1 hour
- Checks error rates and latency
- Automatically promotes to 100% if metrics are healthy
- Automatically rolls back if error rate exceeds 5%
- Creates GitHub release on success

**Job 7: Post-Deployment Monitoring**
- Monitors CloudWatch metrics for 5 minutes
- Checks API Gateway 5xx errors
- Runs production smoke tests
- Verifies site accessibility

#### Pull Request Checks (`.github/workflows/pr-checks.yml`)
Validates pull requests before merging:

- **Validate PR**: Checks PR title format (conventional commits)
- **Test & Build**: Runs tests and builds application
- **Code Quality**: SonarCloud scan, checks for console.log and TODOs
- **Dependency Review**: Reviews new dependencies for security issues
- **Accessibility**: Runs accessibility checks
- **PR Comment**: Posts build summary as PR comment

#### Scheduled Tasks (`.github/workflows/scheduled-tasks.yml`)
Daily maintenance tasks:

- **Dependency Updates**: Checks for outdated packages
- **Security Audit**: Runs npm audit and creates issues
- **Cost Monitoring**: Checks AWS costs and alerts if threshold exceeded
- **Cleanup Artifacts**: Deletes artifacts older than 30 days
- **Backup Verification**: Verifies DynamoDB backups exist
- **Performance Check**: Runs Lighthouse CI against production

### 2. E2E Testing with Playwright

#### Configuration (`playwright.config.ts`)
- Configured for multiple browsers (Chrome, Firefox, Safari)
- Mobile device testing (Pixel 5, iPhone 12)
- Screenshot and video on failure
- Trace collection on retry
- HTML, JSON, and JUnit reporters

#### Test Suites
Created three comprehensive test suites:

**Homepage Tests (`e2e/homepage.spec.ts`)**
- Homepage loading
- Address selector visibility
- Category strip display
- Product grid rendering
- Navigation functionality
- Mobile responsiveness

**Product Discovery Tests (`e2e/product-discovery.spec.ts`)**
- Product search functionality
- Category filtering
- Product detail viewing
- Favorite functionality
- Product sorting

**Cart & Checkout Tests (`e2e/cart-checkout.spec.ts`)**
- Add to cart functionality
- Cart drawer opening
- Quantity updates
- Item removal
- Checkout navigation
- Vendor minimum warnings

### 3. Deployment Scripts

#### Deploy Script (`scripts/deploy.sh`)
Manual deployment script with:
- Environment validation (staging/production)
- Branch verification
- Prerequisite checks (AWS CLI, Amplify CLI)
- Uncommitted changes detection
- Automated testing (lint, type check)
- Build verification
- Production confirmation prompt
- Deployment verification
- Post-deployment instructions

#### Rollback Script (`scripts/rollback.sh`)
Emergency rollback script with:
- Deployment history fetching
- Interactive deployment selection
- Confirmation prompts
- Automated rollback execution
- Progress monitoring
- Verification checks
- Post-rollback instructions

### 4. Configuration Files

#### Size Limits (`.size-limit.json`)
Bundle size monitoring:
- Initial JS Bundle: < 200 KB
- Initial CSS: < 50 KB
- Total Initial Load: < 250 KB

#### SonarCloud (`sonar-project.properties`)
Code quality configuration:
- Project identification
- Source and test paths
- Exclusions (node_modules, build artifacts)
- Coverage report paths
- Quality gate enforcement

### 5. Documentation

#### CI/CD README (`.github/README.md`)
Comprehensive documentation covering:
- Workflow descriptions
- Required secrets and environment variables
- Environment configuration
- Branch strategy
- Deployment process
- Rollback procedures
- Monitoring and alerts
- E2E testing
- Performance budgets
- Troubleshooting guide
- Best practices
- Maintenance schedule

### 6. Package.json Updates

Added new scripts:
- `test:e2e`: Run Playwright tests
- `test:e2e:ui`: Run tests in UI mode
- `test:e2e:debug`: Debug tests
- `deploy:staging`: Deploy to staging
- `deploy:production`: Deploy to production
- `rollback:staging`: Rollback staging
- `rollback:production`: Rollback production
- `size`: Check bundle size
- `analyze`: Analyze bundle composition

## Key Features

### Canary Deployment
- Initial deployment with 10% traffic
- 1-hour monitoring period
- Automatic metric checking (error rates, latency)
- Automatic promotion if healthy
- Automatic rollback if unhealthy

### Automatic Rollback
Triggers on:
- Error rate > 5% during canary period
- Failed CloudWatch metric checks
- Manual trigger via rollback script

### Security
- Dependency vulnerability scanning (npm audit, Snyk)
- Code quality analysis (SonarCloud)
- Dependency review for new packages
- Daily security audits

### Monitoring
- CloudWatch metrics integration
- Error rate tracking
- Latency monitoring
- Cost monitoring
- Performance checks (Lighthouse)

### Quality Gates
- ESLint enforcement
- TypeScript type checking
- Bundle size limits
- Code quality thresholds
- E2E test execution

## Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/* (development)
```

**Workflow:**
1. Create feature branch from `develop`
2. Open PR to `develop` - triggers PR checks
3. Merge to `develop` - deploys to staging, runs E2E tests
4. Open PR from `develop` to `main`
5. Merge to `main` - requires approval, deploys to production with canary

## Required Setup

### GitHub Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AMPLIFY_APP_ID`
- `NEXT_PUBLIC_AMPLIFY_REGION`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `CODECOV_TOKEN` (optional)
- `SNYK_TOKEN` (optional)
- `SONAR_TOKEN` (optional)
- `SLACK_WEBHOOK` (optional)

### GitHub Environments
1. **staging** - Auto-deploy from develop
2. **production-approval** - Manual approval gate
3. **production** - Protected with required reviewers

### External Services (Optional)
- Codecov for coverage reports
- Snyk for security scanning
- SonarCloud for code quality
- Slack for notifications

## Usage

### Automated Deployment
Push to `develop` or `main` branches triggers automatic deployment.

### Manual Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Rollback
```bash
# Rollback staging
npm run rollback:staging

# Rollback production
npm run rollback:production
```

### E2E Tests
```bash
# Run all tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

### Bundle Analysis
```bash
# Check bundle size
npm run size

# Analyze bundle composition
npm run analyze
```

## Monitoring

### CloudWatch Metrics
- Lambda error rates
- API Gateway 5xx errors
- DynamoDB throttling
- Order completion rate

### Alerts
- Critical errors: Immediate Slack notification
- High costs: Daily check with threshold alert
- Security vulnerabilities: Issue created automatically

## Performance Budgets

- **Lighthouse Score:** 90+ (mobile)
- **Bundle Size:** < 200KB initial JS
- **API Latency (p99):** < 3s
- **Error Rate:** < 5%

## Best Practices

1. Always test locally before pushing
2. Write meaningful commit messages (conventional commits)
3. Keep PRs small (< 1000 lines changed)
4. Add tests for new features
5. Monitor deployments in Slack
6. Review canary metrics before promoting
7. Document breaking changes in PR description

## Maintenance

### Weekly
- Review failed builds and fix flaky tests
- Check dependency updates
- Review security audit results

### Monthly
- Review AWS costs and optimize
- Update dependencies (minor versions)
- Review and update E2E tests
- Check performance metrics

### Quarterly
- Major dependency updates
- Review and update CI/CD pipeline
- Performance optimization
- Security audit

## Files Created

1. `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
2. `.github/workflows/pr-checks.yml` - Pull request validation
3. `.github/workflows/scheduled-tasks.yml` - Scheduled maintenance
4. `.github/README.md` - CI/CD documentation
5. `playwright.config.ts` - Playwright configuration
6. `e2e/homepage.spec.ts` - Homepage E2E tests
7. `e2e/product-discovery.spec.ts` - Product discovery E2E tests
8. `e2e/cart-checkout.spec.ts` - Cart and checkout E2E tests
9. `scripts/deploy.sh` - Manual deployment script
10. `scripts/rollback.sh` - Rollback script
11. `.size-limit.json` - Bundle size configuration
12. `sonar-project.properties` - SonarCloud configuration
13. `TASK_33_IMPLEMENTATION.md` - This document

## Requirements Satisfied

✅ **16.1** - Continuous deployment from main branch with AWS Amplify
✅ **16.2** - Zero-downtime deployments with automatic rollback on failure
✅ Created GitHub Actions workflow for automated testing
✅ Added build and deploy steps for Amplify
✅ Configured E2E tests to run on staging deployment
✅ Set up manual approval gate for production deployment
✅ Implemented canary deployment with 10% traffic for 1 hour

## Next Steps

1. Configure GitHub secrets in repository settings
2. Set up GitHub environments with protection rules
3. Configure external services (Codecov, Snyk, SonarCloud, Slack)
4. Test the pipeline with a feature branch
5. Monitor first production deployment closely
6. Adjust canary period and thresholds based on traffic patterns
7. Add more E2E tests for critical user flows
8. Set up additional CloudWatch alarms
9. Configure cost alerts in AWS
10. Document incident response procedures

## Notes

- The pipeline is designed to be fail-safe with automatic rollbacks
- Canary deployment ensures production stability
- Manual approval gate prevents accidental production deployments
- E2E tests catch integration issues before production
- Scheduled tasks maintain system health
- Scripts provide manual control when needed
- Documentation ensures team can maintain and troubleshoot the pipeline
