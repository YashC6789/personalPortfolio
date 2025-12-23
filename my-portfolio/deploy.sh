#!/bin/bash

# Google Cloud Storage Deployment Script for Next.js Static Site
# Usage: ./deploy.sh [BUCKET_NAME] [PROJECT_ID]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get bucket name and project ID from arguments or prompt
BUCKET_NAME=${1:-""}
PROJECT_ID=${2:-""}

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${YELLOW}Enter your Google Cloud Storage bucket name:${NC}"
    read BUCKET_NAME
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud project ID:${NC}"
    read PROJECT_ID
fi

echo -e "${BLUE}Building Next.js static site...${NC}"
npm run build

echo -e "${BLUE}Checking if bucket exists...${NC}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo -e "${YELLOW}Bucket doesn't exist. Creating bucket: ${BUCKET_NAME}${NC}"
    gsutil mb -p "${PROJECT_ID}" "gs://${BUCKET_NAME}"
    
    echo -e "${BLUE}Configuring bucket for static website hosting...${NC}"
    gsutil web set -m index.html -e 404.html "gs://${BUCKET_NAME}"
    
    echo -e "${BLUE}Setting public access...${NC}"
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
else
    echo -e "${GREEN}Bucket already exists.${NC}"
fi

echo -e "${BLUE}Uploading files to bucket...${NC}"
gsutil -m rsync -r -d out/ "gs://${BUCKET_NAME}/"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your site should be available at:${NC}"
echo -e "${BLUE}https://storage.googleapis.com/${BUCKET_NAME}/index.html${NC}"
echo -e "${BLUE}Or if you have a custom domain:${NC}"
echo -e "${BLUE}https://${BUCKET_NAME}.storage.googleapis.com${NC}"


