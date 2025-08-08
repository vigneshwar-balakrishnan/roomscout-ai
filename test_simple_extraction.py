#!/usr/bin/env python3
"""
Simple test to verify extraction and save function
"""

import requests
import json

def test_simple_extraction():
    """Test simple extraction and save"""
    
    print("🔍 Testing simple extraction...")
    
    # Test 1: Non-housing message (should not save)
    print("\n1️⃣ Testing non-housing message...")
    response = requests.post(
        "http://localhost:5001/process",
        json={"message": "Hello there!"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        result = data.get('result', data)  # Handle both old and new response formats
        print(f"✅ Success: {result.get('is_housing')}")
        print(f"📊 Saved to DB: {result.get('saved_to_database')}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test 2: Housing message (should save)
    print("\n2️⃣ Testing housing message...")
    response = requests.post(
        "http://localhost:5001/process",
        json={"message": "🏠 *Permanent Accommodation Available!* 1 hall spot in a 3BHK, $575/month + utilities. 1 Cornelia Ct, Boston. 12 mins walk to NEU. DM +1 857-891-9600."},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        result = data.get('result', data)  # Handle both old and new response formats
        print(f"✅ Success: {result.get('is_housing')}")
        print(f"📊 Saved to DB: {result.get('saved_to_database')}")
        
        extracted_data = result.get('extracted_data', {})
        if extracted_data:
            print(f"💰 Price: {extracted_data.get('rent_price')}")
            print(f"📍 Location: {extracted_data.get('location')}")
            print(f"🏘️ Room Type: {extracted_data.get('room_type')}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test 3: Check if listings were saved
    print("\n3️⃣ Checking saved listings...")
    response = requests.get("http://localhost:5000/api/housing")
    
    if response.status_code == 200:
        data = response.json()
        listings = data.get('listings', [])
        extracted_listings = [l for l in listings if l.get('source') == 'extracted_from_chat']
        print(f"📊 Total listings: {len(listings)}")
        print(f"📊 Extracted listings: {len(extracted_listings)}")
        
        if extracted_listings:
            print("✅ Found extracted listings!")
            for listing in extracted_listings[:3]:
                print(f"   - {listing.get('title')} - ${listing.get('price')}")
        else:
            print("❌ No extracted listings found")
    else:
        print(f"❌ Failed to get listings: {response.status_code}")

if __name__ == "__main__":
    test_simple_extraction()
