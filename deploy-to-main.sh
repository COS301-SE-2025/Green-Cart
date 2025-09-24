#!/bin/bash

# Quick Email System Deploy Script
# This will merge your email branch to main and deploy

echo "🚀 Deploying Email System to Production"
echo "========================================"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "226-purchased-orders-email-system" ]; then
    echo "⚠️  Switching to email system branch..."
    git checkout 226-purchased-orders-email-system
fi

# Commit any pending changes
echo "📝 Committing any pending changes..."
git add .
git commit -m "Final email system implementation ready for production" || echo "No changes to commit"

# Switch to main and merge
echo "🔄 Merging to main branch..."
git checkout main
git pull origin main
git merge 226-purchased-orders-email-system --no-ff -m "Merge email system: Add order confirmation emails with AWS SES integration"

# Push to main (triggers deployment)
echo "🚀 Pushing to main (this will trigger deployment)..."
git push origin main

echo ""
echo "✅ Email system deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Monitor deployment at: https://github.com/COS301-SE-2025/Green-Cart/actions"
echo "2. Wait ~10-15 minutes for deployment to complete"
echo "3. Test email system on deployed environment"
echo ""
echo "🧪 To test after deployment:"
echo "1. Clear browser storage and log in fresh"
echo "2. Add products with stock to cart"
echo "3. Complete checkout to trigger email"
echo "4. Check your email for order confirmation"
echo ""
echo "🎉 Your email system is ready for production!"
