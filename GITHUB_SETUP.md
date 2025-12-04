# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name**: `makeriess-marketplace`
   - **Description**: `Local marketplace connecting customers with artisan vendors - Built with Next.js, AWS Amplify, and TypeScript`
   - **Visibility**: Choose Public or Private
   - **Important**: Do NOT check any boxes (no README, .gitignore, or license)
3. Click "Create repository"

## Step 2: Copy Your Repository URL

After creating, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/makeriess-marketplace.git
```

Copy this URL!

## Step 3: Push Your Code

Run these commands in your terminal (replace YOUR_USERNAME with your actual GitHub username):

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/makeriess-marketplace.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)
  - Create token at: https://github.com/settings/tokens
  - Select scopes: `repo` (full control of private repositories)

## Step 4: Verify on GitHub

1. Go to your repository: `https://github.com/YOUR_USERNAME/makeriess-marketplace`
2. You should see all your files
3. Check that the README displays correctly

## Step 5: Deploy to AWS Amplify

Now that your code is on GitHub, deploy it:

1. **Go to AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/

2. **Create New App**
   - Click "New app" → "Host web app"
   - Select "GitHub"
   - Authorize AWS Amplify (if first time)

3. **Select Repository**
   - Choose: `makeriess-marketplace`
   - Branch: `main`
   - Click "Next"

4. **Configure Build**
   - App name: `makeriess-marketplace`
   - Environment: `production`
   - Amplify will auto-detect Next.js settings
   - Click "Next"

5. **Review and Deploy**
   - Review settings
   - Click "Save and deploy"
   - Wait 5-10 minutes

6. **Get Your URL**
   - After deployment, you'll get a URL like:
   - `https://main.xxxxx.amplifyapp.com`

7. **Test Demo Mode**
   - Visit: `https://main.xxxxx.amplifyapp.com/?demo=true`
   - Test Toast POS integration at `/vendor/pos`

## Troubleshooting

### Authentication Error When Pushing

If you get an authentication error:

```bash
# Use SSH instead of HTTPS
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/makeriess-marketplace.git
git push -u origin main
```

Make sure you have SSH keys set up: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Build Fails on Amplify

1. Check build logs in Amplify Console
2. Verify `package.json` has all dependencies
3. Try building locally first: `npm run build`

### Can't Find Repository in Amplify

1. Make sure repository is not empty (should have files)
2. Refresh the repository list in Amplify
3. Check GitHub authorization for AWS Amplify

## Next Steps

After successful deployment:

1. ✅ Test demo mode features
2. ✅ Configure custom domain (optional)
3. ✅ Set up environment variables
4. ✅ Enable branch deployments for staging
5. ✅ Configure monitoring and alerts

## Useful Commands

```bash
# Check current remote
git remote -v

# Change remote URL
git remote set-url origin NEW_URL

# View commit history
git log --oneline

# Create new branch for features
git checkout -b feature/new-feature

# Push new branch
git push -u origin feature/new-feature
```

## Resources

- [GitHub Docs](https://docs.github.com/)
- [AWS Amplify Hosting](https://docs.amplify.aws/guides/hosting/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
