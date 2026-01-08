#!/bin/bash

# Script to set up IAM permissions for the image collage feature
# Usage: ./scripts/setup-collage-iam.sh [PROJECT_ID] [SERVICE_NAME] [REGION] [BUCKET_NAME]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get parameters
PROJECT_ID=${1:-""}
SERVICE_NAME=${2:-"portfolio"}
REGION=${3:-"us-central1"}
BUCKET_NAME=${4:-"rotating_image_collage_bucket"}

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: No project ID provided or set${NC}"
        echo "Usage: ./scripts/setup-collage-iam.sh [PROJECT_ID] [SERVICE_NAME] [REGION] [BUCKET_NAME]"
        exit 1
    fi
fi

echo -e "${BLUE}Setting up IAM permissions for image collage...${NC}"
echo -e "${YELLOW}Project:${NC} ${PROJECT_ID}"
echo -e "${YELLOW}Service:${NC} ${SERVICE_NAME}"
echo -e "${YELLOW}Region:${NC} ${REGION}"
echo -e "${YELLOW}Bucket:${NC} ${BUCKET_NAME}"
echo ""

# Get Cloud Run service account
echo -e "${BLUE}Finding Cloud Run service account...${NC}"
SERVICE_ACCOUNT=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(spec.template.spec.serviceAccountName)" 2>/dev/null || echo "")

if [ -z "$SERVICE_ACCOUNT" ]; then
    echo -e "${YELLOW}No custom service account found, using default...${NC}"
    PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null)
    if [ -z "$PROJECT_NUMBER" ]; then
        echo -e "${RED}Failed to get project number${NC}"
        exit 1
    fi
    SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi

echo -e "${BLUE}Service Account:${NC} ${SERVICE_ACCOUNT}"
echo ""

# Grant storage.objectViewer role on the bucket
echo -e "${BLUE}Granting storage.objectViewer role on bucket...${NC}"
if gsutil iam ch "serviceAccount:${SERVICE_ACCOUNT}:objectViewer" "gs://${BUCKET_NAME}"; then
    echo -e "${GREEN}✓ IAM permissions granted successfully${NC}"
else
    echo -e "${RED}✗ Failed to grant permissions${NC}"
    echo -e "${YELLOW}You may need to grant permissions manually:${NC}"
    echo ""
    echo "gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectViewer gs://${BUCKET_NAME}"
    echo ""
    echo "Or using gcloud:"
    echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
    echo "  --member=\"serviceAccount:${SERVICE_ACCOUNT}\" \\"
    echo "  --role=\"roles/storage.objectViewer\""
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload images to: gs://${BUCKET_NAME}/collage/"
echo "2. Set metadata (optional):"
echo "   gsutil -h \"x-goog-meta-orientation:landscape\" cp image.jpg gs://${BUCKET_NAME}/collage/"
echo "3. Deploy your application"
echo "4. Verify the collage loads at your website"


