# PWA Icons

This directory contains the Progressive Web App icons for Makeriess.

## Required Icons

The following icon sizes are required for the PWA manifest:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Icon Guidelines

1. **Design**: Use the Makeriess logo with the brand color (#10b981 - emerald-600)
2. **Format**: PNG with transparent background
3. **Safe Area**: Keep important content within 80% of the icon area
4. **Maskable**: Icons should work with circular masks on Android

## Generating Icons

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Adobe Photoshop/Illustrator with export presets

## Example Command

```bash
npx pwa-asset-generator logo.svg public/icons --icon-only --background "#10b981"
```

## Current Status

⚠️ Placeholder icons need to be replaced with actual Makeriess branding.

For now, you can create simple colored squares with the Makeriess "M" logo or use a design tool to generate proper icons.
