# Vendor Portal

This directory contains the vendor-facing portal for the Makeriess marketplace platform.

## Overview

The vendor portal allows business owners to manage their products, orders, and view analytics about their business performance on the Makeriess platform.

## Pages

### Dashboard (`/vendor/dashboard`)
The main vendor dashboard displaying:
- **Key Metrics**: Today's sales, pending orders, total products, store status
- **Recent Orders**: Last 10 orders with quick status view
- **Top Products**: Best-performing products by revenue
- **Quick Actions**: 
  - Pause/Resume orders
  - View detailed analytics
  - Access settings

### Orders (`/vendor/orders`)
Order management interface (placeholder - Task 26)
- View all orders with filtering
- Update order status
- View order details

### Products (`/vendor/products`)
Product management interface (placeholder - Task 25)
- View all synced products
- Toggle product visibility
- Manual product upload
- Bulk actions

### Analytics (`/vendor/analytics`)
Detailed analytics dashboard (placeholder - Task 27)
- Sales trends (daily, weekly, monthly)
- Top products by revenue and order count
- Customer engagement metrics
- QuickSight embedded dashboards

### Settings (`/vendor/settings`)
Vendor profile and configuration (placeholder - Tasks 6, 24)
- Business profile management
- Operating hours
- Delivery zones
- POS connections

## Components

### Dashboard Components

#### `DashboardMetricCard`
Reusable metric card component displaying:
- Title
- Value (number or string)
- Icon with custom colors
- Optional subtitle

#### `RecentOrdersList`
Displays recent orders with:
- Order ID and status badge
- Time ago
- Order items preview
- Total amount
- Click to view details

#### `TopProductsList`
Shows top-performing products with:
- Product ranking
- Product name
- Order count
- Revenue
- Visual revenue bar

## API Integration

### Queries
- `getVendorDashboard`: Fetches dashboard metrics and data
  - Today's sales and order count
  - Pending orders count
  - Product statistics
  - Recent orders (last 10)
  - Top products (top 5 by revenue)
  - Store status (open/closed, paused)

### Mutations
- `toggleVendorStatus`: Pause or resume accepting orders
  - Updates `isPaused` field on Vendor model
  - Invalidates dashboard cache

## Hooks

### `useVendorDashboard(vendorId)`
React Query hook for fetching dashboard data:
- Auto-refreshes every 60 seconds
- Considers data stale after 30 seconds
- Enabled when vendorId is provided

### `useToggleVendorStatus()`
Mutation hook for toggling vendor status:
- Optimistic updates
- Invalidates related queries on success
- Error handling with rollback

## Authentication

**TODO**: Currently uses hardcoded `VENDOR_ID = 'vendor_123'`

In production, the vendor ID should be:
1. Retrieved from the authenticated user's session (Cognito)
2. Verified that the user has vendor role
3. Used to fetch only that vendor's data

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 13.1**: Display sales trends and key metrics
- **Requirement 13.2**: Show top-performing products
- **Requirement 13.3**: Display customer engagement metrics (views, orders)

## Future Enhancements

1. **Real-time Updates**: WebSocket or GraphQL subscriptions for live order updates
2. **Notifications**: Push notifications for new orders
3. **Mobile Responsive**: Optimize for mobile vendor management
4. **Offline Support**: Cache dashboard data for offline viewing
5. **Export Data**: Allow vendors to export reports
6. **Multi-location**: Support for vendors with multiple locations

## Related Tasks

- Task 24: Implement vendor POS connection flow
- Task 25: Build vendor product management
- Task 26: Implement vendor order management
- Task 27: Build vendor analytics dashboard
- Task 28: Implement vendor promotions and flash sales
