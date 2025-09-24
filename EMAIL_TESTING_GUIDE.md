# Email System Testing Guide

## Simple Testing Process

### 1. Merge Your Branch to Main
```bash
# Make sure you're on your email branch
git checkout 226-purchased-orders-email-system

# Commit any remaining changes
git add .
git commit -m "Complete email service integration"

# Switch to main and merge
git checkout main
git pull origin main
git merge 226-purchased-orders-email-system

# Push to main (this will trigger deployment)
git push origin main
```

### 2. Monitor Deployment
- Go to: https://github.com/COS301-SE-2025/Green-Cart/actions
- Wait for the "AWS Deployment" workflow to complete (~10-15 minutes)
- Look for green checkmarks ✅

### 3. Test Email System

#### Step 1: Create a Test Account
- Go to your deployed frontend
- Register a new user account
- Make sure to use a real email address you can access

#### Step 2: Add Products to Cart
- Browse products and add some to your cart
- Make sure the cart has items before checkout

#### Step 3: Create Order and Test Email
- Proceed to checkout
- Complete the order process
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
