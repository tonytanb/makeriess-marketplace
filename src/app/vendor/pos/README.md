# POS Connection Flow

This directory contains the vendor POS (Point of Sale) connection interface, allowing vendors to connect their existing POS systems to automatically sync products, prices, and inventory.

## Supported POS Providers

### 1. Square
- **OAuth Flow**: Standard OAuth 2.0
- **Redirect URL**: `/vendor/pos/callback`
- **Required Scopes**: `MERCHANT_PROFILE_READ`, `ITEMS_READ`, `INVENTORY_READ`
- **Setup**: Click "Connect Square" → Authorize on Square → Automatic redirect back

### 2. Toast
- **OAuth Flow**: Custom credentials-based
- **Setup Page**: `/vendor/pos/toast-setup`
- **Required Info**: Client ID, Client Secret, Restaurant GUID
- **Setup**: Enter credentials manually → Connect

### 3. Shopify
- **OAuth Flow**: Standard OAuth 2.0
- **Setup Page**: `/vendor/pos/shopify-setup`
- **Required Scopes**: `read_products`, `read_inventory`
- **Setup**: Enter shop domain → Authorize on Shopify → Automatic redirect back

## Pages

### `/vendor/pos` - Main POS Connection Page
- Displays all available POS integrations
- Shows connection status for each provider
- Provides "Connect", "Sync Now", and "Disconnect" actions
- Displays sync history table

### `/vendor/pos/callback` - OAuth Callback Handler
- Receives OAuth authorization codes
- Redirects back to main POS page with parameters
- Handles both success and error cases

### `/vendor/pos/toast-setup` - Toast Setup Page
- Custom form for Toast credentials
- Validates and stores credentials
- Initiates connection

### `/vendor/pos/shopify-setup` - Shopify Setup Page
- Shop domain input form
- Redirects to Shopify OAuth flow
- Handles shop domain validation

## Components

### `POSConnectionCard`
Displays a single POS provider with:
- Provider logo and description
- Connection status indicator
- Account ID and last sync time
- Action buttons (Connect/Sync/Disconnect)

### `SyncLogsTable`
Displays sync history with:
- Timestamp
- Success/failure status
- Products added/updated/removed counts
- Error messages

## API Integration

### Queries
- `connectPOS`: Connects a POS system using OAuth code
- `syncPOSProducts`: Manually triggers product sync
- `getPOSConnection`: Gets current POS connection status
- `getSyncLogs`: Retrieves sync history

### Mutations
- `useConnectPOS`: Hook for connecting POS
- `useSyncPOSProducts`: Hook for syncing products
- `useDisconnectPOS`: Hook for disconnecting POS

## Environment Variables

Required environment variables (set in `.env.local`):

```env
# Square
NEXT_PUBLIC_SQUARE_CLIENT_ID=your_square_client_id
SQUARE_CLIENT_SECRET=your_square_client_secret
SQUARE_SANDBOX=true  # Set to false for production

# Toast
TOAST_CLIENT_ID=your_toast_client_id
TOAST_CLIENT_SECRET=your_toast_client_secret

# Shopify
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
```

## OAuth Flow Diagram

```
Square/Shopify Flow:
1. User clicks "Connect [Provider]"
2. Redirect to provider OAuth page
3. User authorizes Makeriess
4. Provider redirects to /vendor/pos/callback?code=XXX&state=PROVIDER
5. Callback page redirects to /vendor/pos?code=XXX&state=PROVIDER
6. Main page calls connectPOS mutation
7. Backend exchanges code for access token
8. Credentials stored in AWS Secrets Manager
9. Initial sync triggered automatically

Toast Flow:
1. User clicks "Connect Toast"
2. Redirect to /vendor/pos/toast-setup
3. User enters credentials manually
4. Form submits to connectPOS mutation
5. Backend validates and stores credentials
6. Initial sync triggered automatically
```

## Sync Behavior

### Automatic Sync
- Runs every 15 minutes via EventBridge schedule
- Updates products, prices, and inventory
- Logs results to DynamoDB

### Manual Sync
- Triggered by "Sync Now" button
- Immediate product sync
- Shows real-time progress

### Webhook Sync (Future)
- Real-time updates via POS webhooks
- Instant product changes
- Requires webhook endpoint setup

## Error Handling

### Connection Errors
- OAuth failures: Display error message, allow retry
- Invalid credentials: Show validation error
- Network errors: Retry with exponential backoff

### Sync Errors
- Partial failures: Log errors, continue with successful items
- Complete failures: Display error, suggest reconnection
- Rate limiting: Implement backoff and retry

## Security

### Credentials Storage
- OAuth tokens stored in AWS Secrets Manager
- Encrypted at rest with AWS KMS
- Never exposed to frontend

### API Security
- All POS API calls from backend Lambda functions
- No direct frontend-to-POS communication
- Webhook signature verification

## Testing

### Development Testing
1. Use sandbox/test accounts for each provider
2. Set `SQUARE_SANDBOX=true` for Square testing
3. Use test shop for Shopify
4. Use Toast test environment

### Manual Testing Checklist
- [ ] Connect each POS provider
- [ ] Verify OAuth redirect flow
- [ ] Check connection status display
- [ ] Trigger manual sync
- [ ] Verify sync logs appear
- [ ] Test disconnect functionality
- [ ] Verify error handling

## Future Enhancements

1. **Webhook Support**: Real-time product updates
2. **Inventory Sync**: Two-way inventory synchronization
3. **Order Sync**: Push orders back to POS
4. **Multi-Location**: Support for multiple store locations
5. **Custom Mappings**: Allow vendors to map POS categories to Makeriess categories
6. **Sync Scheduling**: Custom sync frequency per vendor
7. **Conflict Resolution**: Handle product conflicts intelligently
