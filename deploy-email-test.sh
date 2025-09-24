#!/bin/bash

# Email System Deployment Test Script
# This script helps you test the email system on your deployed environment

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Green Cart Email System Deployment Test${NC}"
echo "======================================================"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

# Check if we're on the email system branch
if [[ "$CURRENT_BRANCH" != "226-purchased-orders-email-system" ]]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on the email system branch${NC}"
    echo -e "Current branch: $CURRENT_BRANCH"
    echo -e "Expected branch: 226-purchased-orders-email-system"
    echo ""
    read -p "Do you want to continue with the current branch? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment test cancelled${NC}"
        exit 1
    fi
fi

# Get test email address
echo ""
echo -e "${BLUE}📧 Email Configuration${NC}"
echo "Enter the email address where you want to receive test order confirmations:"
read -p "Test Email: " TEST_EMAIL

# Validate email format (basic validation)
if [[ ! "$TEST_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    echo -e "${RED}❌ Invalid email format${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Email configured: $TEST_EMAIL${NC}"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found${NC}"
    echo "Please install GitHub CLI (gh) or manually trigger the workflow at:"
    echo "https://github.com/COS301-SE-2025/Green-Cart/actions/workflows/deploy-branch-test.yml"
    echo ""
    echo "Workflow inputs:"
    echo "- Branch: $CURRENT_BRANCH"
    echo "- Test Email: $TEST_EMAIL"
    exit 1
fi

# Check if user is authenticated with GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Trigger the deployment workflow
echo ""
echo -e "${BLUE}🚀 Triggering Deployment Test...${NC}"
echo "Branch: $CURRENT_BRANCH"
echo "Test Email: $TEST_EMAIL"
echo ""

# Run the workflow
gh workflow run deploy-branch-test.yml \
    -f branch="$CURRENT_BRANCH" \
    -f test_email="$TEST_EMAIL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment test workflow triggered successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 What happens next:${NC}"
    echo "1. GitHub Actions will deploy your branch to the test environment"
    echo "2. The backend will be available on port 8001 (test) alongside port 8000 (production)"
    echo "3. Email service will be configured with your test email"
    echo "4. You can monitor progress at: https://github.com/COS301-SE-2025/Green-Cart/actions"
    echo ""
    echo -e "${BLUE}🧪 Testing your email system:${NC}"
    echo "1. Wait for deployment to complete (~5-10 minutes)"
    echo "2. Test order creation through your API or frontend"
    echo "3. Check your email ($TEST_EMAIL) for order confirmations"
    echo "4. Monitor logs if needed"
    echo ""
    echo -e "${YELLOW}💡 Tip: Use 'gh run list' to see workflow status${NC}"
else
    echo -e "${RED}❌ Failed to trigger deployment test${NC}"
    echo "Please check your GitHub authentication and permissions"
    exit 1
fi

# Offer to watch the workflow
echo ""
read -p "Do you want to watch the workflow progress? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}👀 Watching workflow progress...${NC}"
    gh run list --limit 1 --workflow=deploy-branch-test.yml
    LATEST_RUN=$(gh run list --limit 1 --workflow=deploy-branch-test.yml --json databaseId --jq '.[0].databaseId')
    if [ ! -z "$LATEST_RUN" ]; then
        gh run watch $LATEST_RUN
    else
        echo "Could not find the latest run. Please check manually at:"
        echo "https://github.com/COS301-SE-2025/Green-Cart/actions"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deployment test initiated successfully!${NC}"
