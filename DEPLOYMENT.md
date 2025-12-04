# Deployment Guide

## Prerequisites

- AWS Account with Amplify access
- GitHub account
- Node.js 18+ installed locally

## GitHub Setup

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `makeriess-marketplace`
3. Description: `Local marketplace connecting customers with artisan vendors`
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/makeriess-marketplace.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## AWS Amplify Deployment

### Option 1: Deploy via AWS Console (Recommended)

1. **Go to AWS Amplify Console**
   - Navigate to https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub
   - Select your repository: `makeriess-marketplace`
   - Select branch: `main`

3. **Configure Build Settings**
   - Amplify will auto-detect Next.js
   - Build settings should look like:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Environment Variables** (Optional for demo mode)
   - Click "Advanced settings"
   - Add environment variables if needed:
     - `NEXT_PUBLIC_DEMO_MODE=true` (to enable demo mode by default)
     - `STRIPE_SECRET_KEY` (for payment processing)
     - `MAPBOX_ACCESS_TOKEN` (for maps)

5. **Deploy**
   - Click "Save and deploy"
   - Wait 5-10 minutes for deployment
   - Your app will be available at: `https://main.xxxxx.amplifyapp.com`

### Option 2: Deploy via Amplify CLI

```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Post-Deployment

### 1. Test Demo Mode

Visit your deployed URL with `?demo=true`:
```
https://your-app.amplifyapp.com/?demo=true
```

### 2. Configure Custom Domain (Optional)

1. In Amplify Console, go to "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `makeriess.com`)
4. Follow DNS configuration instructions

### 3. Set Up CI/CD

Amplify automatically sets up CI/CD:
- Every push to `main` triggers a deployment
- Pull requests create preview deployments
- You can configure branch-specific deployments

### 4. Monitor Deployment

- View build logs in Amplify Console
- Check CloudWatch for backend logs
- Monitor performance in AWS Console

## Environment-Specific Deployments

### Staging Environment

```bash
# Create staging branch
git checkout -b staging

# Push to GitHub
git push -u origin staging

# In Amplify Console:
# 1. Go to your app
# 2. Click "Connect branch"
# 3. Select "staging" branch
# 4. Configure as needed
```

### Production Environment

Production deploys from `main` branch automatically.

## Troubleshooting

### Build Fails

1. Check build logs in Amplify Console
2. Verify all dependencies are in `package.json`
3. Ensure TypeScript compiles locally: `npm run build`

### Environment Variables Not Working

1. Verify variables are set in Amplify Console
2. Restart deployment after adding variables
3. Check variable names match your code

### Demo Mode Not Working

1. Ensure `localStorage` is accessible
2. Check browser console for errors
3. Try enabling manually: `localStorage.setItem('demoMode', 'true')`

## Rollback

If deployment fails:

```bash
# In Amplify Console:
# 1. Go to your app
# 2. Click on a previous successful deployment
# 3. Click "Redeploy this version"
```

## Cost Estimation

AWS Amplify Hosting costs:
- **Build minutes**: $0.01 per minute
- **Hosting**: $0.15 per GB served
- **Free tier**: 1000 build minutes/month, 15 GB served/month

Typical monthly cost for low-traffic app: **$0-5**

## Support

- AWS Amplify Docs: https://docs.amplify.aws/
- GitHub Issues: Create an issue in your repository
- AWS Support: https://console.aws.amazon.com/support/

## Next Steps

After deployment:
1. Test all features in demo mode
2. Configure real backend services (DynamoDB, Cognito, etc.)
3. Set up monitoring and alerts
4. Configure custom domain
5. Enable HTTPS (automatic with Amplify)
