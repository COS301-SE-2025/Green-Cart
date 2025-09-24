# Email System Testing Guide

## Quick Testing After Deployment

Once you merge your `226-purchased-orders-email-system` branch to `main`, the deployment will automatically include your email service.

### 1. Merge and Deploy
```bash
# Switch to main branch
git checkout main

# Merge your email system branch
git merge 226-purchased-orders-email-system

# Push to trigger deployment
git push origin main
```

### 2. Wait for Deployment
- Monitor at: https://github.com/COS301-SE-2025/Green-Cart/actions
- Deployment takes ~10-15 minutes
- Look for green checkmarks ✅

### 3. Test Email Functionality

#### Option A: Frontend Testing
1. Go to your deployed frontend
2. Create a user account (if needed)
3. Add products to cart
4. Complete checkout process
5. Check your email for order confirmation

#### Option B: API Testing
```bash
# Replace with actual user ID and product details
curl -X POST https://api.greencart-cos301.co.za/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id",
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

### 4. Verify Email Features
Check your email for:
- ✅ Order confirmation received
- ✅ Product details and images
- ✅ Sustainability scores
- ✅ Delivery information
- ✅ Professional formatting

### 5. Troubleshooting

#### No Email Received?
1. Check spam/junk folder
2. Verify AWS SES domain verification is complete
3. Ensure email address is verified in AWS SES (if still in sandbox)
4. Check server logs for errors

#### Check Server Logs
```bash
# SSH to your server
ssh -i your-key.pem ubuntu@your-server-ip

# View container logs
sudo docker logs green-cart-backend | grep -i email
sudo docker logs green-cart-backend | grep -i ses
```

### 6. AWS SES Status Check
- AWS SES Console: https://console.aws.amazon.com/ses/
- Check domain verification status
- Verify sending limits
- Review bounce/complaint reports

## Email Service Configuration

The deployment automatically configures:
- `AWS_SES_REGION`: Your AWS region
- `FROM_EMAIL`: noreply@greencart-cos301.co.za
- AWS credentials for SES access

## Next Steps

Once email is working:
1. Test with different order scenarios
2. Verify email templates display correctly
3. Check sustainability scores appear properly
4. Test with different email clients
5. Monitor delivery rates and bounces

---

**Note**: Remember that AWS SES has daily sending limits. Start with small tests and monitor your usage in the AWS console.
