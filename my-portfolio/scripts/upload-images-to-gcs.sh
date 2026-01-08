#!/bin/bash

# Script to upload images from public/me/ to Google Cloud Storage bucket
# Usage: ./scripts/upload-images-to-gcs.sh [PROJECT_ID] [BUCKET_NAME]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get parameters
PROJECT_ID=${1:-""}
BUCKET_NAME=${2:-"rotating_image_collage_bucket"}
GCS_PREFIX="collage/"

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: No project ID provided or set${NC}"
        echo "Usage: ./scripts/upload-images-to-gcs.sh [PROJECT_ID] [BUCKET_NAME]"
        exit 1
    fi
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Upload Images to GCS Bucket${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Project:${NC} ${PROJECT_ID}"
echo -e "${YELLOW}Bucket:${NC} ${BUCKET_NAME}"
echo -e "${YELLOW}Prefix:${NC} ${GCS_PREFIX}"
echo ""

# Set project
gcloud config set project "$PROJECT_ID" --quiet

# Check if bucket exists, create if not
echo -e "${BLUE}Checking if bucket exists...${NC}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo -e "${YELLOW}Bucket doesn't exist. Creating bucket: ${BUCKET_NAME}${NC}"
    gsutil mb -p "$PROJECT_ID" -l us-central1 "gs://${BUCKET_NAME}"
    echo -e "${GREEN}✓ Bucket created${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Check if images directory exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGES_DIR="$PROJECT_ROOT/public/me"

if [ ! -d "$IMAGES_DIR" ]; then
    echo -e "${RED}Error: Images directory not found at ${IMAGES_DIR}${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Uploading landscape images...${NC}"
if [ -d "$IMAGES_DIR/landscape" ]; then
    # Upload landscape images with orientation metadata
    gsutil -m -h "x-goog-meta-orientation:landscape" \
        cp "$IMAGES_DIR/landscape"/* \
        "gs://${BUCKET_NAME}/${GCS_PREFIX}landscape/" 2>/dev/null || {
        echo -e "${YELLOW}Note: Some files may have failed to upload${NC}"
    }
    LANDSCAPE_COUNT=$(ls -1 "$IMAGES_DIR/landscape" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Uploaded ${LANDSCAPE_COUNT} landscape images${NC}"
else
    echo -e "${YELLOW}⚠ No landscape directory found${NC}"
fi

echo ""
echo -e "${BLUE}Uploading vertical/portrait images...${NC}"
if [ -d "$IMAGES_DIR/vertical" ]; then
    # Upload vertical images with orientation metadata
    gsutil -m -h "x-goog-meta-orientation:portrait" \
        cp "$IMAGES_DIR/vertical"/* \
        "gs://${BUCKET_NAME}/${GCS_PREFIX}vertical/" 2>/dev/null || {
        echo -e "${YELLOW}Note: Some files may have failed to upload${NC}"
    }
    VERTICAL_COUNT=$(ls -1 "$IMAGES_DIR/vertical" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Uploaded ${VERTICAL_COUNT} vertical images${NC}"
else
    echo -e "${YELLOW}⚠ No vertical directory found${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Upload Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Images are now available at:${NC}"
echo -e "  gs://${BUCKET_NAME}/${GCS_PREFIX}landscape/"
echo -e "  gs://${BUCKET_NAME}/${GCS_PREFIX}vertical/"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Grant IAM permissions to Cloud Run service account:"
echo "   ./scripts/setup-collage-iam.sh ${PROJECT_ID} portfolio us-central1 ${BUCKET_NAME}"
echo ""
echo "2. Verify images are accessible:"
echo "   gsutil ls gs://${BUCKET_NAME}/${GCS_PREFIX}**"
echo ""
