# MyHealthStatus Open Graph Image

This directory contains the Open Graph (OG) image assets for social media sharing.

## Files

1. **og-image.svg** - Vector version of the OG image (lightweight, scalable)
2. **og-image-generator.html** - HTML page to generate a PNG version
   - Open this file in a browser
   - Click "Download OG Image" to get the PNG file
   - Save the downloaded file as `og-image.png` in this directory

## Specifications

- Dimensions: 1200x630px (recommended for social media)
- Format: PNG or SVG
- Design: MyHealthStatus branding with shield icon, tagline, and trust badges

## Usage

The OG image is referenced in `index.html` meta tags:

```html
<meta property="og:image" content="https://yourdomain.com/og-image.png">
<meta property="twitter:image" content="https://yourdomain.com/og-image.png">
```

## Creating PNG Version

1. Open `og-image-generator.html` in your browser
2. The canvas will render the OG image
3. Click "Download OG Image" button
4. Save the file as `og-image.png`
5. Place it in the `/public` directory

## Notes

- SVG version is currently used as a placeholder
- For production, generate and use PNG version for better social media compatibility
- Update the URL in `index.html` to match your domain
