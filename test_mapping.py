#!/usr/bin/env python3
"""
Test sustainability mapping without product creation
"""
import requests

def test_sustainability_mapping():
    """Test the sustainability mapping endpoint"""
    url = "http://localhost:8000/product-images/test-sustainability"
    
    data = {
        'energy_efficiency': 70.0,
        'carbon_footprint': 60.0,
        'recyclability': 20.0,
        'durability': 90.0,
        'material_sustainability': 68.0
    }
    
    print("Testing sustainability field mapping...")
    print(f"Sending: {data}")
    
    try:
        response = requests.post(url, data=data)
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nSuccessful mappings: {result['successful_mappings']}")
            print("\nMapping results:")
            for mapping in result['mapped_ratings']:
                status = "✅" if mapping['success'] else "❌"
                print(f"  {status} {mapping['input_field']} ({mapping['input_value']}) -> {mapping['matched_type_name']} (ID: {mapping['matched_type_id']})")
            
            print(f"\nAvailable types in database:")
            for t in result['available_types']:
                print(f"  - {t['name']} (ID: {t['id']})")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_sustainability_mapping()
