# Makeriess Marketplace

A curated local marketplace platform connecting customers with local food makers, craft vendors, and boutique shops.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: AWS Amplify Gen 2, AppSync (GraphQL), Lambda
- **Database**: DynamoDB, OpenSearch
- **Authentication**: Amazon Cognito
- **Payments**: Stripe Connect
- **AI/ML**: Amazon Bedrock, Amazon Personalize

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account
- AWS CLI configured with credentials

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start Amplify sandbox** (deploys backend to AWS):
   ```bash
   npm run amplify:sandbox
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (customer)/        # Customer-facing routes
│   ├── (vendor)/          # Vendor portal routes
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── customer/         # Customer UI components
│   ├── vendor/           # Vendor UI components
│   └── shared/           # Shared components
└── lib/                  # Utilities and configurations
    ├── amplify/          # Amplify configuration
    ├── hooks/            # Custom React hooks
    └── utils/            # Utility functions

amplify/
├── auth/                 # Cognito authentication config
├── data/                 # AppSync GraphQL schema
└── backend.ts            # Amplify backend definition
```

## Amplify Backend

### Authentication (Cognito)

- Email/password authentication
- Social login (Google, Apple)
- MFA support (optional for customers, required for vendors)
- Password policy: min 8 chars, uppercase, lowercase, number

### Data (AppSync + DynamoDB)

GraphQL API with the following models:
- Customer
- Vendor
- Product
- Order
- Review

### Deployment

To deploy the backend to AWS:

```bash
npm run amplify:deploy
```

## Task 1 Completion Status

✅ **Task 1.1**: Amplify authentication with Cognito
- Cognito user pools configured for customers and vendors
- Password policies and MFA settings configured
- Social login providers ready to configure (see amplify/auth/resource.ts)
- Separate authorization rules for customers and vendors

✅ **Task 1.2**: Route 53 and domain setup
- Configuration documented in docs/ROUTE53_SETUP.md
- DNS and SSL certificate setup instructions provided

✅ **Task 1.3**: DynamoDB single-table design
- Table structure documented in docs/DYNAMODB_SETUP.md
- Access patterns and examples provided

✅ **Task 1.4**: OpenSearch domain setup
- Configuration documented in docs/OPENSEARCH_SETUP.md
- Index mappings and search queries provided

## Next Steps

- Deploy Amplify backend: `npm run amplify:sandbox`
- Configure AWS infrastructure (Route 53, DynamoDB, OpenSearch)
- Start implementing Task 2: GraphQL API with AppSync

## Deployment

### Quick Deploy to AWS Amplify

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/makeriess-marketplace.git
   git push -u origin main
   ```

2. **Deploy via AWS Console:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Amplify will auto-detect Next.js and deploy

3. **Test Demo Mode:**
   ```
   https://your-app.amplifyapp.com/?demo=true
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Demo Mode

Test the full marketplace without backend setup:

- **Enable**: Visit `/?demo=true` or `/demo`
- **Features**: 30+ mock API endpoints, POS integrations, analytics
- **Docs**: [DEMO_MODE_COMPLETE.md](DEMO_MODE_COMPLETE.md)

### Demo Credentials (Toast POS)
```
Client ID: toast_demo_client_abc123
Client Secret: toast_demo_secret_xyz789
Restaurant GUID: demo-guid-123
```

## Documentation

- [Requirements](.kiro/specs/makeriess-marketplace/requirements.md)
- [Design](.kiro/specs/makeriess-marketplace/design.md)
- [Tasks](.kiro/specs/makeriess-marketplace/tasks.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Demo Mode Guide](DEMO_MODE_COMPLETE.md)
