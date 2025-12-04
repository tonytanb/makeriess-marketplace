# Map View Setup Guide

## Overview

The map view feature displays nearby vendors on an interactive map with custom markers and mini card popups. The implementation uses Mapbox GL JS for rendering and can be integrated with Amazon Location Service in production.

## Features

- **Interactive Map**: Pan, zoom, and navigate the map
- **Vendor Markers**: Custom markers showing vendor locations
- **Mini Card Popups**: Click on markers to see vendor details
- **User Location**: Blue marker showing the customer's delivery address
- **Navigation Controls**: Zoom in/out and compass controls
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Get a Mapbox Access Token

1. Sign up for a free account at [mapbox.com](https://www.mapbox.com/)
2. Navigate to your [Account Dashboard](https://account.mapbox.com/)
3. Copy your default public token or create a new one
4. The free tier includes:
   - 50,000 map loads per month
   - Unlimited map views
   - No credit card required

### 2. Configure Environment Variables

Add your Mapbox token to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Important**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Amazon Location Service Integration (Production)

For production deployments, you can integrate with Amazon Location Service instead of Mapbox:

### Benefits of Amazon Location Service

- **AWS Native**: Seamless integration with other AWS services
- **Cost Effective**: Pay only for what you use
- **Data Privacy**: Keep location data within AWS
- **Compliance**: Meets various regulatory requirements

### Setup Steps

1. **Create a Map Resource**:
   ```bash
   aws location create-map \
     --map-name makeriess-map \
     --configuration Style=VectorEsriStreets \
     --pricing-plan RequestBasedUsage
   ```

2. **Create an API Key**:
   ```bash
   aws location create-key \
     --key-name makeriess-map-key \
     --restrictions AllowActions=geo:GetMap*,AllowResources=arn:aws:geo:*:*:map/makeriess-map
   ```

3. **Update MapView Component**:
   Replace Mapbox initialization with Amazon Location Service:
   
   ```typescript
   import { LocationClient } from '@aws-sdk/client-location';
   import { withAPIKey } from '@aws/amazon-location-utilities-auth-helper';
   
   const authHelper = await withAPIKey(process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY!);
   
   map.current = new mapboxgl.Map({
     container: mapContainer.current,
     style: `https://maps.geo.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/maps/v0/maps/makeriess-map/style-descriptor`,
     center: center,
     zoom: zoom,
     transformRequest: authHelper.transformRequest,
   });
   ```

4. **Install Required Packages**:
   ```bash
   npm install @aws-sdk/client-location @aws/amazon-location-utilities-auth-helper
   ```

## Component Architecture

### MapView Component

**Location**: `src/components/customer/MapView.tsx`

**Props**:
- `vendors`: Array of vendor objects to display
- `center`: [longitude, latitude] coordinates for map center
- `zoom`: Initial zoom level (default: 12)
- `onVendorClick`: Optional callback when a vendor marker is clicked

**Features**:
- Custom vendor markers with logos
- User location marker (blue dot)
- Click handlers for vendor selection
- Map legend
- Navigation controls

### VendorMiniCard Component

**Location**: `src/components/customer/VendorMiniCard.tsx`

**Props**:
- `vendor`: Vendor object to display
- `onClose`: Callback to close the card

**Features**:
- Vendor logo and cover image
- Business name and description
- Rating and distance
- Categories
- Status indicators (paused, closed)
- Link to vendor profile page

### Map Page

**Location**: `src/app/map/page.tsx`

**Features**:
- Fetches nearby vendors based on user location
- Handles geolocation permissions
- Loading and error states
- Vendor count display
- Address display in header

## Customization

### Marker Styles

Customize vendor markers in `MapView.tsx`:

```typescript
// Change marker size
el.style.width = '50px';
el.style.height = '50px';

// Change marker color
el.style.border = '3px solid #your-color';

// Add custom icons
el.innerHTML = '<svg>...</svg>';
```

### Map Style

Change the map style in `MapView.tsx`:

```typescript
// Available Mapbox styles:
// - mapbox://styles/mapbox/streets-v12 (default)
// - mapbox://styles/mapbox/outdoors-v12
// - mapbox://styles/mapbox/light-v11
// - mapbox://styles/mapbox/dark-v11
// - mapbox://styles/mapbox/satellite-v9
// - mapbox://styles/mapbox/satellite-streets-v12

map.current = new mapboxgl.Map({
  style: 'mapbox://styles/mapbox/light-v11',
  // ... other options
});
```

### Popup Position

Adjust popup positioning in `MapView.tsx`:

```typescript
// Change vertical offset
top: `${popupPosition.y - 30}px`, // Increase offset

// Change horizontal alignment
transform: 'translate(-50%, -100%)', // Center above marker
transform: 'translate(0, -100%)',    // Align left
transform: 'translate(-100%, -100%)', // Align right
```

## Performance Optimization

### Marker Clustering

For large numbers of vendors, implement marker clustering:

```bash
npm install mapbox-gl-cluster
```

```typescript
import Supercluster from 'supercluster';

const cluster = new Supercluster({
  radius: 40,
  maxZoom: 16,
});

cluster.load(vendors.map(v => ({
  type: 'Feature',
  properties: { vendor: v },
  geometry: {
    type: 'Point',
    coordinates: [v.location.longitude, v.location.latitude],
  },
})));
```

### Lazy Loading

The map component is already optimized for lazy loading. The map only initializes when the component mounts.

### Image Optimization

Vendor logos and cover images use Next.js Image component for automatic optimization.

## Troubleshooting

### Map Not Displaying

1. **Check Token**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
2. **Check Console**: Look for errors in browser console
3. **Check Network**: Ensure Mapbox API is accessible
4. **Restart Server**: Restart dev server after adding env variables

### Markers Not Appearing

1. **Check Vendor Data**: Ensure vendors have valid `location` coordinates
2. **Check Zoom Level**: Zoom out to see if markers are outside viewport
3. **Check Console**: Look for JavaScript errors

### Popup Not Showing

1. **Check Click Handler**: Ensure marker click events are firing
2. **Check Z-Index**: Popup may be behind other elements
3. **Check Position**: Popup may be off-screen

### Geolocation Not Working

1. **HTTPS Required**: Geolocation only works on HTTPS (or localhost)
2. **Permissions**: User must grant location permissions
3. **Fallback**: App uses default location if geolocation fails

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile browsers: Full support

## Accessibility

- Keyboard navigation: Use Tab to focus controls
- Screen readers: Map has appropriate ARIA labels
- High contrast: Markers have sufficient contrast
- Touch targets: Markers are large enough for touch

## Future Enhancements

- [ ] Marker clustering for better performance
- [ ] Custom map styles matching brand colors
- [ ] Vendor filtering on map
- [ ] Route directions to vendors
- [ ] Street view integration
- [ ] Offline map caching
- [ ] Real-time vendor status updates
- [ ] Heat map of popular areas

## Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Amazon Location Service Documentation](https://docs.aws.amazon.com/location/)
- [React Map GL Documentation](https://visgl.github.io/react-map-gl/)
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Mapbox documentation
3. Check browser console for errors
4. Contact the development team
