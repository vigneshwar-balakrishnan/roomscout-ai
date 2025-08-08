#!/usr/bin/env python3
"""
Test script to verify extraction fixes and database storage
"""

import requests
import json
import time
from datetime import datetime

# API endpoints
PYTHON_API_URL = "http://localhost:5001"
EXPRESS_API_URL = "http://localhost:5000"

def test_extraction_and_save(message, test_name):
    """Test extraction and database save"""
    print(f"\n🧪 Testing: {test_name}")
    print(f"Message: {message[:50]}...")
    
    try:
        # Test the new extract-and-save endpoint
        response = requests.post(
            f"{EXPRESS_API_URL}/api/chat/extract-and-save",
            json={"message": message},
            timeout=90  # 90 seconds timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', data)  # Handle both old and new response formats
            print(f"✅ Success: {data.get('success')}")
            print(f"📊 Saved to DB: {result.get('saved_to_database')}")
            
            extraction_result = result
            print(f"🏠 Is Housing: {extraction_result.get('is_housing')}")
            print(f"🎯 Confidence: {extraction_result.get('confidence_score', 0):.2f}")
            print(f"🔧 Method: {extraction_result.get('extraction_method')}")
            
            extracted_data = extraction_result.get('extracted_data', {})
            if extracted_data:
                print(f"💰 Price: {extracted_data.get('rent_price')}")
                print(f"📍 Location: {extracted_data.get('location')}")
                print(f"🏘️ Room Type: {extracted_data.get('room_type')}")
                print(f"📞 Contact: {extracted_data.get('contact_info')}")
            
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout error - request took too long")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_health_endpoints():
    """Test health endpoints"""
    print("🏥 Testing API Health...")
    
    try:
        # Test Python API health
        python_health = requests.get(f"{PYTHON_API_URL}/health", timeout=5)
        print(f"  Python API: {'✅' if python_health.status_code == 200 else '❌'}")
        
        # Test Express API health
        express_health = requests.get(f"{EXPRESS_API_URL}/api/health", timeout=5)
        print(f"  Express API: {'✅' if express_health.status_code == 200 else '❌'}")
        
        return python_health.status_code == 200 and express_health.status_code == 200
        
    except Exception as e:
        print(f"  ❌ Health check failed: {e}")
        return False

def main():
    print("🔧 RoomScout AI Extraction Fix Test")
    print("=" * 50)
    
    # Test health first
    if not test_health_endpoints():
        print("❌ Health check failed - APIs not available")
        return
    
    # Test messages
    test_messages = [
        {
            "message": "🏠 *Permanent Accommodation Available!* 1 hall spot in a 3BHK, $575/month + utilities. 1 Cornelia Ct, Boston. 12 mins walk to NEU. DM +1 857-891-9600.",
            "name": "WhatsApp Housing Message"
        },
        {
            "message": "Looking for a room in Mission Hill, budget $800/month. Any leads?",
            "name": "Housing Search Query"
        },
        {
            "message": "Hello there! How are you doing?",
            "name": "Non-Housing Message"
        },
        {
            "message": "Studio apartment in Back Bay, $1500/month, available September 1st. Contact 617-555-0123",
            "name": "Detailed Housing Listing"
        }
    ]
    
    success_count = 0
    total_count = len(test_messages)
    
    for test in test_messages:
        if test_extraction_and_save(test["message"], test["name"]):
            success_count += 1
        time.sleep(1)  # Brief pause between tests
    
    print(f"\n📊 RESULTS SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {total_count}")
    print(f"Successful: {success_count} ✅")
    print(f"Failed: {total_count - success_count} ❌")
    print(f"Success Rate: {(success_count/total_count)*100:.1f}%")
    
    if success_count == total_count:
        print("🎉 All tests passed! Extraction and database storage working correctly.")
    else:
        print("⚠️ Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
