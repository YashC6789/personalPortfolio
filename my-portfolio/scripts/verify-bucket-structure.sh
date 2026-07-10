#!/bin/bash

# Script to verify GCS bucket structure and list images
# Usage: ./scripts/verify-bucket-structure.sh [PROJECT_ID] [BUCKET_NAME]

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
GCS_PREFIX=""  # Empty prefix - images are directly in landscape/ and vertical/

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: No project ID provided or set${NC}"
        echo "Usage: ./scripts/verify-bucket-structure.sh [PROJECT_ID] [BUCKET_NAME]"
        exit 1
    fi
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Verifying GCS Bucket Structure${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Project:${NC} ${PROJECT_ID}"
echo -e "${YELLOW}Bucket:${NC} ${BUCKET_NAME}"
if [ -z "$GCS_PREFIX" ]; then
    echo -e "${YELLOW}Expected Structure:${NC} Directly in landscape/ and vertical/ folders"
else
    echo -e "${YELLOW}Expected Prefix:${NC} ${GCS_PREFIX}"
fi
echo ""

# Set project
gcloud config set project "$PROJECT_ID" --quiet

# Check if bucket exists
echo -e "${BLUE}Checking if bucket exists...${NC}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo -e "${RED}✗ Bucket does not exist: gs://${BUCKET_NAME}${NC}"
    echo ""
    echo -e "${YELLOW}Create it with:${NC}"
    echo "  gsutil mb -p ${PROJECT_ID} -l us-central1 gs://${BUCKET_NAME}"
    exit 1
fi
echo -e "${GREEN}✓ Bucket exists${NC}"
echo ""

# List all files in bucket (to see actual structure)
echo -e "${BLUE}All files in bucket (first 20):${NC}"
gsutil ls "gs://${BUCKET_NAME}/**" 2>/dev/null | head -20 || echo -e "${YELLOW}No files found${NC}"
echo ""

# Check for files in landscape/ and vertical/ folders
echo -e "${BLUE}Checking for images in landscape/ and vertical/ folders:${NC}"
LANDSCAPE_FILES=$(gsutil ls "gs://${BUCKET_NAME}/landscape/**" 2>/dev/null | grep -v "/$" | wc -l | tr -d ' ')
VERTICAL_FILES=$(gsutil ls "gs://${BUCKET_NAME}/vertical/**" 2>/dev/null | grep -v "/$" | wc -l | tr -d ' ')
TOTAL_FILES=$((LANDSCAPE_FILES + VERTICAL_FILES))

if [ "$TOTAL_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ${TOTAL_FILES} files (${LANDSCAPE_FILES} landscape, ${VERTICAL_FILES} vertical)${NC}"
    echo ""
    echo -e "${BLUE}Sample files:${NC}"
    gsutil ls "gs://${BUCKET_NAME}/landscape/**" 2>/dev/null | head -5
    gsutil ls "gs://${BUCKET_NAME}/vertical/**" 2>/dev/null | head -5
else
    echo -e "${RED}✗ No image files found in landscape/ or vertical/ folders${NC}"
    echo ""
    echo -e "${YELLOW}Checking for files in alternative locations...${NC}"
    
    # Check for files under collage/ prefix (old structure)
    if gsutil ls "gs://${BUCKET_NAME}/collage/landscape/**" 2>/dev/null | head -1 | grep -q .; then
        echo -e "${YELLOW}⚠ Found files under gs://${BUCKET_NAME}/collage/landscape/ (old structure)${NC}"
        echo -e "${YELLOW}  Expected: gs://${BUCKET_NAME}/landscape/${NC}"
    fi
    
    if gsutil ls "gs://${BUCKET_NAME}/collage/vertical/**" 2>/dev/null | head -1 | grep -q .; then
        echo -e "${YELLOW}⚠ Found files under gs://${BUCKET_NAME}/collage/vertical/ (old structure)${NC}"
        echo -e "${YELLOW}  Expected: gs://${BUCKET_NAME}/vertical/${NC}"
    fi
fi
echo ""

# Count by folder (already calculated above)
echo -e "${BLUE}File counts by folder:${NC}"
echo -e "  Landscape: ${LANDSCAPE_FILES} files"
echo -e "  Vertical: ${VERTICAL_FILES} files"
echo ""

# Summary
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
if [ "$TOTAL_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓ Bucket structure looks correct!${NC}"
    echo ""
    echo -e "${YELLOW}If images still don't show:${NC}"
    echo "1. Check Cloud Run logs for errors"
    echo "2. Verify IAM permissions are set"
    echo "3. Check environment variables in Cloud Run (GCS_PREFIX should be empty or not set)"
else
    echo -e "${RED}✗ No image files found${NC}"
    echo ""
    echo -e "${YELLOW}To fix:${NC}"
    echo "1. Upload images using: ./scripts/upload-images-to-gcs.sh ${PROJECT_ID} ${BUCKET_NAME}"
    echo "2. Or manually upload to: gs://${BUCKET_NAME}/landscape/ and gs://${BUCKET_NAME}/vertical/"
fi
echo ""
