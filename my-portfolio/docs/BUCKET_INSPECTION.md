# How to Inspect Your GCS Bucket Structure

This guide shows you how to check your bucket structure and verify images are in the correct location.

## Quick Check (Recommended)

Use the verification script:

```bash
./scripts/verify-bucket-structure.sh PROJECT_ID [BUCKET_NAME]
```

This will show you:
- Whether the bucket exists
- All files in the bucket
- Files under the expected `collage/` prefix
- File counts by folder
- Warnings if files are in wrong locations

## Manual Inspection Commands

### 1. List All Files in Bucket

```bash
# List everything (shows full paths)
gsutil ls gs://rotating_image_collage_bucket/**

# List with details (size, date)
gsutil ls -l gs://rotating_image_collage_bucket/**
```

### 2. Check Files Under Expected Prefix

```bash
# Check if files exist under collage/ prefix (CORRECT location)
gsutil ls gs://rotating_image_collage_bucket/collage/**

# Check landscape folder specifically
gsutil ls gs://rotating_image_collage_bucket/collage/landscape/**

# Check vertical folder specifically
gsutil ls gs://rotating_image_collage_bucket/collage/vertical/**
```

### 3. Check for Files in Wrong Location

```bash
# Check if files are directly under landscape/ (WRONG - missing collage/ prefix)
gsutil ls gs://rotating_image_collage_bucket/landscape/**

# Check if files are directly under vertical/ (WRONG - missing collage/ prefix)
gsutil ls gs://rotating_image_collage_bucket/vertical/**
```

### 4. Count Files

```bash
# Count all files under collage/ prefix
gsutil ls gs://rotating_image_collage_bucket/collage/** | wc -l

# Count landscape images
gsutil ls gs://rotating_image_collage_bucket/collage/landscape/** | wc -l

# Count vertical images
gsutil ls gs://rotating_image_collage_bucket/collage/vertical/** | wc -l
```

### 5. See Folder Structure (Tree View)

```bash
# Show directory structure
gsutil ls -r gs://rotating_image_collage_bucket/

# Or just show top-level directories
gsutil ls gs://rotating_image_collage_bucket/
```

## Expected Structure

**✅ CORRECT:**
```
gs://rotating_image_collage_bucket/
└── collage/
    ├── landscape/
    │   ├── land1.JPG
    │   ├── land2.jpg
    │   └── ...
    └── vertical/
        ├── vert1.jpg
        ├── vert2.JPG
        └── ...
```

**❌ WRONG (missing collage/ prefix):**
```
gs://rotating_image_collage_bucket/
├── landscape/
│   ├── land1.JPG
│   └── ...
└── vertical/
    ├── vert1.jpg
    └── ...
```

## Common Issues

### Issue 1: Files in Wrong Location

If you see files like:
```
gs://bucket/landscape/land1.JPG
gs://bucket/vertical/vert1.jpg
```

But NOT:
```
gs://bucket/collage/landscape/land1.JPG
gs://bucket/collage/vertical/vert1.jpg
```

**Fix:** Move files to correct location:
```bash
# Create collage/ directory structure if needed
gsutil -m cp -r gs://bucket/landscape gs://bucket/collage/landscape
gsutil -m cp -r gs://bucket/vertical gs://bucket/collage/vertical

# Then delete old location (after verifying copy worked)
gsutil -m rm -r gs://bucket/landscape
gsutil -m rm -r gs://bucket/vertical
```

### Issue 2: No Files Found

If `gsutil ls gs://bucket/collage/**` returns nothing:

1. Check if bucket name is correct
2. Verify you uploaded images
3. Use the upload script: `./scripts/upload-images-to-gcs.sh PROJECT_ID`

### Issue 3: Files Are Directories

If you see entries ending with `/`, those are directories, not files. The manifest API skips directories.

## Quick Diagnostic Commands

Run these to get a complete picture:

```bash
# 1. Check bucket exists
gsutil ls -b gs://rotating_image_collage_bucket

# 2. See all top-level folders
gsutil ls gs://rotating_image_collage_bucket/

# 3. Check for collage/ folder
gsutil ls gs://rotating_image_collage_bucket/collage/

# 4. Count files in correct location
echo "Landscape: $(gsutil ls gs://rotating_image_collage_bucket/collage/landscape/** 2>/dev/null | wc -l)"
echo "Vertical: $(gsutil ls gs://rotating_image_collage_bucket/collage/vertical/** 2>/dev/null | wc -l)"

# 5. Check for files in wrong location
echo "Wrong location (landscape): $(gsutil ls gs://rotating_image_collage_bucket/landscape/** 2>/dev/null | wc -l)"
echo "Wrong location (vertical): $(gsutil ls gs://rotating_image_collage_bucket/vertical/** 2>/dev/null | wc -l)"
```

## Using Google Cloud Console

You can also inspect the bucket visually:

1. Go to [Google Cloud Console - Storage](https://console.cloud.google.com/storage)
2. Select your project
3. Click on your bucket: `rotating_image_collage_bucket`
4. Navigate through folders to see the structure
5. Look for the `collage/` folder and verify `landscape/` and `vertical/` are inside it

## Next Steps

After verifying your structure:

1. If files are in wrong location → Move them (see Issue 1 above)
2. If no files found → Upload them using `./scripts/upload-images-to-gcs.sh`
3. If structure is correct → Check IAM permissions and Cloud Run logs
