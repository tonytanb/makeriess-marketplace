#!/usr/bin/env node

/**
 * Generate placeholder PWA icons
 * 
 * This script creates simple placeholder icons for the PWA.
 * Replace these with actual branded icons before production.
 * 
 * Usage: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const BRAND_COLOR = '#10b981'; // emerald-600

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Create SVG template
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BRAND_COLOR}" rx="${size * 0.15}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.5}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >M</text>
</svg>`;
}

console.log('Generating placeholder PWA icons...\n');

ICON_SIZES.forEach(size => {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICONS_DIR, filename);
  const svg = createSVG(size);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Created ${filename}`);
});

console.log('\n✅ Placeholder icons generated successfully!');
console.log('\n⚠️  Note: These are placeholder icons. Replace with actual branded icons before production.');
console.log('   See public/icons/README.md for more information.\n');
