#!/bin/bash

# Google App Engine Deployment Script for Next.js
# Usage: ./scripts/deploy-app-engine.sh [PROJECT_ID]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project ID from arguments or prompt
PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud project ID:${NC}"
    read PROJECT_ID
fi

echo -e "${BLUE}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project "$PROJECT_ID"

echo -e "${BLUE}Enabling App Engine API...${NC}"
gcloud services enable appengine.googleapis.com

echo -e "${BLUE}Creating App Engine app (if it doesn't exist)...${NC}"
gcloud app create --region=us-central || echo "App Engine app already exists"

echo -e "${BLUE}Building and deploying to App Engine...${NC}"
gcloud app deploy app.yaml --project="$PROJECT_ID"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your app URL:${NC}"
gcloud app browse --project="$PROJECT_ID"


