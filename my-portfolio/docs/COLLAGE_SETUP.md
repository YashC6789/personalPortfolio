# Private Image Collage Setup

This document explains how the private Google Cloud Storage image collage system works.

## Overview

The image collage fetches images from a private GCS bucket (`rotating_image_collage_bucket`) through secure backend API endpoints. Images are never exposed directly from GCS - they are streamed through the Next.js backend.

## Architecture

1. **Frontend** (`components/ImageCollage.tsx`):
   - Fetches manifest from `/api/collage/manifest`
   - Displays images using `/api/collage/image?key=...`
   - Enforces 3:1 landscape-to-portrait ratio per column
   - Rotates images every 20 seconds

2. **Backend API Routes**:
   - `GET /api/collage/manifest`: Returns curated list of available images
   - `GET /api/collage/image?key=...`: Streams image bytes from GCS

3. **Security**:
   - Bucket remains private
   - Backend validates all keys against allowlist
   - Path traversal protection
   - Only objects under `collage/` prefix are accessible

## Environment Variables

### Required (Production)

Set these in Cloud Run service configuration:

- `GCS_BUCKET`: `rotating_image_collage_bucket` (default)
- `GCS_PREFIX`: `collage/` (default)

### Local Development

For local development, create a `.env.local` file:

```bash
GCS_BUCKET=rotating_image_collage_bucket
GCS_PREFIX=collage/
```

Then authenticate using Application Default Credentials:

```bash
gcloud auth application-default login
```

## IAM Requirements

The Cloud Run service account needs the following role on the bucket:

```bash
# Grant storage.objectViewer role to the Cloud Run service account
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectViewer"
```

To find your Cloud Run service account:

```bash
gcloud run services describe SERVICE_NAME \
  --region=REGION \
  --format="value(spec.template.spec.serviceAccountName)"
```

If no service account is specified, Cloud Run uses the Compute Engine default service account:
`PROJECT_NUMBER-compute@developer.gserviceaccount.com`

## Image Organization

Images should be organized in the bucket as:

```
gs://rotating_image_collage_bucket/
  collage/
    landscape/
      image1.jpg
      image2.jpg
    portrait/
      image1.jpg
      image2.jpg
```

Or flat structure:

```
gs://rotating_image_collage_bucket/
  collage/
    image1.jpg
    image2.jpg
```

## Image Metadata

For best results, set custom metadata on GCS objects:

```bash
gsutil -h "x-goog-meta-orientation:landscape" cp image.jpg gs://rotating_image_collage_bucket/collage/
gsutil -h "x-goog-meta-orientation:portrait" cp image.jpg gs://rotating_image_collage_bucket/collage/
```

Alternatively, orientation is derived from:
1. Custom metadata `orientation` field
2. Image dimensions (width > height = landscape)
3. Filename patterns (vert/portrait/port = portrait)

## 3:1 Ratio Pattern

Each column follows a strict pattern:
- 3 landscape images
- 1 portrait image
- Repeating

This ensures visual balance while maintaining the collage aesthetic.

## Security Notes

### Important Security Considerations

1. **Images are still downloadable**: While the bucket is private, images served through the API are visible in the browser and can be downloaded by users. This is expected behavior for a portfolio website.

2. **No signed URLs**: Images are streamed directly through the backend, avoiding the complexity and potential security issues of signed URLs.

3. **Allowlist validation**: Only images listed in the manifest (from bucket listing) can be accessed, preventing arbitrary bucket access.

4. **Path traversal protection**: Keys are validated to prevent `../` and other traversal patterns.

5. **Rate limiting**: Consider adding rate limiting in production if needed. The current implementation relies on Cloud Run's built-in request limits.

## Deployment

The environment variables are automatically set in `cloudbuild.yaml`. No additional deployment steps are required beyond:

1. Ensuring the service account has `roles/storage.objectViewer` on the bucket
2. Uploading images to `gs://rotating_image_collage_bucket/collage/`
3. Setting metadata if desired

## Troubleshooting

### Images not loading

1. Check service account permissions:
   ```bash
   gcloud projects get-iam-policy PROJECT_ID \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:SERVICE_ACCOUNT"
   ```

2. Verify bucket and prefix:
   ```bash
   gsutil ls gs://rotating_image_collage_bucket/collage/
   ```

3. Check Cloud Run logs:
   ```bash
   gcloud run services logs read SERVICE_NAME --region=REGION
   ```

### Manifest empty

- Ensure images are under the `collage/` prefix
- Check that files are not directories (ending with `/`)
- Verify bucket name matches `GCS_BUCKET` environment variable

### 403 Forbidden on image requests

- Check that the key exists in the manifest
- Verify key validation isn't rejecting valid keys
- Check service account has `storage.objectViewer` role


