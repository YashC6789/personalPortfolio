# Private Image Collage - Quick Start

## Overview

The image collage now fetches images from a private Google Cloud Storage bucket through secure backend API endpoints. The bucket remains private - images are streamed through the Next.js backend.

## Quick Setup (3 Steps)

### 1. Grant IAM Permissions

Run the setup script:

```bash
./scripts/setup-collage-iam.sh PROJECT_ID portfolio us-central1 rotating_image_collage_bucket
```

Or manually:

```bash
# Find your service account
SERVICE_ACCOUNT=$(gcloud run services describe portfolio \
  --region=us-central1 \
  --format="value(spec.template.spec.serviceAccountName)")

# If empty, use default
if [ -z "$SERVICE_ACCOUNT" ]; then
  PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
  SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi

# Grant permission
gsutil iam ch "serviceAccount:${SERVICE_ACCOUNT}:objectViewer" \
  gs://rotating_image_collage_bucket
```

### 2. Upload Images

```bash
# Upload to collage/ prefix
gsutil -m cp -r your-images/* gs://rotating_image_collage_bucket/collage/

# Optional: Set orientation metadata
gsutil -h "x-goog-meta-orientation:landscape" cp image.jpg \
  gs://rotating_image_collage_bucket/collage/
```

### 3. Deploy

Push to GitHub - deployment is automatic via Cloud Build trigger.

## How It Works

1. **Frontend** fetches manifest: `GET /api/collage/manifest`
2. **Backend** lists objects from private GCS bucket
3. **Frontend** displays images using: `GET /api/collage/image?key=...`
4. **Backend** streams image bytes from GCS
5. **Pattern**: Each column follows 3 landscape → 1 portrait ratio

## Environment Variables

Already configured in `cloudbuild.yaml`:
- `GCS_BUCKET=rotating_image_collage_bucket`
- `GCS_PREFIX=collage/`

For local development, create `.env.local`:
```
GCS_BUCKET=rotating_image_collage_bucket
GCS_PREFIX=collage/
```

Then run: `gcloud auth application-default login`

## Security

- ✅ Bucket remains private
- ✅ Backend validates all keys
- ✅ Path traversal protection
- ✅ Allowlist validation
- ⚠️ Images are still downloadable by users (expected for portfolio)

## Testing

```bash
# Run validation tests
node app/api/collage/__tests__/validation.test.ts

# Test locally
npm run dev
# Visit: http://localhost:3000/api/collage/manifest
```

## Documentation

- **Full Setup**: See `docs/COLLAGE_SETUP.md`
- **Implementation Details**: See `docs/IMPLEMENTATION_SUMMARY.md`


