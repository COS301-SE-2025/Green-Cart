# Email System Deployment Testing Guide

## Overview
This guide helps you test your email system on the deployed environment using the `226-purchased-orders-email-system` branch.

## Quick Start

### Option 1: Automated Script (Recommended)
```bash
# Make sure you're on the email system branch
git checkout 226-purchased-orders-email-system

# Run the deployment test script
./deploy-email-test.sh
```

### Option 2: Manual GitHub Actions Trigger
1. Go to: https://github.com/COS301-SE-2025/Green-Cart/actions
2. Click on "Branch Deployment Test" workflow
3. Click "Run workflow"
4. Enter:
   - Branch: `226-purchased-orders-email-system`
   - Test Email: your-email@example.com
5. Click "Run workflow"

## What the Deployment Does

### Backend Deployment
- Deploys your branch to a test environment on port 8001
- Keeps production backend running on port 8000
- Configures AWS SES with your email settings
- Sets up all required environment variables

### Email Service Setup
- Configures AWS SES for sending emails
- Sets up Jinja2 templates for order confirmations
- Includes product images and sustainability scores
- Ready for testing with verified email addresses

## Testing Your Email System

### 1. Wait for Deployment
- Deployment takes ~5-10 minutes
- Monitor at: https://github.com/COS301-SE-2025/Green-Cart/actions
- Look for green checkmarks ✅

### 2. Test Order Creation
Once deployed, you can test through:

#### API Testing (Direct)
```bash
# Health check first
curl https://your-server-ip:8001/health

# Create a test order (adjust payload as needed)
curl -X POST https://your-server-ip:8001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

#### Frontend Testing
- Use your frontend connected to the test backend (port 8001)
- Complete a full order flow
- Check for email notifications

### 3. Email Verification
Check your test email for:
- ✅ Order confirmation received
- ✅ Product details included
- ✅ Images displaying correctly
- ✅ Sustainability scores shown
- ✅ Delivery information present

## Monitoring and Debugging

### Check Container Status
```bash
# SSH to your server
ssh -i your-key.pem ubuntu@your-server-ip

# Check containers
sudo docker ps | grep green-cart

# View logs
sudo docker logs -f green-cart-test-backend
```

### Common Issues

#### Email Not Sending
1. Check AWS SES domain verification status
2. Verify email address is in SES verified list (if in sandbox)
3. Check container logs for AWS errors

#### Container Not Starting
1. Check Docker logs: `sudo docker logs green-cart-test-backend`
2. Verify environment variables are set correctly
3. Check disk space: `df -h`

#### API Errors
1. Verify health endpoint: `curl http://localhost:8001/health`
2. Check database connectivity
3. Review application logs

## Cleanup

### After Testing
```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip

# Stop test container
sudo docker stop green-cart-test-backend
sudo docker rm green-cart-test-backend

# Clean up test files
sudo rm -rf /home/ubuntu/Green-Cart-Test

# Optional: Clean up Docker images
sudo docker system prune -f
```

## Environment Configuration

The deployment automatically sets up:
```env
DATABASE_URL=your-database-url
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET_NAME=your-bucket
BASE_URL=https://api.greencart-cos301.co.za
OPENAI_API_KEY=your-openai-key
AWS_SES_REGION=your-region
FROM_EMAIL=noreply@greencart-cos301.co.za
TEST_EMAIL=your-test-email
```

## Email Service Features Included

Your deployed email service includes:
- ✅ HTML email templates with CSS styling
- ✅ Product images and details
- ✅ Sustainability scores and eco-impact
- ✅ Order summary and delivery information
- ✅ Professional branding and layout
- ✅ Mobile-responsive design

## Next Steps After Testing

1. **If email works correctly**: Merge to main branch
2. **If issues found**: Fix on your branch and redeploy test
3. **Production deployment**: Use main deployTest.yml workflow

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review container logs on server
3. Verify AWS SES configuration
4. Check email service implementation in code

---

**Note**: This test deployment runs alongside your production backend, so your live system remains unaffected during testing.
