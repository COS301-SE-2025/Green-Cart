#!/usr/bin/env python3
"""
Add a few eco-friendly products with multiple Unsplash images to test the gallery
"""

import requests
import json

def add_sample_products():
    """Add sample products with multiple images from Unsplash"""
    
    print("🌱 Adding Sample Products with Multiple Images...")
    print("=" * 60)
    
    # Sample products with multiple image URLs from Unsplash
    products = [
        {
            'name': 'Bamboo Kitchen Utensil Set',
            'description': 'Complete 7-piece bamboo kitchen utensil set. Naturally antibacterial, lightweight, and safe for non-stick cookware.',
            'price': 39.99,
            'category_id': 3,  # Home & Garden
            'stock_quantity': 25,
            'image_urls': [
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
                'https://images.unsplash.com/photo-1594736797933-d0401ba8b5dd?w=500&q=80',
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'
            ],
            'sustainability': {
                'energy_efficiency': 85,
                'carbon_footprint': 90,
                'recyclability': 95,
                'durability': 85,
                'material_sustainability': 95
            }
        },
        {
            'name': 'Solar Powered LED Garden Lights',
            'description': 'Set of 6 solar-powered LED garden lights with automatic dusk-to-dawn operation. Weather-resistant design.',
            'price': 59.99,
            'category_id': 3,  # Home & Garden
            'stock_quantity': 15,
            'image_urls': [
                'https://images.unsplash.com/photo-1578318219013-7d533e9a4014?w=500&q=80',
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&q=80',
                'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=500&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80'
            ],
            'sustainability': {
                'energy_efficiency': 98,
                'carbon_footprint': 92,
                'recyclability': 75,
                'durability': 88,
                'material_sustainability': 80
            }
        },
        {
            'name': 'Organic Cotton Reusable Shopping Bags',
            'description': 'Set of 3 organic cotton mesh shopping bags. GOTS certified, machine washable, perfect for zero-waste shopping.',
            'price': 24.99,
            'category_id': 2,  # Fashion
            'stock_quantity': 50,
            'image_urls': [
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
                'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=500&q=80'
            ],
            'sustainability': {
                'energy_efficiency': 82,
                'carbon_footprint': 88,
                'recyclability': 95,
                'durability': 90,
                'material_sustainability': 98
            }
        }
    ]
    
    for i, product in enumerate(products, 1):
        try:
            print(f"\n[{i}/{len(products)}] Adding: {product['name']}")
            
            # Create fake image data (1x1 pixel)
            fake_image = b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00\xFF\xC0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xFF\xC4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xFF\xC4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xAA\xFF\xD9'
            
            # Prepare form data
            data = {
                'name': product['name'],
                'description': product['description'],
                'price': product['price'],
                'category_id': product['category_id'],
                'retailer_id': 3,
                'stock_quantity': product['stock_quantity'],
                'energy_efficiency': product['sustainability']['energy_efficiency'],
                'carbon_footprint': product['sustainability']['carbon_footprint'],
                'recyclability': product['sustainability']['recyclability'],
                'durability': product['sustainability']['durability'],
                'material_sustainability': product['sustainability']['material_sustainability']
            }
            
            # Create multiple image files
            files = []
            for j, img_url in enumerate(product['image_urls']):
                files.append(('images', (f'image_{j+1}.jpg', fake_image, 'image/jpeg')))
            
            # Create product
            response = requests.post(
                'http://localhost:8000/product-images/products/',
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 201:
                result = response.json()
                product_id = result.get('product_id')
                images_uploaded = result.get('images_uploaded', 0)
                
                print(f"   ✅ SUCCESS! Product ID: {product_id}")
                print(f"   📸 Images uploaded: {images_uploaded}")
                print(f"   💰 Price: ${product['price']}")
                
                # Now update the image URLs to use Unsplash images
                print(f"   🖼️  Updating image URLs to Unsplash...")
                
                for j, img_url in enumerate(product['image_urls']):
                    update_response = requests.put(
                        f"http://localhost:8000/admin/update-product-image/{product_id}/{j+1}",
                        json={"image_url": img_url},
                        timeout=15
                    )
                    if update_response.status_code == 200:
                        print(f"      ✅ Updated image {j+1}: {img_url}")
                    else:
                        print(f"      ❌ Failed to update image {j+1}")
                
            else:
                print(f"   ❌ FAILED! Status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"   💥 ERROR: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🏁 Sample Products Added!")
    print("🌐 You can now test the frontend image gallery functionality")
    print("📱 Visit the product pages to see the image carousel in action")

if __name__ == "__main__":
    add_sample_products()
