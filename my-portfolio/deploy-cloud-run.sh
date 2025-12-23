#!/bin/bash

# Google Cloud Run Deployment Script for Next.js Dynamic Site
# Usage: ./deploy-cloud-run.sh [SERVICE_NAME] [PROJECT_ID] [REGION]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get parameters from arguments or prompt
SERVICE_NAME=${1:-""}
PROJECT_ID=${2:-""}
REGION=${3:-"us-central1"}

if [ -z "$SERVICE_NAME" ]; then
    echo -e "${YELLOW}Enter your Cloud Run service name (e.g., portfolio):${NC}"
    read SERVICE_NAME
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud project ID:${NC}"
    read PROJECT_ID
fi

# Convert service name to lowercase for Docker image (Docker requires lowercase)
IMAGE_NAME=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')

echo -e "${BLUE}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project "$PROJECT_ID"

# Check if billing is enabled
echo -e "${BLUE}Checking billing status...${NC}"
BILLING_ENABLED=$(gcloud billing projects describe "$PROJECT_ID" --format="value(billingAccountName)" 2>/dev/null || echo "")
if [ -z "$BILLING_ENABLED" ]; then
    echo -e "${RED}ERROR: Billing is not enabled for this project.${NC}"
    echo -e "${YELLOW}Please enable billing at: https://console.cloud.google.com/billing${NC}"
    echo -e "${YELLOW}Or run: gcloud billing accounts list${NC}"
    exit 1
fi

echo -e "${BLUE}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com --quiet || echo "Cloud Build API already enabled"
gcloud services enable run.googleapis.com --quiet || echo "Cloud Run API already enabled"
gcloud services enable containerregistry.googleapis.com --quiet || echo "Container Registry API already enabled"
gcloud services enable artifactregistry.googleapis.com --quiet || echo "Artifact Registry API already enabled"

# Check permissions
echo -e "${BLUE}Checking permissions...${NC}"
CURRENT_ACCOUNT=$(gcloud config get-value account)
echo -e "${BLUE}Current account: ${CURRENT_ACCOUNT}${NC}"

# Try to check if user has necessary permissions
echo -e "${YELLOW}Note: If you get permission errors, you may need to grant yourself the following roles:${NC}"
echo -e "${YELLOW}  - Cloud Build Editor (roles/cloudbuild.builds.editor)${NC}"
echo -e "${YELLOW}  - Service Account User (roles/iam.serviceAccountUser)${NC}"
echo -e "${YELLOW}  - Cloud Run Admin (roles/run.admin)${NC}"
echo -e "${YELLOW}Run: ./setup-permissions.sh ${PROJECT_ID}${NC}"
echo ""

echo -e "${BLUE}Building Docker image (using lowercase name: ${IMAGE_NAME})...${NC}"
if ! gcloud builds submit --tag gcr.io/${PROJECT_ID}/${IMAGE_NAME}; then
    echo -e "${RED}Build failed! This is likely a permissions issue.${NC}"
    echo -e "${YELLOW}Try running: ./setup-permissions.sh ${PROJECT_ID}${NC}"
    echo -e "${YELLOW}Or grant yourself the 'Owner' role in the Google Cloud Console:${NC}"
    echo -e "${YELLOW}  https://console.cloud.google.com/iam-admin/iam?project=${PROJECT_ID}${NC}"
    exit 1
fi

echo -e "${BLUE}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your service URL:${NC}"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'

