#!/usr/bin/env python3
"""
Script to fix product images with reliable HTTPS URLs
"""
import requests
import time

def fix_product_images():
    """Update all products with reliable, HTTPS image URLs"""
    
    # Base API URL
    base_url = "https://api.greencart-cos301.co.za"
    
    # Better, more reliable image URLs (all HTTPS and CORS-friendly)
    product_images = [
        {
            "product_id": 1,
            "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 2, 
            "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 3,
            "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 4,
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 5,
            "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 6,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 7,
            "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 8,
            "image_url": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 9,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 10,
            "image_url": "https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 11,
            "image_url": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 12,
            "image_url": "https://images.unsplash.com/photo-1578318219013-7d533e9a4014?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 13,
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 14,
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 15,
            "image_url": "https://images.unsplash.com/photo-1556909114-6962dc8e4d12?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 16,
            "image_url": "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 17,
            "image_url": "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 18,
            "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 19,
            "image_url": "https://images.unsplash.com/photo-1556909114-fda22c5bb1f5?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 20,
            "image_url": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 21,
            "image_url": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 22,
            "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&q=80&auto=format&fit=crop"
        },
        {
            "product_id": 23,
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80&auto=format&fit=crop"
        }
    ]
    
    print("🖼️  Fixing product images with reliable HTTPS URLs...")
    print("=" * 60)
    
    success_count = 0
    error_count = 0
    
    for product_image in product_images:
        try:
            product_id = product_image["product_id"]
            image_url = product_image["image_url"]
            
            # Call the admin endpoint to update product image
            response = requests.post(
                f"{base_url}/admin/update-product-image",
                json={
                    "product_id": product_id,
                    "image_url": image_url
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Updated Product {product_id}: Image URL fixed")
                success_count += 1
            else:
                print(f"❌ Failed Product {product_id}: {response.status_code} - {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"💥 Error updating Product {product_id}: {str(e)}")
            error_count += 1
        
        # Small delay to avoid overwhelming the API
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print(f"🎯 Results: {success_count} successful, {error_count} failed")
    print(f"✨ All product images should now load properly!")

if __name__ == "__main__":
    fix_product_images()
