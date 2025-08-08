#!/usr/bin/env python3
"""
Debug script to test extraction and database save step by step
"""

import requests
import json

def test_extraction_step_by_step():
    """Test extraction and database save step by step"""
    
    # Test message
    message = "🏠 *Permanent Accommodation Available!* 1 hall spot in a 3BHK, $575/month + utilities. 1 Cornelia Ct, Boston. 12 mins walk to NEU. DM +1 857-891-9600."
    
    print("🔍 Testing extraction step by step...")
    print(f"Message: {message[:50]}...")
    
    # Step 1: Test Python API extraction
    print("\n1️⃣ Testing Python API extraction...")
    try:
        response = requests.post(
            "http://localhost:5001/extract-and-save",
            json={"message": message},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Python API extraction successful")
            print(f"   Is Housing: {data.get('extraction_result', {}).get('is_housing')}")
            print(f"   Saved to DB: {data.get('saved_to_database')}")
            
            extracted_data = data.get('extraction_result', {}).get('extracted_data', {})
            if extracted_data:
                print(f"   Price: {extracted_data.get('rent_price')}")
                print(f"   Location: {extracted_data.get('location')}")
                print(f"   Room Type: {extracted_data.get('room_type')}")
        else:
            print(f"❌ Python API failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Python API error: {e}")
        return False
    
    # Step 2: Test Express API endpoint directly
    print("\n2️⃣ Testing Express API endpoint directly...")
    try:
        test_payload = {
            "title": "Test Listing",
            "description": "Test description",
            "price": 575,
            "location": {
                "address": "1 Cornelia Ct",
                "city": "Boston",
                "state": "MA",
                "zipCode": "02120",
                "neighborhood": "Fenway"
            },
            "bedrooms": 1,
            "bathrooms": 1,
            "propertyType": "apartment",
            "roomType": "single",
            "classification": "HOUSING",
            "extractedData": {"is_housing_related": True},
            "processingMetadata": {"originalMessage": "Test message"},
            "availability": {
                "startDate": "2024-08-07T20:00:00.000Z",
                "isAvailable": True
            }
        }
        
        response = requests.post(
            "http://localhost:5000/api/housing/ai-extracted",
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Express API save successful")
            print(f"   Listing ID: {data.get('listing')}")
        else:
            print(f"❌ Express API failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Express API error: {e}")
        return False
    
    # Step 3: Test the full pipeline
    print("\n3️⃣ Testing full pipeline via Express API...")
    try:
        response = requests.post(
            "http://localhost:5000/api/chat/extract-and-save",
            json={"message": message},
            timeout=90
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Full pipeline successful")
            print(f"   Saved to DB: {data.get('saved_to_database')}")
            print(f"   Success: {data.get('success')}")
        else:
            print(f"❌ Full pipeline failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Full pipeline error: {e}")
        return False
    
    print("\n🎉 All tests completed!")
    return True

if __name__ == "__main__":
    test_extraction_step_by_step()
