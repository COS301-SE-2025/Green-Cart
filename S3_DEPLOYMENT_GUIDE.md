# S3 Product Image Upload - Deployment Guide

## Quick Test

After deployment, test the functionality with:

```bash
curl https://api.greencart-cos301.co.za/product-images/test
```

## New Endpoints

- `GET /product-images/test` - Test endpoint
- `POST /product-images/create-with-images` - Create product with images
- `POST /product-images/upload-additional/{product_id}` - Add images to existing product

## Environment Variables

Set these in your deployment environment:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=greencart-images-cos-301
```

## Usage Example

```bash
curl -X POST "https://api.greencart-cos301.co.za/product-images/create-with-images" \
  -F "name=Test Product" \
  -F "description=A test product" \
  -F "price=29.99" \
  -F "quantity=100" \
  -F "brand=Test Brand" \
  -F "category=Electronics" \
  -F "retailer_id=1" \
  -F "images=@your_image.jpg"
```

## Features

- Direct S3 uploads to greencart-images-cos-301 bucket
- Product creation with images in single request
- Image validation (format, size limits)
- Error handling and logging
- Unique UUID-based filenames
