# Green Cart Email System Testing Commands

## 1. Test Email Configuration
```bash
curl -X GET "https://api.greencart-cos301.co.za/test/email-config"
```

## 2. Quick Email Test to sknaidoo1405@gmail.com
```bash
curl -X GET "https://api.greencart-cos301.co.za/test/email-quick"
```

## 3. Custom Email Test
```bash
curl -X POST "https://api.greencart-cos301.co.za/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sknaidoo1405@gmail.com",
    "name": "Shayden Naidoo"
  }'
```

## 4. Create Test User (if needed)
```bash
curl -X POST "https://api.greencart-cos301.co.za/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email Test User",
    "email": "sknaidoo1405@gmail.com", 
    "password": "testpass123"
  }'
```

## 5. Login Test User (if user already exists)
```bash
curl -X POST "https://api.greencart-cos301.co.za/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sknaidoo1405@gmail.com",
    "password": "testpass123"
  }'
```

## 6. Add Products to Cart (replace USER_ID)
```bash
# Add first product
curl -X POST "https://api.greencart-cos301.co.za/cart/add?user_id=YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 1
  }'

# Add second product  
curl -X POST "https://api.greencart-cos301.co.za/cart/add?user_id=YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 2,
    "quantity": 2
  }'
```

## 7. Get Cart ID (replace USER_ID)
```bash
curl -X GET "https://api.greencart-cos301.co.za/cart/get?user_id=YOUR_USER_ID"
```

## 8. Create Order with Email (replace USER_ID and CART_ID)
```bash
curl -X POST "https://api.greencart-cos301.co.za/orders/createOrder" \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "YOUR_USER_ID",
    "cartID": YOUR_CART_ID
  }'
```

## 9. Health Check
```bash
curl -X GET "https://api.greencart-cos301.co.za/health"
```

## Complete Test Flow
```bash
# 1. Test email system first
curl -X GET "https://api.greencart-cos301.co.za/test/email-quick"

# 2. If that works, create a user and order
# Follow steps 4-8 above with your actual user ID and cart ID

# 3. Check your email: sknaidoo1405@gmail.com
```

## Troubleshooting
- If emails don't arrive, check spam folder
- Make sure AWS SES domain is verified
- Check if your email (sknaidoo1405@gmail.com) is verified in SES sandbox mode
- Check backend logs for SES errors

## Python Test Script
Run the automated test script:
```bash
python3 test_email_system.py
```
