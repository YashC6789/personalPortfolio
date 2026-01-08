#!/bin/bash

# Script to set up automatic deployment from GitHub to Cloud Run
# Usage: ./scripts/setup-github-trigger.sh [PROJECT_ID] [SERVICE_NAME] [REGION] [REPO_NAME] [BRANCH]

# Don't exit on error - we want to show helpful messages
set +e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get parameters from arguments or prompt
PROJECT_ID=${1:-""}
SERVICE_NAME=${2:-""}
REGION=${3:-"us-central1"}
REPO_NAME=${4:-""}
BRANCH=${5:-"main"}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud project ID:${NC}"
    read PROJECT_ID
fi

if [ -z "$SERVICE_NAME" ]; then
    echo -e "${YELLOW}Enter your Cloud Run service name (e.g., portfolio):${NC}"
    read SERVICE_NAME
fi

if [ -z "$REPO_NAME" ]; then
    echo -e "${YELLOW}Enter your GitHub repository name (format: owner/repo, e.g., username/personalPortfolio):${NC}"
    read REPO_NAME
fi

echo -e "${BLUE}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project "$PROJECT_ID"

# Convert service name to lowercase for image name
IMAGE_NAME=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')

# Enable required APIs
echo -e "${BLUE}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com --quiet || echo "Cloud Build API already enabled"
gcloud services enable run.googleapis.com --quiet || echo "Cloud Run API already enabled"
gcloud services enable containerregistry.googleapis.com --quiet || echo "Container Registry API already enabled"

# Check if cloudbuild.yaml exists
if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}ERROR: cloudbuild.yaml not found in current directory${NC}"
    echo -e "${YELLOW}Make sure you're running this script from the project root directory${NC}"
    exit 1
fi

# Extract owner and repo from REPO_NAME
REPO_OWNER=$(echo "$REPO_NAME" | cut -d'/' -f1)
REPO=$(echo "$REPO_NAME" | cut -d'/' -f2)

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  GitHub CI/CD Setup for Cloud Run${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}IMPORTANT: Repository must be connected first!${NC}"
echo ""
echo -e "${BLUE}Step 1: Connect your GitHub repository${NC}"
echo -e "${YELLOW}Go to the Cloud Build Console and connect your repository:${NC}"
echo -e "${BLUE}  https://console.cloud.google.com/cloud-build/triggers/connect?project=${PROJECT_ID}${NC}"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo -e "  1. Click 'Connect Repository'"
echo -e "  2. Select 'GitHub (Cloud Build GitHub App)'"
echo -e "  3. Authenticate with GitHub"
echo -e "  4. Select repository: ${REPO_NAME}"
echo -e "  5. Click 'Connect'"
echo ""
echo -e "${YELLOW}Press Enter after you've connected the repository...${NC}"
read -r

echo ""
echo -e "${BLUE}Step 2: Creating Cloud Build trigger...${NC}"

# Convert service name to lowercase for Docker image
IMAGE_NAME=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')

# Try to create the trigger
TRIGGER_OUTPUT=$(gcloud builds triggers create github \
    --name="deploy-${SERVICE_NAME}" \
    --repo-name="${REPO}" \
    --repo-owner="${REPO_OWNER}" \
    --branch-pattern="^${BRANCH}$" \
    --build-config="cloudbuild.yaml" \
    --substitutions="_SERVICE_NAME=${SERVICE_NAME},_IMAGE_NAME=${IMAGE_NAME},_REGION=${REGION}" \
    --description="Auto-deploy ${SERVICE_NAME} from GitHub on push to ${BRANCH} branch" 2>&1)

TRIGGER_EXIT_CODE=$?

if [ $TRIGGER_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ GitHub trigger created successfully!${NC}"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Setup Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Now whenever you push to the '${BRANCH}' branch of ${REPO_NAME},${NC}"
    echo -e "${BLUE}Cloud Build will automatically:${NC}"
    echo -e "  1. Build your Docker image"
    echo -e "  2. Deploy to Cloud Run"
    echo ""
    echo -e "${YELLOW}To test, make a change and push to GitHub:${NC}"
    echo -e "  git add ."
    echo -e "  git commit -m 'Test auto-deploy'"
    echo -e "  git push origin ${BRANCH}"
    echo ""
    echo -e "${BLUE}Monitor builds at:${NC}"
    echo -e "  https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}"
else
    echo -e "${RED}✗ Failed to create trigger via CLI${NC}"
    echo ""
    echo -e "${YELLOW}Error details:${NC}"
    echo "$TRIGGER_OUTPUT" | head -5
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Manual Setup Instructions${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Set up the trigger manually via the Console:${NC}"
    echo -e "${BLUE}  https://console.cloud.google.com/cloud-build/triggers/add?project=${PROJECT_ID}${NC}"
    echo ""
    echo -e "${YELLOW}Configuration details:${NC}"
    echo -e "  • Name: ${GREEN}deploy-${SERVICE_NAME}${NC}"
    echo -e "  • Event: ${GREEN}Push to a branch${NC}"
    echo -e "  • Branch: ${GREEN}^${BRANCH}$${NC}"
    echo -e "  • Configuration: ${GREEN}Cloud Build configuration file${NC}"
    echo -e "  • Location: ${GREEN}cloudbuild.yaml${NC}"
    echo -e "  • Substitution variables:"
    echo -e "    - ${GREEN}_SERVICE_NAME${NC}: ${SERVICE_NAME}"
    echo -e "    - ${GREEN}_IMAGE_NAME${NC}: ${IMAGE_NAME} (lowercase)"
    echo -e "    - ${GREEN}_REGION${NC}: ${REGION}"
    echo ""
    echo -e "${YELLOW}After creating the trigger, your setup will be complete!${NC}"
    exit 1
fi

