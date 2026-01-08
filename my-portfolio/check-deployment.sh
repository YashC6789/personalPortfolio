#!/bin/bash

# Quick deployment status checker
# Usage: ./check-deployment.sh [SERVICE_NAME] [REGION] [PROJECT_ID]

set +e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get parameters
SERVICE_NAME=${1:-"portfolio"}
REGION=${2:-"us-central1"}
PROJECT_ID=${3:-""}

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: No project ID provided or set${NC}"
        echo "Usage: ./check-deployment.sh [SERVICE_NAME] [REGION] [PROJECT_ID]"
        exit 1
    fi
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Deployment Status Check${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Set project
gcloud config set project "$PROJECT_ID" --quiet >/dev/null 2>&1

echo -e "${YELLOW}Project:${NC} ${PROJECT_ID}"
echo -e "${YELLOW}Service:${NC} ${SERVICE_NAME}"
echo -e "${YELLOW}Region:${NC} ${REGION}"
echo ""

# Check recent builds
echo -e "${BLUE}=== Recent Builds (Last 3) ===${NC}"
BUILDS=$(gcloud builds list --limit=3 --format="table(id,status,createTime,source.repoSource.branchName)" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$BUILDS" ]; then
    echo "$BUILDS"
    
    # Get latest build status
    LATEST_STATUS=$(gcloud builds list --limit=1 --format="value(status)" 2>/dev/null)
    LATEST_ID=$(gcloud builds list --limit=1 --format="value(id)" 2>/dev/null)
    
    if [ -n "$LATEST_STATUS" ]; then
        echo ""
        echo -e "${YELLOW}Latest Build:${NC}"
        echo -e "  ID: ${LATEST_ID}"
        if [ "$LATEST_STATUS" = "SUCCESS" ]; then
            echo -e "  Status: ${GREEN}✓ SUCCESS${NC}"
        elif [ "$LATEST_STATUS" = "FAILURE" ]; then
            echo -e "  Status: ${RED}✗ FAILURE${NC}"
            echo -e "  ${YELLOW}View logs:${NC} gcloud builds log ${LATEST_ID}"
        elif [ "$LATEST_STATUS" = "WORKING" ] || [ "$LATEST_STATUS" = "QUEUED" ]; then
            echo -e "  Status: ${YELLOW}⏳ ${LATEST_STATUS}${NC}"
        else
            echo -e "  Status: ${LATEST_STATUS}"
        fi
    fi
else
    echo -e "${YELLOW}No builds found${NC}"
fi

echo ""

# Check Cloud Run service
echo -e "${BLUE}=== Cloud Run Service ===${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)" 2>/dev/null)
LATEST_REVISION=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.latestReadyRevisionName)" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$SERVICE_URL" ]; then
    echo -e "${GREEN}✓ Service is running${NC}"
    echo -e "  URL: ${BLUE}${SERVICE_URL}${NC}"
    echo -e "  Latest Revision: ${LATEST_REVISION}"
    
    # Get revision details
    REVISION_TIME=$(gcloud run revisions describe "$LATEST_REVISION" --region="$REGION" --format="value(metadata.creationTimestamp)" 2>/dev/null)
    if [ -n "$REVISION_TIME" ]; then
        echo -e "  Deployed: ${REVISION_TIME}"
    fi
else
    echo -e "${RED}✗ Service not found or not accessible${NC}"
fi

echo ""

# Check triggers
echo -e "${BLUE}=== Active Triggers ===${NC}"
TRIGGERS=$(gcloud builds triggers list --format="table(name,branchPattern,disabled,createTime)" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$TRIGGERS" ]; then
    echo "$TRIGGERS"
    
    # Check if trigger for this service exists
    TRIGGER_EXISTS=$(gcloud builds triggers list --format="value(name)" 2>/dev/null | grep -i "deploy-${SERVICE_NAME}")
    if [ -z "$TRIGGER_EXISTS" ]; then
        echo ""
        echo -e "${YELLOW}⚠ No trigger found for 'deploy-${SERVICE_NAME}'${NC}"
    fi
else
    echo -e "${YELLOW}No triggers found${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Quick Commands:${NC}"
echo -e "  View builds: ${BLUE}gcloud builds list${NC}"
echo -e "  View logs: ${BLUE}gcloud builds log BUILD_ID${NC}"
echo -e "  Open console: ${BLUE}https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}${NC}"
echo ""


