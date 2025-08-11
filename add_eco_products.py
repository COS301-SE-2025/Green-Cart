#!/usr/bin/env python3
"""
Script to populate the database with 20 eco-friendly products with sustainability ratings
Uses external image URLs to save S3 storage space
"""

import requests
import json

def add_eco_products():
    """Add 20 eco-friendly products with accurate sustainability ratings"""
    
    # Base API URL
    base_url = "https://api.greencart-cos301.co.za"
    
    # Eco-friendly products with accurate sustainability ratings
    eco_products = [
                {
            "name": "Bamboo Coffee Mug Set (4-Pack)",
            "description": "Sustainable bamboo coffee mugs with natural bamboo fiber. Completely biodegradable and BPA-free. Perfect for hot beverages.",
            "price": 599.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 25,
            "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80",
            "energy_efficiency": 85,
            "carbon_footprint": 92,
            "recyclability": 95,
            "durability": 78,
            "material_sustainability": 98
        },
        {
            "name": "Solar Power Bank 20000mAh",
            "description": "High-capacity solar power bank with dual USB outputs. Waterproof design with LED flashlight for emergencies.",
            "price": 899.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 15,
            "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
            "energy_efficiency": 95,
            "carbon_footprint": 88,
            "recyclability": 72,
            "durability": 90,
            "material_sustainability": 75
        },
        {
            "name": "Biodegradable Phone Case",
            "description": "100% compostable phone case made from plant-based materials. Shock-absorbing design fits most phone models.",
            "price": 349.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 50,
            "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&q=80",
            "energy_efficiency": 78,
            "carbon_footprint": 95,
            "recyclability": 100,
            "durability": 82,
            "material_sustainability": 100
        },
        {
            "name": "Stainless Steel Lunch Box Set",
            "description": "Premium food-grade stainless steel lunch containers. Leak-proof, BPA-free, and dishwasher safe. Set of 3 sizes.",
            "price": 529.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 35,
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
            "energy_efficiency": 75,
            "carbon_footprint": 85,
            "recyclability": 100,
            "durability": 95,
            "material_sustainability": 88
        },
        {
            "name": "Energy-Efficient LED Desk Lamp",
            "description": "Smart LED desk lamp with wireless charging base. Touch controls, adjustable brightness, and energy monitoring.",
            "price": 1199.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 20,
            "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
            "energy_efficiency": 98,
            "carbon_footprint": 82,
            "recyclability": 78,
            "durability": 92,
            "material_sustainability": 70
        },
        {
            "name": "Recycled Paper Notebook Set",
            "description": "Beautiful notebooks made from 100% recycled paper. Set includes lined, dotted, and blank notebooks with hemp covers.",
            "price": 229.99,  # ZAR
            "category_id": 6,  # Books & Media
            "stock_quantity": 75,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80",
            "energy_efficiency": 72,
            "carbon_footprint": 98,
            "recyclability": 100,
            "durability": 80,
            "material_sustainability": 100
        },
        {
            "name": "Bamboo Kitchen Utensil Set",
            "description": "Complete 7-piece bamboo kitchen utensil set. Naturally antibacterial, lightweight, and safe for non-stick cookware.",
            "price": 399.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 40,
            "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80",
            "energy_efficiency": 85,
            "carbon_footprint": 90,
            "recyclability": 95,
            "durability": 85,
            "material_sustainability": 95
        },
        {
            "name": "Insulated Stainless Steel Water Bottle",
            "description": "Double-wall vacuum insulated water bottle. Keeps drinks cold 24hrs or hot 12hrs. 750ml capacity with leak-proof cap.",
            "price": 459.99,  # ZAR
            "category_id": 7,  # Food & Beverages
            "stock_quantity": 60,
            "image_url": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&q=80",
            "energy_efficiency": 80,
            "carbon_footprint": 85,
            "recyclability": 100,
            "durability": 95,
            "material_sustainability": 88
        },
        {
            "name": "Organic Cotton Reusable Shopping Bags",
            "description": "Set of 3 organic cotton shopping bags. GOTS certified, machine washable, and perfect for zero-waste shopping.",
            "price": 189.99,  # ZAR
            "category_id": 2,  # Fashion
            "stock_quantity": 100,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
            "energy_efficiency": 75,
            "carbon_footprint": 92,
            "recyclability": 95,
            "durability": 88,
            "material_sustainability": 100
        },
        {
            "name": "Smart Energy Monitor Plug",
            "description": "WiFi-enabled smart plug with real-time energy monitoring. Track power consumption and control devices remotely.",
            "price": 279.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 45,
            "image_url": "https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=500&q=80",
            "energy_efficiency": 95,
            "carbon_footprint": 78,
            "recyclability": 75,
            "durability": 88,
            "material_sustainability": 68
        },
        {
            "name": "Bamboo Toothbrush Family Pack",
            "description": "Pack of 4 bamboo toothbrushes with charcoal-infused bristles. Biodegradable handles in zero-waste packaging.",
            "price": 119.99,  # ZAR
            "category_id": 4,  # Beauty & Personal Care
            "stock_quantity": 150,
            "image_url": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80",
            "energy_efficiency": 80,
            "carbon_footprint": 95,
            "recyclability": 90,
            "durability": 75,
            "material_sustainability": 100
        },
        {
            "name": "Solar Garden Light String (20 LEDs)",
            "description": "Waterproof solar LED string lights for gardens. 20 warm white LEDs with 8-hour runtime after full solar charge.",
            "price": 649.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 30,
            "image_url": "https://images.unsplash.com/photo-1578318219013-7d533e9a4014?w=500&q=80",
            "energy_efficiency": 100,
            "carbon_footprint": 95,
            "recyclability": 78,
            "durability": 85,
            "material_sustainability": 82
        },
        {
            "name": "Cork Yoga Mat with Natural Rubber",
            "description": "Premium yoga mat with cork surface and natural rubber base. Non-slip, antimicrobial, and biodegradable.",
            "price": 1299.99,  # ZAR
            "category_id": 5,  # Sports & Outdoors
            "stock_quantity": 18,
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80",
            "energy_efficiency": 78,
            "carbon_footprint": 88,
            "recyclability": 95,
            "durability": 92,
            "material_sustainability": 95
        },
        {
            "name": "Recycled Ocean Plastic Outdoor Chair",
            "description": "Durable outdoor chair made from 100% recycled ocean plastic. Weather-resistant and stackable design.",
            "price": 1899.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 12,
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80",
            "energy_efficiency": 72,
            "carbon_footprint": 92,
            "recyclability": 100,
            "durability": 95,
            "material_sustainability": 100
        },
        {
            "name": "Bamboo Cutting Board with Juice Groove",
            "description": "Large bamboo cutting board with juice groove. Naturally antimicrobial and gentle on knife blades.",
            "price": 429.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 45,
            "image_url": "https://images.unsplash.com/photo-1556909114-6962dc8e4d12?w=500&q=80",
            "energy_efficiency": 85,
            "carbon_footprint": 90,
            "recyclability": 100,
            "durability": 90,
            "material_sustainability": 95
        },
        {
            "name": "Portable Solar Panel Phone Charger",
            "description": "Foldable 21W solar panel with dual USB outputs. Perfect for camping, hiking, and emergency preparedness.",
            "price": 699.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 22,
            "image_url": "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=500&q=80",
            "energy_efficiency": 95,
            "carbon_footprint": 90,
            "recyclability": 75,
            "durability": 88,
            "material_sustainability": 78
        },
        {
            "name": "Wheat Straw Phone Stand",
            "description": "Adjustable phone stand made from biodegradable wheat straw plastic. Compatible with all smartphone sizes.",
            "price": 159.99,  # ZAR
            "category_id": 1,  # Electronics
            "stock_quantity": 80,
            "image_url": "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&q=80",
            "energy_efficiency": 75,
            "carbon_footprint": 88,
            "recyclability": 95,
            "durability": 82,
            "material_sustainability": 92
        },
        {
            "name": "Organic Hemp Bed Sheet Set",
            "description": "Luxurious organic hemp bed sheets. Naturally temperature regulating, antimicrobial, and gets softer with each wash.",
            "price": 2499.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 8,
            "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80",
            "energy_efficiency": 82,
            "carbon_footprint": 90,
            "recyclability": 95,
            "durability": 88,
            "material_sustainability": 100
        },
        {
            "name": "Compostable Food Storage Bags (50-Pack)",
            "description": "Plant-based compostable food storage bags. Freezer safe and certified home compostable within 180 days.",
            "price": 149.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 200,
            "image_url": "https://images.unsplash.com/photo-1556909114-fda22c5bb1f5?w=500&q=80",
            "energy_efficiency": 70,
            "carbon_footprint": 95,
            "recyclability": 100,
            "durability": 78,
            "material_sustainability": 100
        },
        {
            "name": "Energy Star Certified Blender",
            "description": "High-performance blender with energy-efficient motor. 1200W with 6 preset programs and BPA-free components.",
            "price": 3299.99,  # ZAR
            "category_id": 3,  # Home & Garden
            "stock_quantity": 6,
            "image_url": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80",
            "energy_efficiency": 92,
            "carbon_footprint": 78,
            "recyclability": 82,
            "durability": 95,
            "material_sustainability": 72
        },
        {
            "name": "Solar Power Bank 20000mAh",
            "description": "High-capacity solar power bank with wireless charging. Made from recycled materials with built-in LED indicators.",
            "price": 89.99,
            "category": "Electronics",
            "stock_quantity": 30,
            "image_url": "https://images.unsplash.com/photo-1609592207049-53deebe4daab?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 95,  # Solar powered
                "carbon_footprint": 75,   # Renewable energy usage
                "recyclability": 70,      # Electronics recycling
                "durability": 88,         # High-quality build
                "material_sustainability": 82  # Some recycled materials
            }
        },
        {
            "name": "Biodegradable Phone Case - iPhone",
            "description": "Plant-based phone case made from wheat straw and cornstarch. Fully compostable within 6 months.",
            "price": 24.99,
            "category": "Electronics",
            "stock_quantity": 75,
            "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 88,  # Low energy production
                "carbon_footprint": 89,   # Plant-based materials
                "recyclability": 98,      # Fully biodegradable
                "durability": 72,         # Good protection
                "material_sustainability": 95  # Plant-based materials
            }
        },
        {
            "name": "Stainless Steel Cookware Set",
            "description": "3-piece stainless steel cookware set. Non-toxic, plastic-free, and built to last a lifetime. Energy-efficient design.",
            "price": 159.99,
            "category": "Home & Garden",
            "stock_quantity": 25,
            "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 85,  # Efficient heat distribution
                "carbon_footprint": 65,   # Steel production impact
                "recyclability": 90,      # Steel is highly recyclable
                "durability": 95,         # Lifetime durability
                "material_sustainability": 78  # Recyclable materials
            }
        },
        {
            "name": "Energy Star Smart Blender",
            "description": "ENERGY STAR certified high-performance blender with smart controls. Made from recycled plastics and metals.",
            "price": 199.99,
            "category": "Home & Garden",
            "stock_quantity": 20,
            "image_url": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 92,  # Energy Star certified
                "carbon_footprint": 70,   # Efficient operation
                "recyclability": 75,      # Mixed materials
                "durability": 88,         # High-quality components
                "material_sustainability": 80  # Some recycled content
            }
        },
        {
            "name": "Recycled Paper Notebook Set",
            "description": "5-pack of A5 notebooks made from 100% recycled paper. Plastic-free binding with soy-based ink printing.",
            "price": 18.99,
            "category": "Books & Media",
            "stock_quantity": 100,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 82,  # Low energy production
                "carbon_footprint": 85,   # Recycled materials
                "recyclability": 95,      # Paper is highly recyclable
                "durability": 75,         # Standard paper durability
                "material_sustainability": 92  # 100% recycled content
            }
        },
        {
            "name": "Bamboo Toothbrush 4-Pack",
            "description": "Biodegradable bamboo toothbrushes with BPA-free bristles. Compostable handle, plastic-free packaging.",
            "price": 12.99,
            "category": "Beauty & Personal Care",
            "stock_quantity": 80,
            "image_url": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 88,  # Simple manufacturing
                "carbon_footprint": 94,   # Bamboo is carbon neutral
                "recyclability": 90,      # Bamboo biodegrades
                "durability": 70,         # Natural material limits
                "material_sustainability": 96  # Rapidly renewable bamboo
            }
        },
        {
            "name": "Organic Cotton Reusable Produce Bags",
            "description": "Set of 6 organic cotton mesh bags for zero-waste grocery shopping. Machine washable and durable.",
            "price": 16.99,
            "category": "Home & Garden",
            "stock_quantity": 60,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 80,  # Cotton processing
                "carbon_footprint": 78,   # Organic farming
                "recyclability": 85,      # Natural fibers
                "durability": 82,         # Long-lasting cotton
                "material_sustainability": 88  # Organic cotton
            }
        },
        {
            "name": "Cork Yoga Mat",
            "description": "Natural cork yoga mat with rubber backing. Anti-microbial, non-slip, and sustainably harvested cork surface.",
            "price": 79.99,
            "category": "Sports & Outdoors",
            "stock_quantity": 35,
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 85,  # Natural material processing
                "carbon_footprint": 88,   # Cork trees absorb CO2
                "recyclability": 80,      # Natural materials
                "durability": 85,         # High-quality construction
                "material_sustainability": 92  # Sustainably harvested cork
            }
        },
        {
            "name": "LED Desk Lamp - USB Rechargeable",
            "description": "Energy-efficient LED desk lamp with wireless charging pad. Made from recycled aluminum with touch controls.",
            "price": 54.99,
            "category": "Electronics",
            "stock_quantity": 45,
            "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 95,  # LED technology
                "carbon_footprint": 72,   # Manufacturing impact
                "recyclability": 85,      # Aluminum recyclable
                "durability": 90,         # Quality components
                "material_sustainability": 78  # Some recycled content
            }
        },
        {
            "name": "Bamboo Cutting Board Set",
            "description": "3-piece bamboo cutting board set with different sizes. Naturally antimicrobial and knife-friendly surface.",
            "price": 32.99,
            "category": "Home & Garden",
            "stock_quantity": 55,
            "image_url": "https://images.unsplash.com/photo-1556909043-f309e6c5c8bf?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 88,  # Simple manufacturing
                "carbon_footprint": 92,   # Bamboo carbon sequestration
                "recyclability": 95,      # Biodegradable
                "durability": 80,         # Good for cutting boards
                "material_sustainability": 95  # Rapidly renewable
            }
        },
        {
            "name": "Recycled Glass Water Bottle",
            "description": "500ml water bottle made from 100% recycled glass with silicone protective sleeve. BPA-free and dishwasher safe.",
            "price": 28.99,
            "category": "Sports & Outdoors",
            "stock_quantity": 70,
            "image_url": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 75,  # Glass production energy
                "carbon_footprint": 80,   # Recycled content benefit
                "recyclability": 98,      # Glass infinitely recyclable
                "durability": 85,         # Quality glass construction
                "material_sustainability": 90  # 100% recycled glass
            }
        },
        {
            "name": "Organic Hemp Tote Bag",
            "description": "Large organic hemp tote bag for shopping and daily use. Naturally durable and grows stronger with use.",
            "price": 22.99,
            "category": "Fashion",
            "stock_quantity": 65,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 82,  # Hemp processing
                "carbon_footprint": 86,   # Carbon negative crop
                "recyclability": 88,      # Natural fiber
                "durability": 92,         # Hemp is very strong
                "material_sustainability": 94  # Sustainable hemp farming
            }
        },
        {
            "name": "Biodegradable Phone Charger Cable",
            "description": "USB-C charging cable with biodegradable wheat straw coating. Fast charging with eco-friendly materials.",
            "price": 19.99,
            "category": "Electronics",
            "stock_quantity": 90,
            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 90,  # Efficient charging
                "carbon_footprint": 78,   # Plant-based coating
                "recyclability": 70,      # Mixed materials
                "durability": 75,         # Good but biodegradable
                "material_sustainability": 85  # Plant-based components
            }
        },
        {
            "name": "Sustainable Bamboo Desk Organizer",
            "description": "Multi-compartment desk organizer made from sustainably sourced bamboo. Perfect for office organization.",
            "price": 39.99,
            "category": "Home & Garden",
            "stock_quantity": 40,
            "image_url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 85,  # Simple manufacturing
                "carbon_footprint": 90,   # Bamboo carbon benefits
                "recyclability": 92,      # Biodegradable
                "durability": 82,         # Quality bamboo
                "material_sustainability": 93  # Sustainable bamboo
            }
        },
        {
            "name": "Energy Efficient Air Purifier",
            "description": "HEPA air purifier with energy-saving mode. Made with recycled plastics and replaceable eco-friendly filters.",
            "price": 149.99,
            "category": "Home & Garden",
            "stock_quantity": 25,
            "image_url": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 88,  # Energy saving features
                "carbon_footprint": 68,   # Manufacturing impact
                "recyclability": 72,      # Mixed materials
                "durability": 85,         # Quality components
                "material_sustainability": 75  # Some recycled content
            }
        },
        {
            "name": "Recycled Plastic Outdoor Furniture Set",
            "description": "2-chair patio set made from 100% recycled ocean plastic. Weather-resistant and maintenance-free.",
            "price": 299.99,
            "category": "Home & Garden",
            "stock_quantity": 15,
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 78,  # Recycling process
                "carbon_footprint": 85,   # Ocean plastic cleanup
                "recyclability": 90,      # Plastic recyclable
                "durability": 92,         # Weather resistant
                "material_sustainability": 95  # Ocean plastic cleanup
            }
        },
        {
            "name": "Organic Cotton Bed Sheets Set",
            "description": "Queen size organic cotton sheet set. GOTS certified organic cotton with natural dyes. Hypoallergenic.",
            "price": 89.99,
            "category": "Home & Garden",
            "stock_quantity": 30,
            "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 75,  # Cotton processing
                "carbon_footprint": 82,   # Organic farming
                "recyclability": 85,      # Natural fibers
                "durability": 88,         # Quality cotton
                "material_sustainability": 90  # GOTS certified organic
            }
        },
        {
            "name": "Solar Garden Light Set",
            "description": "6-pack of solar-powered garden lights with auto on/off sensors. Weather-resistant with rechargeable batteries.",
            "price": 45.99,
            "category": "Home & Garden",
            "stock_quantity": 50,
            "image_url": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 98,  # Solar powered
                "carbon_footprint": 78,   # Zero operating emissions
                "recyclability": 75,      # Mixed materials
                "durability": 80,         # Outdoor rated
                "material_sustainability": 82  # Renewable energy
            }
        },
        {
            "name": "Compostable Coffee Pods 50-Pack",
            "description": "Organic coffee in 100% compostable pods. Compatible with Keurig machines. Rainforest Alliance certified.",
            "price": 34.99,
            "category": "Food & Beverages",
            "stock_quantity": 85,
            "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop",
            "sustainability": {
                "energy_efficiency": 80,  # Coffee processing
                "carbon_footprint": 85,   # Sustainable farming
                "recyclability": 95,      # Compostable pods
                "durability": 70,         # Single use but eco-friendly
                "material_sustainability": 88  # Rainforest Alliance certified
            }
        }
    ]

    print("🌱 Adding 20 eco-friendly products to Green Cart database...")
    print("=" * 60)
    
    # Category mapping (frontend names to IDs)
    category_mapping = {
        'Electronics': 1,
        'Fashion': 2,
        'Home & Garden': 3,
        'Beauty & Personal Care': 4,
        'Sports & Outdoors': 5,
        'Books & Media': 6,
        'Food & Beverages': 7,
        'Automotive': 8,
        'Health & Wellness': 9,
        'Baby & Kids': 10
    }

    successful_products = 0
    failed_products = 0

    for i, product in enumerate(eco_products, 1):
        try:
            print(f"\n[{i}/20] Adding: {product['name']}")
            
            # Prepare the data
            data = {
                'name': product['name'],
                'description': product['description'],
                'price': product['price'],
                'category_id': category_mapping[product['category']],
                'retailer_id': 3,  # Use existing retailer
                'stock_quantity': product['stock_quantity'],
                # Sustainability ratings
                'energy_efficiency': product['sustainability']['energy_efficiency'],
                'carbon_footprint': product['sustainability']['carbon_footprint'],
                'recyclability': product['sustainability']['recyclability'],
                'durability': product['sustainability']['durability'],
                'material_sustainability': product['sustainability']['material_sustainability']
            }
            
            # Create a simple 1x1 pixel image as placeholder
            # We'll add image URL separately to the database
            fake_image = b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00\xFF\xC0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xFF\xC4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xFF\xC4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xAA\xFF\xD9'
            
            files = {
                'images': ('eco_product.jpg', fake_image, 'image/jpeg')
            }
            
            # Make the request
            response = requests.post(f"{base_url}/product-images/products/", 
                                   files=files, data=data, timeout=30)
            
            if response.status_code == 201:
                result = response.json()
                product_id = result.get('product_id')
                ratings_added = result.get('sustainability_ratings_added', 0)
                
                print(f"   ✅ SUCCESS! Product ID: {product_id}")
                print(f"   📊 Sustainability ratings: {ratings_added}")
                
                # Calculate expected sustainability score
                scores = product['sustainability']
                expected_score = (scores['energy_efficiency'] + scores['carbon_footprint'] + 
                                scores['recyclability'] + scores['durability'] + 
                                scores['material_sustainability']) / 5
                print(f"   🌱 Expected sustainability score: {expected_score:.1f}%")
                
                successful_products += 1
                
                # Note about image URL (would need separate database update)
                print(f"   🖼️  Image URL: {product['image_url']}")
                print(f"   💰 Price: ${product['price']}")
                
            else:
                print(f"   ❌ FAILED! Status: {response.status_code}")
                print(f"   Error: {response.text}")
                failed_products += 1
                
        except Exception as e:
            print(f"   💥 ERROR: {str(e)}")
            failed_products += 1
            
        # Small delay to avoid overwhelming the server
        import time
        time.sleep(1)

    print("\n" + "=" * 60)
    print("🏁 SUMMARY:")
    print(f"   ✅ Successfully added: {successful_products} products")
    print(f"   ❌ Failed to add: {failed_products} products")
    print(f"   📊 Total sustainability ratings created: {successful_products * 5}")
    
    if successful_products > 0:
        print(f"\n🌱 Your Green Cart now has {successful_products} new eco-friendly products!")
        print("   These products include:")
        print("   • Bamboo kitchenware and utensils")
        print("   • Solar-powered electronics")
        print("   • Biodegradable phone accessories") 
        print("   • Energy-efficient appliances")
        print("   • Recycled and organic materials")
        print("   • Sustainable stationary and office supplies")
        
        print(f"\n📝 NOTE: Image URLs are provided but not stored in S3.")
        print("   You can manually update the product_images table with these URLs:")
        for product in eco_products[:3]:  # Show first 3 as examples
            print(f"   • {product['name']}: {product['image_url']}")
        print("   ... (and 17 more)")

if __name__ == "__main__":
    add_eco_products()
