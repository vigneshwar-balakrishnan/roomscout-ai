#!/usr/bin/env python3
"""
Script to check listings in the database
"""

import requests
import json

def check_listings():
    """Check listings in the database"""
    
    print("🔍 Checking listings in database...")
    
    try:
        response = requests.get("http://localhost:5000/api/housing", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            listings = data.get('listings', [])
            extracted_listings = [l for l in listings if l.get('source') == 'extracted_from_chat']
            
            print(f"📊 Total listings: {len(listings)}")
            print(f"📊 Extracted listings: {len(extracted_listings)}")
            
            if extracted_listings:
                print("✅ Found extracted listings!")
                for i, listing in enumerate(extracted_listings[-5:], 1):
                    print(f"  {i}. {listing.get('title')} - ${listing.get('price')}")
                    print(f"     Location: {listing.get('location', {}).get('address', 'N/A')}")
                    print(f"     Source: {listing.get('source')}")
                    print(f"     ID: {listing.get('_id')}")
                    print()
            else:
                print("❌ No extracted listings found")
                
                # Show all listings to debug
                print("\n🔍 All listings sources:")
                sources = {}
                for listing in listings:
                    source = listing.get('source', 'unknown')
                    sources[source] = sources.get(source, 0) + 1
                
                for source, count in sources.items():
                    print(f"  {source}: {count}")
        else:
            print(f"❌ Failed to get listings: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_listings()
