#!/bin/bash

echo "🔍 AWS Deployment Debug Script"
echo "=============================="

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

echo "1. Checking AWS configuration..."
aws sts get-caller-identity --output table 2>/dev/null || echo "❌ AWS not configured"

echo ""
echo "2. Checking S3 bucket contents..."
# This will show if your files are actually uploaded
aws s3 ls s3://your-bucket-name --recursive | head -10 2>/dev/null || echo "❌ Cannot access S3 bucket (update bucket name in script)"

echo ""
echo "3. Checking CloudFront distributions..."
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]' --output table 2>/dev/null || echo "❌ Cannot access CloudFront"

echo ""
echo "4. Testing current domain resolution..."
echo "Domain: greencart-cos301.co.za"
dig greencart-cos301.co.za +short

echo ""
echo "5. Checking if CSS files exist in S3..."
echo "Looking for CSS files..."
# Update bucket name here
aws s3 ls s3://your-bucket-name --recursive | grep -E "\.(css|js)$" | head -5 2>/dev/null || echo "❌ Cannot check CSS files (update bucket name)"

echo ""
echo "🔧 RECOMMENDED ACTIONS:"
echo "1. Update your DNS CNAME record to point to CloudFront distribution"
echo "2. Or test directly with CloudFront URL: https://YOUR_DISTRIBUTION_ID.cloudfront.net"
echo "3. Clear CloudFront cache if needed"
echo "4. Check S3 bucket permissions and file uploads"

echo ""
echo "💡 Quick CloudFront cache invalidation (if you have the distribution ID):"
echo "aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"
