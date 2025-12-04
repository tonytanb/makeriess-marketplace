# CI/CD Pipeline Setup Checklist

Use this checklist to set up the CI/CD pipeline for the first time.

## Prerequisites

- [ ] GitHub repository created
- [ ] AWS account with appropriate permissions
- [ ] AWS Amplify application created
- [ ] Domain registered (makeriess.com)

## GitHub Configuration

### 1. Repository Settings

- [ ] Enable GitHub Actions in repository settings
- [ ] Set branch protection rules for `main` and `develop`
- [ ] Require pull request reviews before merging to `main`
- [ ] Require status checks to pass before merging

### 2. GitHub Secrets

Navigate to Settings → Secrets and variables → Actions → New repository secret

**Required Secrets:**
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- [ ] `AWS_REGION` - AWS region (e.g., us-east-1)
- [ ] `AMPLIFY_APP_ID` - AWS Amplify application ID
- [ ] `NEXT_PUBLIC_AMPLIFY_REGION` - Public Amplify region

**Test Credentials:**
- [ ] `TEST_USER_EMAIL` - Test user email for E2E tests
- [ ] `TEST_USER_PASSWORD` - Test user password for E2E tests

**Optional Secrets (for enhanced features):**
- [ ] `CODECOV_TOKEN` - Codecov token for coverage reports
- [ ] `SNYK_TOKEN` - Snyk token for security scanning
- [ ] `SONAR_TOKEN` - SonarCloud token for code quality
- [ ] `SLACK_WEBHOOK` - Slack webhook URL for notifications

### 3. GitHub Environments

Navigate to Settings → Environments → New environment

**Staging Environment:**
- [ ] Create environment named `staging`
- [ ] Set environment URL: `https://staging.makeriess.com`
- [ ] No protection rules needed (auto-deploy)

**Production Approval Environment:**
- [ ] Create environment named `production-approval`
- [ ] Add required reviewers (at least 1 team member)
- [ ] Set wait timer: 0 minutes

**Production Environment:**
- [ ] Create environment named `production`
- [ ] Set environment URL: `https://makeriess.com`
- [ ] Add required reviewers (at least 1 team member)
- [ ] Set wait timer: 0 minutes
- [ ] Add deployment branch rule: `main` only

### 4. Branch Protection Rules

**Main Branch:**
- [ ] Navigate to Settings → Branches → Add rule
- [ ] Branch name pattern: `main`
- [ ] Require pull request reviews before merging (1 approval)
- [ ] Require status checks to pass before merging
- [ ] Require branches to be up to date before merging
- [ ] Include administrators in restrictions
- [ ] Do not allow force pushes
- [ ] Do not allow deletions

**Develop Branch:**
- [ ] Navigate to Settings → Branches → Add rule
- [ ] Branch name pattern: `develop`
- [ ] Require pull request reviews before merging (1 approval)
- [ ] Require status checks to pass before merging
- [ ] Do not allow force pushes
- [ ] Do not allow deletions

## AWS Configuration

### 1. IAM User for GitHub Actions

- [ ] Create IAM user: `github-actions-deploy`
- [ ] Attach policies:
  - [ ] `AdministratorAccess-Amplify`
  - [ ] `CloudWatchFullAccess`
  - [ ] `AmazonS3FullAccess`
  - [ ] Custom policy for cost monitoring
- [ ] Generate access key
- [ ] Save access key ID and secret access key to GitHub secrets

### 2. AWS Amplify

- [ ] Verify Amplify app is created
- [ ] Note the App ID (found in Amplify console)
- [ ] Configure custom domain: `makeriess.com`
- [ ] Configure subdomain: `staging.makeriess.com`
- [ ] Set up SSL certificates via ACM

### 3. CloudWatch Alarms

- [ ] Create alarm for Lambda errors (threshold: 5%)
- [ ] Create alarm for API Gateway 5xx errors
- [ ] Create alarm for DynamoDB throttling
- [ ] Configure SNS topic for alarm notifications
- [ ] Subscribe email/Slack to SNS topic

### 4. Cost Monitoring

- [ ] Enable AWS Cost Explorer
- [ ] Set up budget alerts (threshold: $500/month)
- [ ] Configure billing alerts

## External Services (Optional)

### 1. Codecov

- [ ] Sign up at codecov.io
- [ ] Add repository
- [ ] Copy token to GitHub secrets
- [ ] Configure codecov.yml if needed

### 2. Snyk

- [ ] Sign up at snyk.io
- [ ] Add repository
- [ ] Copy token to GitHub secrets
- [ ] Configure Snyk settings

### 3. SonarCloud

- [ ] Sign up at sonarcloud.io
- [ ] Create organization
- [ ] Add repository
- [ ] Copy token to GitHub secrets
- [ ] Verify sonar-project.properties configuration

### 4. Slack

- [ ] Create Slack workspace or use existing
- [ ] Create channel: `#deployments`
- [ ] Add incoming webhook integration
- [ ] Copy webhook URL to GitHub secrets

## Local Development Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Configure Environment Variables

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in required environment variables
- [ ] Verify AWS credentials are configured locally

### 3. Test Scripts

```bash
# Test deployment script
./scripts/deploy.sh staging --dry-run

# Test rollback script
./scripts/rollback.sh staging --dry-run

# Run E2E tests locally
npm run test:e2e
```

## Verification

### 1. Test PR Workflow

- [ ] Create feature branch
- [ ] Make a small change
- [ ] Push to GitHub
- [ ] Create PR to `develop`
- [ ] Verify PR checks run successfully
- [ ] Verify PR comment is posted
- [ ] Merge PR

### 2. Test Staging Deployment

- [ ] Verify staging deployment triggered
- [ ] Check GitHub Actions logs
- [ ] Verify E2E tests run
- [ ] Check staging site: https://staging.makeriess.com
- [ ] Verify Slack notification (if configured)

### 3. Test Production Deployment

- [ ] Create PR from `develop` to `main`
- [ ] Get approval from team member
- [ ] Merge PR
- [ ] Verify manual approval is required
- [ ] Approve deployment
- [ ] Monitor canary deployment
- [ ] Verify promotion to 100%
- [ ] Check production site: https://makeriess.com
- [ ] Verify GitHub release created

### 4. Test Rollback

- [ ] Run rollback script: `npm run rollback:staging`
- [ ] Verify rollback completes successfully
- [ ] Check staging site still works

## Monitoring Setup

### 1. CloudWatch Dashboard

- [ ] Create custom dashboard: `Makeriess-Production`
- [ ] Add widgets for:
  - [ ] Lambda invocations and errors
  - [ ] API Gateway requests and errors
  - [ ] DynamoDB read/write capacity
  - [ ] Order completion rate

### 2. Alerts

- [ ] Test CloudWatch alarms
- [ ] Verify SNS notifications work
- [ ] Test Slack notifications (if configured)

### 3. Performance Monitoring

- [ ] Run Lighthouse CI manually
- [ ] Verify performance scores
- [ ] Set up regular performance checks

## Documentation

- [ ] Review `.github/README.md`
- [ ] Review `docs/CI_CD_QUICK_START.md`
- [ ] Review `.github/PIPELINE_DIAGRAM.md`
- [ ] Share documentation with team
- [ ] Schedule team training session

## Team Onboarding

- [ ] Share GitHub repository access
- [ ] Share AWS console access (if needed)
- [ ] Share Slack channel
- [ ] Review deployment process with team
- [ ] Review rollback procedures
- [ ] Assign on-call rotation

## Maintenance Schedule

### Weekly Tasks
- [ ] Review failed builds
- [ ] Check dependency updates
- [ ] Review security audit results
- [ ] Check CloudWatch metrics

### Monthly Tasks
- [ ] Update dependencies (minor versions)
- [ ] Review E2E tests
- [ ] Check performance metrics
- [ ] Review AWS costs

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Review and update CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit

## Troubleshooting

If you encounter issues during setup:

1. **GitHub Actions not running:**
   - Check repository settings → Actions → General
   - Verify workflows are enabled
   - Check branch protection rules

2. **AWS deployment failing:**
   - Verify IAM permissions
   - Check AWS credentials in GitHub secrets
   - Review Amplify console logs

3. **E2E tests failing:**
   - Verify test credentials are correct
   - Check staging site is accessible
   - Review Playwright configuration

4. **Secrets not working:**
   - Verify secret names match exactly
   - Check secret values don't have extra spaces
   - Re-create secrets if needed

## Support

For help with setup:
- Check documentation in `.github/README.md`
- Review GitHub Actions logs
- Check AWS Amplify console
- Contact DevOps team

## Sign-off

Once all items are checked:

- [ ] All required secrets configured
- [ ] All environments created
- [ ] Branch protection rules set
- [ ] Test deployment successful
- [ ] Team trained on process
- [ ] Documentation reviewed
- [ ] Monitoring configured

**Setup completed by:** _______________
**Date:** _______________
**Verified by:** _______________
**Date:** _______________

---

## Notes

Use this section to document any setup-specific notes or deviations from the standard process:

```
[Add notes here]
```
