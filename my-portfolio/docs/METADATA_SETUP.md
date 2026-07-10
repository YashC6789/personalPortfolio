# Metadata and Social Sharing Setup

This document explains how to configure metadata for proper link previews and social sharing.

## Overview

The site is configured with:
- ✅ Professional branding (no "Create Next App" references)
- ✅ Custom favicon (`app/favicon.ico`)
- ✅ Open Graph metadata for social sharing
- ✅ Twitter Card metadata
- ✅ Web manifest for PWA support
- ✅ OG image (1200×630) for link previews

## Required Configuration

### Set Your Site URL

For proper link previews, you must set your Cloud Run service URL:

1. **Get your Cloud Run URL:**
   ```bash
   gcloud run services describe SERVICE_NAME --region=REGION --format="value(status.url)"
   ```

2. **Set it as an environment variable in Cloud Run:**
   ```bash
   gcloud run services update SERVICE_NAME \
     --region=REGION \
     --set-env-vars="NEXT_PUBLIC_SITE_URL=https://your-service-url.run.app"
   ```

3. **Or update `cloudbuild.yaml` to include it:**
   ```yaml
   - '--set-env-vars'
   - 'GCS_BUCKET=rotating_image_collage_bucket,GCS_PREFIX=,NEXT_PUBLIC_SITE_URL=https://your-service-url.run.app'
   ```

### Update Twitter Handle (Optional)

If you have a Twitter/X account, update the creator handle in `app/layout.tsx`:

```typescript
twitter: {
  creator: '@yourusername', // Update this
}
```

## Files Created/Modified

### Modified Files:
- `app/layout.tsx` - Complete metadata configuration

### Created Files:
- `public/og-image.png` - 1200×630 Open Graph image
- `public/site.webmanifest` - Web app manifest

## Verification

### Test Locally:
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. View page source and verify:
   - `<title>` shows "Yashkaran Chauhan | Portfolio"
   - Open Graph tags are present
   - Favicon link exists

### Test Social Previews:

**Twitter/X:**
- https://cards-dev.twitter.com/validator

**Facebook/LinkedIn:**
- https://www.linkedin.com/post-inspector/
- https://developers.facebook.com/tools/debug/

**General:**
- https://www.opengraph.xyz/

### Verify Files:
```bash
# Check favicon exists
curl -I http://localhost:3000/favicon.ico

# Check OG image exists
curl -I http://localhost:3000/og-image.png

# Check manifest exists
curl http://localhost:3000/site.webmanifest
```

## Current Metadata

- **Title**: "Yashkaran Chauhan | Portfolio"
- **Description**: Software engineer focused on building modern web applications...
- **OG Image**: `/og-image.png` (1200×630)
- **Favicon**: `/favicon.ico`
- **Site Name**: "Yashkaran Chauhan Portfolio"

## Troubleshooting

### Link previews not updating:
- Social media platforms cache previews aggressively
- Use their debug tools to force refresh:
  - Twitter: https://cards-dev.twitter.com/validator
  - Facebook: https://developers.facebook.com/tools/debug/
  - LinkedIn: https://www.linkedin.com/post-inspector/

### OG image not showing:
1. Verify `public/og-image.png` exists (1200×630)
2. Check `NEXT_PUBLIC_SITE_URL` is set correctly
3. Verify the image is accessible: `https://your-site.com/og-image.png`

### Favicon not showing:
1. Verify `app/favicon.ico` exists
2. Clear browser cache
3. Check browser console for 404 errors
