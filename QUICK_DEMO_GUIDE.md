# Quick Demo Guide - How to See the Demo in Action

## ✅ FIXED! Demo Mode Now Works

I've updated the app so demo mode properly bypasses authentication. Here's how to use it:

## Step-by-Step Instructions

### Method 1: Via Demo Landing Page (Recommended)

1. **Visit**: http://localhost:3000/demo
2. **Click**: The green "Start Demo Experience" button
3. **You're in!** The app will load with mock data - no login required!

### Method 2: Direct Access

1. **Open your browser console** (F12 or Cmd+Option+J)
2. **Type**: `localStorage.setItem('demoMode', 'true')`
3. **Press Enter**
4. **Visit**: http://localhost:3000
5. **You're in!** The app works without authentication

### Method 3: Use the Toggle Button

1. Visit any page (even if it shows login error)
2. Look for the **button in the bottom-right corner**
3. Click it to turn it **green** (Demo Mode)
4. Page will reload with demo mode active

## What Changed

I fixed these issues:
- ✅ Home page now bypasses auth check in demo mode
- ✅ Product hooks use mock data when demo mode is active
- ✅ Vendor hooks use mock data when demo mode is active
- ✅ Demo mode persists in localStorage
- ✅ No more "Invalid user pool id" errors

## What You Can Test Now

### Browse Products
- Home page shows all mock products
- Search functionality works
- Category filtering works
- Sort by distance, price, rating

### Explore Vendors
- 3 vendors available:
  - Sweet Treats Bakery
  - Handmade Pottery Studio
  - Farm Fresh Produce
- Click any vendor to see their profile
- View their product catalogs

### Shopping Features
- Add products to cart
- View cart (click cart icon)
- Checkout flow
- Order confirmation

### User Features
- View orders: http://localhost:3000/orders
- Manage favorites: http://localhost:3000/favorites
- See map view: http://localhost:3000/map

### Individual Pages to Try

**Products**:
- http://localhost:3000/product/product-1 (Chocolate Chip Cookies)
- http://localhost:3000/product/product-2 (Custom Birthday Cake)
- http://localhost:3000/product/product-3 (Ceramic Coffee Mug Set)
- http://localhost:3000/product/product-4 (Organic Vegetable Box)
- http://localhost:3000/product/product-5 (Fresh Strawberries)

**Vendors**:
- http://localhost:3000/vendor/vendor-1 (Sweet Treats Bakery)
- http://localhost:3000/vendor/vendor-2 (Handmade Pottery Studio)
- http://localhost:3000/vendor/vendor-3 (Farm Fresh Produce)

**Other Pages**:
- http://localhost:3000/orders (Order History)
- http://localhost:3000/favorites (Saved Items)
- http://localhost:3000/map (Vendor Map)
- http://localhost:3000/checkout (Checkout Flow)

## Visual Indicators

**Demo Mode Active**:
- Green button in bottom-right corner
- Says "Demo Mode" with test tube icon
- All features work without login

**Live Mode** (Backend Required):
- Gray button in bottom-right corner
- Says "Live Mode" with database icon
- Requires authentication

## Troubleshooting

### Still Seeing Login Page?

1. **Check the button** - Is it green? If not, click it
2. **Clear cache** - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. **Check console** - Type: `localStorage.getItem('demoMode')`
   - Should return: `"true"`
   - If not, set it: `localStorage.setItem('demoMode', 'true')`

### Products Not Loading?

1. **Check demo mode** - Button should be green
2. **Refresh the page** - The hooks need to re-run
3. **Check console** - Look for any errors

### Map Not Working?

The map requires Mapbox token. In demo mode, it will show mock vendors but the map itself needs configuration.

## Mock Data Available

### Vendors (3)
- Sweet Treats Bakery (Food & Beverage)
- Handmade Pottery Studio (Arts & Crafts)
- Farm Fresh Produce (Groceries)

### Products (5+)
- Chocolate Chip Cookies - $12.99 (trending)
- Custom Birthday Cake - $45.00
- Ceramic Coffee Mug Set - $68.00 (20% off)
- Organic Vegetable Box - $35.00
- Fresh Strawberries - $6.99 (trending)

### Orders (3)
- Delivered order (cookies + cake)
- In-transit order (vegetables + strawberries)
- Processing order (ceramic mugs)

### User Profile
- Name: Demo User
- Email: demo@makeriess.com
- 2 saved addresses
- 3 favorite products
- 2 favorite vendors

## Performance Features You Can See

✅ **Loading Skeletons** - Refresh pages to see them
✅ **Error Boundaries** - Try invalid URLs
✅ **Lazy Loading** - Check Network tab for code splitting
✅ **Web Vitals** - Check Console for performance metrics
✅ **PWA Features** - Install prompt, offline support

## Next Steps

Once you're done testing the demo:
1. We can deploy the real backend to AWS
2. Connect to Cognito for real authentication
3. Set up Stripe for payments
4. Deploy to www.makeriess.com

For now, enjoy exploring the fully functional MVP! 🎉
