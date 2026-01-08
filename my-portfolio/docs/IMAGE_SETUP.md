# Image Collage Setup Guide

This guide will help you set up the image collage feature with your existing images.

## Quick Setup (3 Steps)

### Step 1: Upload Images to GCS

Run the upload script to migrate your images from `public/me/` to Google Cloud Storage:

```bash
./scripts/upload-images-to-gcs.sh PROJECT_ID [BUCKET_NAME]
```

**Example:**
```bash
./scripts/upload-images-to-gcs.sh burnished-edge-481720-j3 rotating_image_collage_bucket
```

This script will:
- Create the bucket if it doesn't exist
- Upload all images from `public/me/landscape/` to `gs://BUCKET_NAME/collage/landscape/`
- Upload all images from `public/me/vertical/` to `gs://BUCKET_NAME/collage/vertical/`
- Set orientation metadata automatically

### Step 2: Grant IAM Permissions

Grant the Cloud Run service account access to read from the bucket:

```bash
./scripts/setup-collage-iam.sh PROJECT_ID SERVICE_NAME REGION BUCKET_NAME
```

**Example:**
```bash
./scripts/setup-collage-iam.sh burnished-edge-481720-j3 portfolio us-central1 rotating_image_collage_bucket
```

### Step 3: Deploy

If you haven't already, deploy your application:

```bash
./scripts/deploy-cloud-run.sh portfolio PROJECT_ID us-central1
```

Or push to GitHub if you have CI/CD set up - it will deploy automatically.

## Verify Setup

### Check Images in Bucket

```bash
# List all images
gsutil ls gs://rotating_image_collage_bucket/collage/**

# Count images
gsutil ls gs://rotating_image_collage_bucket/collage/landscape/** | wc -l
gsutil ls gs://rotating_image_collage_bucket/collage/vertical/** | wc -l
```

### Test API Locally

**Important:** You must authenticate before running the dev server locally.

1. **Authenticate with Google Cloud** (REQUIRED):
   ```bash
   gcloud auth application-default login
   ```
   This will open a browser window for you to authenticate. This is required for the app to access GCS locally.

2. Create `.env.local`:
   ```bash
   GCS_BUCKET=rotating_image_collage_bucket
   GCS_PREFIX=collage/
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Test manifest endpoint:
   ```bash
   curl http://localhost:3000/api/collage/manifest
   ```

**Note:** If you see "Could not load the default credentials" error, you need to run step 1 above.

## Troubleshooting

### "Bucket does not exist" error

The upload script will create the bucket automatically. If you see this error:
1. Check that the bucket name is correct
2. Verify you have Storage Admin permissions
3. Try creating the bucket manually:
   ```bash
   gsutil mb -p PROJECT_ID -l us-central1 gs://rotating_image_collage_bucket
   ```

### "Failed to fetch collage manifest" error

1. **Check bucket exists and has images:**
   ```bash
   gsutil ls gs://rotating_image_collage_bucket/collage/**
   ```

2. **Check IAM permissions:**
   ```bash
   # Find your service account
   gcloud run services describe SERVICE_NAME --region=REGION \
     --format="value(spec.template.spec.serviceAccountName)"
   
   # Grant permissions if needed
   ./scripts/setup-collage-iam.sh PROJECT_ID SERVICE_NAME REGION BUCKET_NAME
   ```

3. **Check environment variables in Cloud Run:**
   ```bash
   gcloud run services describe SERVICE_NAME --region=REGION \
     --format="value(spec.template.spec.containers[0].env)"
   ```
   
   Should show:
   ```
   GCS_BUCKET=rotating_image_collage_bucket
   GCS_PREFIX=collage/
   ```

4. **Check Cloud Run logs:**
   ```bash
   gcloud run services logs read SERVICE_NAME --region=REGION --limit=50
   ```
   
   Look for `[Manifest]` log entries to see what's happening.

### "No images available" on website

This means the manifest is empty. Check:
1. Images are uploaded to the correct prefix (`collage/`)
2. Images are in `landscape/` or `vertical/` subfolders
3. Bucket permissions are correct
4. Environment variables are set in Cloud Run

### Images not showing orientation correctly

The system detects orientation from:
1. Custom metadata (`x-goog-meta-orientation`)
2. Folder structure (`landscape/` = landscape, `vertical/` = portrait)
3. Filename patterns (`vert*` = portrait, `land*` = landscape)

To set metadata manually:
```bash
gsutil -h "x-goog-meta-orientation:landscape" cp image.jpg \
  gs://rotating_image_collage_bucket/collage/landscape/
```

## Manual Upload (Alternative)

If you prefer to upload manually:

```bash
# Upload landscape images
gsutil -m -h "x-goog-meta-orientation:landscape" \
  cp public/me/landscape/* \
  gs://rotating_image_collage_bucket/collage/landscape/

# Upload vertical images
gsutil -m -h "x-goog-meta-orientation:portrait" \
  cp public/me/vertical/* \
  gs://rotating_image_collage_bucket/collage/vertical/
```

## Folder Structure

The expected structure in GCS is:

```
gs://rotating_image_collage_bucket/
└── collage/
    ├── landscape/
    │   ├── land1.JPG
    │   ├── land2.jpg
    │   └── ...
    └── vertical/
        ├── vert1.jpg
        ├── vert2.jpg
        └── ...
```

The manifest API will automatically detect orientation based on the folder structure.
