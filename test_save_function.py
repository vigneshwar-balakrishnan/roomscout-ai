#!/usr/bin/env python3
"""
Test script to directly test the save function
"""

import requests
import json

def test_save_function():
    """Test the save function directly"""
    
    # Test data
    extracted_data = {
        "rent_price": "$575/month",
        "location": "1 Cornelia Ct, Boston",
        "room_type": "hall spot in a 3BHK",
        "availability_date": "Available now",
        "contact_info": "+1 857-891-9600",
        "gender_preference": None,
        "additional_notes": "utilities included, 12 mins walk to NEU",
        "is_housing_related": True
    }
    
    original_message = "🏠 *Permanent Accommodation Available!* 1 hall spot in a 3BHK, $575/month + utilities. 1 Cornelia Ct, Boston. 12 mins walk to NEU. DM +1 857-891-9600."
    
    print("🔍 Testing save function directly...")
    
    # Test the Express API endpoint directly
    try:
        # Prepare listing data manually
        listing_data = {
            "title": "Housing Listing - 1 Cornelia Ct, Boston",
            "description": original_message[:200] + "...",
            "price": 575,
            "rentType": "monthly",
            "location": {
                "address": "1 Cornelia Ct",
                "city": "Boston",
                "state": "MA",
                "zipCode": "02120",
                "neighborhood": "Fenway",
                "walkTimeToNEU": 8,
                "transitTimeToNEU": 5
            },
            "bedrooms": 1,
            "bathrooms": 1,
            "propertyType": "apartment",
            "roomType": "single",
            "availability": {
                "startDate": "2024-08-07T20:00:00.000Z",
                "isAvailable": True
            },
            "leaseTerms": {
                "minLease": 12,
                "deposit": 0,
                "utilitiesIncluded": True
            },
            "contactInfo": {
                "phone": "+1 857-891-9600",
                "email": "",
                "preferredContact": "phone",
                "responseTime": "within_day"
            },
            "amenities": ["utilities_included"],
            "northeasternFeatures": {
                "shuttleAccess": False,
                "bikeFriendly": True,
                "studySpaces": False
            },
            "roommatePreferences": {
                "gender": "any"
            },
            "source": "extracted_from_chat",
            "extractedData": {
                "rent_price": "$575/month",
                "location": "1 Cornelia Ct, Boston",
                "room_type": "hall spot in a 3BHK",
                "availability_date": "Available now",
                "contact_info": "+1 857-891-9600",
                "gender_preference": None,
                "additional_notes": "utilities included, 12 mins walk to NEU",
                "is_housing_related": True
            },
            "classification": "HOUSING",
            "processingMetadata": {
                "originalMessage": original_message,
                "extractionMethod": "hybrid",
                "confidence": 0.8,
                "langchainVersion": "2.1",
                "validationErrors": [],
                "needsReview": False
            },
            "confidence": 0.8,
            "isVerified": False,
            "status": "active",
            "images": [],
            "views": 0,
            "favorites": [],
            "tags": ["ai-extracted", "whatsapp"]
        }
        
        print("📊 Sending listing data to Express API...")
        print(f"   Title: {listing_data['title']}")
        print(f"   Price: ${listing_data['price']}")
        print(f"   Location: {listing_data['location']['address']}")
        
        response = requests.post(
            "http://localhost:5000/api/housing/ai-extracted",
            json=listing_data,
            timeout=30
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Successfully saved listing to database!")
            print(f"   Listing ID: {data.get('listing')}")
            print(f"   Success: {data.get('success')}")
            return True
        else:
            print(f"❌ Failed to save listing: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_save_function()
