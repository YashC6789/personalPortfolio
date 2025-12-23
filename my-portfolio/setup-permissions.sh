#!/bin/bash

# Script to grant necessary IAM permissions for Cloud Run deployment
# Usage: ./setup-permissions.sh [PROJECT_ID] [EMAIL]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get parameters from arguments or prompt
PROJECT_ID=${1:-""}
EMAIL=${2:-""}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud project ID:${NC}"
    read PROJECT_ID
fi

if [ -z "$EMAIL" ]; then
    EMAIL=$(gcloud config get-value account)
    if [ -z "$EMAIL" ]; then
        echo -e "${YELLOW}Enter your Google account email:${NC}"
        read EMAIL
    else
        echo -e "${BLUE}Using current account: ${EMAIL}${NC}"
    fi
fi

echo -e "${BLUE}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project "$PROJECT_ID"

echo -e "${BLUE}Granting necessary IAM roles to ${EMAIL}...${NC}"

# Grant Cloud Build Editor role
echo -e "${YELLOW}Granting Cloud Build Editor role...${NC}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:${EMAIL}" \
    --role="roles/cloudbuild.builds.editor" \
    --condition=None || echo -e "${YELLOW}Note: You may need to be a project owner to grant roles${NC}"

# Grant Service Account User role
echo -e "${YELLOW}Granting Service Account User role...${NC}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:${EMAIL}" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None || echo -e "${YELLOW}Note: You may need to be a project owner to grant roles${NC}"

# Grant Cloud Run Admin role
echo -e "${YELLOW}Granting Cloud Run Admin role...${NC}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:${EMAIL}" \
    --role="roles/run.admin" \
    --condition=None || echo -e "${YELLOW}Note: You may need to be a project owner to grant roles${NC}"

# Grant Storage Admin role (for Container Registry)
echo -e "${YELLOW}Granting Storage Admin role (for Container Registry)...${NC}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:${EMAIL}" \
    --role="roles/storage.admin" \
    --condition=None || echo -e "${YELLOW}Note: You may need to be a project owner to grant roles${NC}"

# Grant Service Usage Admin (to enable APIs)
echo -e "${YELLOW}Granting Service Usage Admin role...${NC}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:${EMAIL}" \
    --role="roles/serviceusage.serviceUsageAdmin" \
    --condition=None || echo -e "${YELLOW}Note: You may need to be a project owner to grant roles${NC}"

echo -e "${GREEN}Permission setup complete!${NC}"
echo -e "${YELLOW}Note: If you're not a project owner, you may need to ask a project owner to grant these roles.${NC}"
echo -e "${YELLOW}Alternatively, you can grant yourself the 'Owner' role if you have access.${NC}"

