# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for the Makeriess Marketplace CI/CD pipeline.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

Main deployment pipeline that handles testing, building, and deploying to staging and production.

**Triggers:**
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Test & Lint** - Runs ESLint, TypeScript checks, unit tests, and builds the application
2. **Security Scan** - Runs npm audit and Snyk security scanning
3. **Deploy to Staging** - Deploys to staging environment (develop branch only)
4. **E2E Tests (Staging)** - Runs Playwright E2E tests against staging
5. **Approve Production** - Manual approval gate for production deployment
6. **Deploy to Production** - Canary deployment with 10% traffic for 1 hour
7. **Post-Deployment Monitoring** - Monitors CloudWatch metrics after deployment

**Canary Deployment:**
- Initial deployment with 10% traffic
- Monitors error rates and latency for 1 hour
- Automatically promotes to 100% if metrics are healthy
- Automatically rolls back if error rate exceeds 5%

### 2. Pull Request Checks (`pr-checks.yml`)

Validates pull requests before merging.

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**
1. **Validate PR** - Checks PR title format (conventional commits)
2. **Test & Build** - Runs tests and builds the application
3. **Code Quality** - SonarCloud scan, checks for console.log and TODOs
4. **Dependency Review** - Reviews new dependencies for security issues
5. **Accessibility** - Runs accessibility checks
6. **PR Comment** - Posts build summary as PR comment

### 3. Scheduled Tasks (`scheduled-tasks.yml`)

Runs maintenance tasks daily.

**Triggers:**
- Scheduled: Daily at 2 AM UTC
- Manual: Can be triggered via workflow_dispatch

**Jobs:**
1. **Dependency Updates** - Checks for outdated packages
2. **Security Audit** - Runs npm audit and creates issues for vulnerabilities
3. **Cost Monitoring** - Checks AWS costs and alerts if threshold exceeded
4. **Cleanup Artifacts** - Deletes artifacts older than 30 days
5. **Backup Verification** - Verifies DynamoDB backups exist
6. **Performance Check** - Runs Lighthouse CI against production

## Required Secrets

Configure these secrets in your GitHub repository settings:

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AMPLIFY_APP_ID` - AWS Amplify application ID

### Environment Variables
- `NEXT_PUBLIC_AMPLIFY_REGION` - Public Amplify region for frontend

### External Services
- `CODECOV_TOKEN` - Codecov token for coverage reports (optional)
- `SNYK_TOKEN` - Snyk token for security scanning (optional)
- `SONAR_TOKEN` - SonarCloud token for code quality (optional)
- `SLACK_WEBHOOK` - Slack webhook URL for notifications (optional)

### Test Credentials
- `TEST_USER_EMAIL` - Test user email for E2E tests
- `TEST_USER_PASSWORD` - Test user password for E2E tests

## Environments

Configure these environments in GitHub repository settings:

### 1. Staging
- **URL:** https://staging.makeriess.com
- **Branch:** develop
- **Protection:** None (auto-deploy)

### 2. Production Approval
- **Protection:** Required reviewers (1+)
- **Purpose:** Manual approval gate before production

### 3. Production
- **URL:** https://makeriess.com
- **Branch:** main
- **Protection:** Required reviewers (1+)

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

## Deployment Process

### Staging Deployment
1. Push to `develop` branch
2. CI/CD pipeline runs tests
3. Automatic deployment to staging
4. E2E tests run against staging
5. Slack notification sent

### Production Deployment
1. Push to `main` branch
2. CI/CD pipeline runs tests
3. Manual approval required
4. Canary deployment (10% traffic)
5. Monitor for 1 hour
6. Automatic promotion or rollback
7. Post-deployment monitoring
8. GitHub release created

## Rollback Procedure

### Automatic Rollback
The pipeline automatically rolls back if:
- Error rate exceeds 5% during canary period
- Critical CloudWatch alarms trigger

### Manual Rollback
1. Go to GitHub Actions
2. Find the last successful production deployment
3. Re-run the deployment job
4. Or use AWS Amplify console to redeploy previous version

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

## E2E Tests

E2E tests are written with Playwright and run against staging before production deployment.

**Test Suites:**
- Homepage functionality
- Product discovery and search
- Cart and checkout flow
- Authentication flows
- Vendor portal

**Running Locally:**
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test e2e/homepage.spec.ts
```

## Performance Budgets

The pipeline enforces these performance budgets:

- **Lighthouse Score:** 90+ (mobile)
- **Bundle Size:** < 200KB initial JS
- **API Latency (p99):** < 3s
- **Error Rate:** < 5%

## Troubleshooting

### Build Failures
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Check AWS Amplify console for backend errors
4. Review CloudWatch logs

### Deployment Failures
1. Check Amplify deployment logs
2. Verify IAM permissions
3. Check for resource limits (Lambda concurrency, DynamoDB capacity)
4. Review recent code changes

### E2E Test Failures
1. Check Playwright test results artifact
2. Review screenshots and videos
3. Verify staging environment is healthy
4. Check for timing issues or flaky tests

## Best Practices

1. **Always test locally** before pushing
2. **Write meaningful commit messages** (conventional commits)
3. **Keep PRs small** (< 1000 lines changed)
4. **Add tests** for new features
5. **Monitor deployments** in Slack
6. **Review canary metrics** before promoting
7. **Document breaking changes** in PR description

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

## Support

For issues with the CI/CD pipeline:
1. Check this documentation
2. Review GitHub Actions logs
3. Check AWS Amplify console
4. Contact DevOps team

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Amplify CI/CD](https://docs.amplify.aws/guides/hosting/git-based-deployments/)
- [Playwright Documentation](https://playwright.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)
