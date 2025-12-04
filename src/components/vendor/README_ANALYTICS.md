# Vendor Analytics Components

This directory contains components for the vendor analytics dashboard.

## Components

### AnalyticsMetricCard

Displays a single metric with an icon, value, and optional change indicator.

**Props:**
- `title`: Metric title (e.g., "Total Revenue")
- `value`: Metric value (number or string)
- `change`: Optional percentage change
- `changeLabel`: Optional label below the value
- `icon`: Lucide icon component
- `iconColor`: Tailwind color class for icon
- `iconBgColor`: Tailwind background color class for icon container
- `format`: Value format ('number', 'currency', 'percentage')

**Example:**
```tsx
<AnalyticsMetricCard
  title="Total Revenue"
  value={12345.67}
  icon={DollarSign}
  iconColor="text-green-600"
  iconBgColor="bg-green-100"
  format="currency"
  changeLabel="Avg order: $45.50"
/>
```

### SalesTrendChart

Displays a horizontal bar chart showing sales trends over time.

**Props:**
- `data`: Array of VendorMetrics objects
- `period`: Time period ('daily', 'weekly', 'monthly')

**Features:**
- Responsive bar widths based on revenue
- Date formatting based on period
- Order count display
- Total revenue summary

**Example:**
```tsx
<SalesTrendChart 
  data={analytics.dailyMetrics} 
  period="daily" 
/>
```

### TopProductsTable

Displays a table of top-performing products with detailed metrics.

**Props:**
- `products`: Array of TopProduct objects

**Columns:**
- Rank (1-10)
- Product name and ID
- Views
- Favorites
- Cart adds
- Orders
- Revenue
- Conversion rate

**Features:**
- Color-coded conversion rates
- Sortable by revenue (default)
- Total revenue summary
- Responsive design

**Example:**
```tsx
<TopProductsTable products={analytics.topProducts} />
```

### EngagementMetricsChart

Displays customer engagement metrics with progress bars.

**Props:**
- `data`: Array of VendorMetrics objects

**Metrics:**
- Total views (product + profile)
- Favorites
- Cart adds

**Features:**
- Visual progress bars
- Calculated rates (favorite rate, cart add rate)
- Icon indicators
- Color-coded metrics

**Example:**
```tsx
<EngagementMetricsChart data={analytics.dailyMetrics} />
```

## Data Types

### VendorMetrics
```typescript
interface VendorMetrics {
  date: string;
  productViews: number;
  profileViews: number;
  productFavorites: number;
  cartAdds: number;
  orders: number;
  completedOrders: number;
  revenue: number;
}
```

### TopProduct
```typescript
interface TopProduct {
  productId: string;
  productName?: string;
  views: number;
  favorites: number;
  cartAdds: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}
```

### AnalyticsSummary
```typescript
interface AnalyticsSummary {
  productViews: number;
  profileViews: number;
  productFavorites: number;
  cartAdds: number;
  orders: number;
  completedOrders: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
  completionRate: number;
}
```

## Usage in Analytics Page

```tsx
import { useVendorAnalytics } from '@/lib/hooks/useAnalytics';
import { AnalyticsMetricCard } from '@/components/vendor/AnalyticsMetricCard';
import { SalesTrendChart } from '@/components/vendor/SalesTrendChart';
import { TopProductsTable } from '@/components/vendor/TopProductsTable';
import { EngagementMetricsChart } from '@/components/vendor/EngagementMetricsChart';

export default function AnalyticsPage() {
  const { data: analytics } = useVendorAnalytics({
    vendorId: 'vendor_123',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    period: 'daily',
  });

  return (
    <div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={analytics.summary.revenue}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          format="currency"
        />
        {/* More metric cards... */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <SalesTrendChart data={analytics.dailyMetrics} period="daily" />
        <EngagementMetricsChart data={analytics.dailyMetrics} />
      </div>

      {/* Top Products */}
      <TopProductsTable products={analytics.topProducts} />
    </div>
  );
}
```

## Styling

All components use Tailwind CSS for styling with a consistent design system:

**Colors:**
- Primary: Blue (bg-blue-500, text-blue-600)
- Success: Green (bg-green-500, text-green-600)
- Warning: Yellow (bg-yellow-500, text-yellow-600)
- Danger: Red (bg-red-500, text-red-600)
- Info: Purple (bg-purple-500, text-purple-600)

**Spacing:**
- Cards: p-6 (24px padding)
- Gaps: gap-6 (24px gap)
- Margins: mb-6 (24px bottom margin)

**Borders:**
- Cards: border border-gray-200 rounded-lg
- Tables: border-b border-gray-100

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast ratios meet WCAG AA standards
- Screen reader friendly

## Performance

Components are optimized for performance:
- Memoized calculations with `useMemo`
- Efficient re-renders with React.memo (where applicable)
- Lazy loading for large datasets
- Debounced user interactions

## Testing

Components can be tested with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { DollarSign } from 'lucide-react';

test('renders metric card with currency format', () => {
  render(
    <AnalyticsMetricCard
      title="Total Revenue"
      value={1234.56}
      icon={DollarSign}
      iconColor="text-green-600"
      iconBgColor="bg-green-100"
      format="currency"
    />
  );
  
  expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  expect(screen.getByText('$1,234.56')).toBeInTheDocument();
});
```
