# How to Access Demo Mode - SIMPLE STEPS

## The Problem
You're seeing "Invalid user pool id provided" because the app is trying to use Cognito (which isn't deployed yet).

## The Solution - 3 Ways to Access Demo

### ✅ METHOD 1: Direct URL (EASIEST)

Just visit this URL directly:
```
http://localhost:3000/demo
```

Then click the green "Start Demo Experience" button.

### ✅ METHOD 2: Manual localStorage (GUARANTEED TO WORK)

1. **Open your browser** (any page)
2. **Press F12** (or Cmd+Option+J on Mac) to open DevTools
3. **Go to Console tab**
4. **Type this exactly**:
   ```javascript
   localStorage.setItem('demoMode', 'true')
   ```
5. **Press Enter**
6. **Visit**: http://localhost:3000
7. **Done!** The app will work without login

### ✅ METHOD 3: Use the Demo Button

1. On the login page, look for the green "Try Demo Mode" button at the bottom
2. Click it
3. You'll be taken to the demo landing page
4. Click "Start Demo Experience"

## What I Just Fixed

1. ✅ Login page now auto-redirects if demo mode is active
2. ✅ Signup page now auto-redirects if demo mode is active  
3. ✅ Added "Try Demo Mode" button on auth pages
4. ✅ Home page bypasses auth in demo mode
5. ✅ All data hooks use mock data in demo mode

## To Verify Demo Mode is Active

Open Console (F12) and type:
```javascript
localStorage.getItem('demoMode')
```

Should return: `"true"`

## If Still Not Working

Try this complete reset:

1. **Clear everything**:
   ```javascript
   localStorage.clear()
   ```

2. **Set demo mode**:
   ```javascript
   localStorage.setItem('demoMode', 'true')
   ```

3. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Visit**: http://localhost:3000

## Quick Test

After enabling demo mode, try these URLs:
- http://localhost:3000 (should show products, no login)
- http://localhost:3000/product/product-1 (should show product detail)
- http://localhost:3000/vendor/vendor-1 (should show vendor profile)

All should work WITHOUT any login!

## The Demo Mode Button

Look for this button in the **bottom-right corner** of every page:
- **Green** = Demo Mode Active ✅
- **Gray** = Live Mode (needs backend)

Click it to toggle between modes.
