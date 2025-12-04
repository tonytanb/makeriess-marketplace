# CI/CD Quick Start Guide

## Quick Reference

### Common Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback staging
npm run rollback:staging

# Rollback production
npm run rollback:production

# Run E2E tests
npm run test:e2e

# Check bundle size
npm run size
```

### Branch Strategy

```
feature/my-feature → develop → main
     ↓                 ↓         ↓
   PR checks       Staging   Production
```

### Deployment Flow

1. **Feature Development**
   - Create branch from `develop`
   - Make changes
   - Push to GitHub
   - PR checks run automatically

2. **Staging Deployment**
   - Merge PR to `develop`
   - Automatic deployment to staging
   - E2E tests run automatically
   - Review staging at https://staging.makeriess.com

3. **Production Deployment**
   - Create PR from `develop` to `main`
   - Get approval from team
   - Merge to `main`
   - Manual approval required
   - Canary deployment (10% traffic)
   - Automatic promotion or rollback

### Emergency Rollback

```bash
# Quick rollback to previous version
npm run rollback:production

# Or use GitHub Actions
# Go to Actions → Find last successful deployment → Re-run
```

### Monitoring

**CloudWatch Dashboards:**
- Lambda errors: Check error rates
- API Gateway: Check 5xx errors
- DynamoDB: Check throttling

**Slack Notifications:**
- Deployment status
- Error alerts
- Cost warnings

### Troubleshooting

**Build Failed?**
1. Check GitHub Actions logs
2. Run locally: `npm run build`
3. Fix errors and push again

**E2E Tests Failed?**
1. Check Playwright report artifact
2. Run locally: `npm run test:e2e:ui`
3. Fix tests or code

**Deployment Failed?**
1. Check Amplify console
2. Review CloudWatch logs
3. Rollback if needed

**High Error Rate?**
1. Check CloudWatch metrics
2. Review recent changes
3. Rollback immediately
4. Investigate and fix

### Required Secrets

Set these in GitHub repository settings:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AMPLIFY_APP_ID
NEXT_PUBLIC_AMPLIFY_REGION
TEST_USER_EMAIL
TEST_USER_PASSWORD
```

### Environment URLs

- **Staging:** https://staging.makeriess.com
- **Production:** https://makeriess.com

### Support

- **CI/CD Issues:** Check `.github/README.md`
- **Deployment Issues:** Check Amplify console
- **Test Issues:** Check Playwright docs

### Best Practices

✅ Test locally before pushing
✅ Write meaningful commit messages
✅ Keep PRs small
✅ Monitor deployments
✅ Review canary metrics
✅ Document breaking changes

### Commit Message Format

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
perf: improve performance
test: add tests
chore: update dependencies
```

### Performance Budgets

- Lighthouse Score: 90+
- Initial JS: < 200KB
- API Latency: < 3s
- Error Rate: < 5%

### Maintenance Schedule

**Weekly:**
- Review failed builds
- Check dependency updates
- Review security audits

**Monthly:**
- Update dependencies
- Review E2E tests
- Check performance metrics

**Quarterly:**
- Major dependency updates
- Pipeline optimization
- Security audit
