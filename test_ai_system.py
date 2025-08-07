#!/usr/bin/env python3
"""
Focused AI Housing Assistant Test Suite
Tests the most critical functionality quickly
"""

import json
import requests
import time
import sys
from datetime import datetime

# API endpoints
PYTHON_API_URL = "http://localhost:5001"
EXPRESS_API_URL = "http://localhost:5000"

def test_query(query, query_type, api_url):
    """Test a single query and return results"""
    try:
        if api_url == PYTHON_API_URL:
            response = requests.post(
                f"{api_url}/chat-query",
                json={"message": query},
                timeout=10
            )
        else:
            response = requests.post(
                f"{api_url}/api/chat/chat-query",
                json={"message": query},
                timeout=10
            )
        
        if response.status_code == 200:
            data = response.json()
            # Handle cases where data might be null
            response_data = data.get("data") or {}
            ai_generated = data.get("ai_generated")
            
            return {
                "success": True,
                "query": query,
                "type": query_type,
                "response_type": data.get("type"),
                "has_listings": bool(response_data.get("listings")),
                "listing_count": len(response_data.get("listings", [])),
                "search_criteria": response_data.get("search_criteria"),
                "ai_generated": ai_generated if ai_generated is not None else False,
                "response_length": len(data.get("response", "")),
                "suggestions": data.get("suggestions", []),
                "raw_response": data.get("response", "")[:100]  # First 100 chars for debugging
            }
        else:
            return {
                "success": False,
                "query": query,
                "type": query_type,
                "error": f"HTTP {response.status_code}",
                "response": response.text[:200]
            }
    except Exception as e:
        return {
            "success": False,
            "query": query,
            "type": query_type,
            "error": str(e)
        }

def analyze_results(results):
    """Analyze test results and identify issues"""
    issues = []
    stats = {
        "total": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
        "ai_generated": sum(1 for r in results if r.get("ai_generated", False)),
        "with_listings": sum(1 for r in results if r.get("has_listings", False)),
        "types": {}
    }
    
    # Count response types
    for result in results:
        if result["success"]:
            resp_type = result.get("response_type", "unknown")
            stats["types"][resp_type] = stats["types"].get(resp_type, 0) + 1
    
    # Identify issues
    if stats["failed"] > 0:
        issues.append(f"❌ {stats['failed']} queries failed completely")
    
    if stats["ai_generated"] < stats["successful"] * 0.5:
        issues.append(f"⚠️  Only {stats['ai_generated']}/{stats['successful']} responses were AI-generated")
    
    # Check for search queries that should have listings
    search_queries_without_listings = [
        r for r in results 
        if r["success"] and r["type"] in ["complex", "general"] and not r.get("has_listings", False) and "housing" in r.get("response_type", "")
    ]
    if len(search_queries_without_listings) > len(results) * 0.5:
        issues.append(f"🔍 {len(search_queries_without_listings)} search queries returned no listings (may indicate database issues)")
    
    return stats, issues

def main():
    print("🧪 Focused AI Housing Assistant Test Suite")
    print("=" * 50)
    
    # Test focused set of queries
    test_queries = {
        "search_queries": [
            "show me housing above 2000 dollars",
            "show me housing below 2000 dollars", 
            "find 1BR apartments",
            "housing under 1500",
            "apartments in Mission Hill"
        ],
        "conversational": [
            "hello there",
            "what can you help me with?",
            "tell me about Mission Hill",
            "how much should I budget?",
            "goodbye"
        ]
    }
    
    # Test health endpoints first
    print("\n🏥 Testing API Health...")
    try:
        python_health = requests.get(f"{PYTHON_API_URL}/health", timeout=3)
        express_health = requests.get(f"{EXPRESS_API_URL}/api/health", timeout=3)
        
        print(f"  Python API: {'✅' if python_health.status_code == 200 else '❌'}")
        print(f"  Express API: {'✅' if express_health.status_code == 200 else '❌'}")
        
        if python_health.status_code == 200:
            health_data = python_health.json()
            print(f"  OpenAI configured: {'✅' if health_data.get('openai_configured') else '❌'}")
            print(f"  Model: {health_data.get('model_used', 'unknown')}")
    except Exception as e:
        print(f"  ❌ Health check failed: {e}")
    
    all_results = []
    
    # Test 1: Search Queries  
    print(f"\n🔍 Testing {len(test_queries['search_queries'])} Search Queries...")
    for i, query in enumerate(test_queries["search_queries"], 1):
        print(f"  {i:2d}. Testing: {query}")
        result = test_query(query, "search", EXPRESS_API_URL)
        all_results.append(result)
        
        if result["success"]:
            status = f"✅ ({result.get('response_type', 'unknown')})"
            if result.get("has_listings"):
                status += f" ({result['listing_count']} listings)"
        else:
            status = f"❌ {result.get('error', 'unknown error')}"
        
        print(f"      {status}")
        time.sleep(0.2)  # Reduced delay
    
    # Test 2: Conversational Queries
    print(f"\n💬 Testing {len(test_queries['conversational'])} Conversational Queries...")
    for i, query in enumerate(test_queries["conversational"], 1):
        print(f"  {i:2d}. Testing: {query}")
        result = test_query(query, "conversational", EXPRESS_API_URL)
        all_results.append(result)
        
        if result["success"]:
            status = f"✅ ({result.get('response_type', 'unknown')})"
        else:
            status = f"❌ {result.get('error', 'unknown error')}"
        
        print(f"      {status}")
        time.sleep(0.2)
    
    # Analyze Results
    print("\n📊 ANALYSIS RESULTS")
    print("=" * 50)
    
    stats, issues = analyze_results(all_results)
    
    print(f"Total Queries: {stats['total']}")
    print(f"Successful: {stats['successful']} ✅")
    print(f"Failed: {stats['failed']} ❌")
    print(f"AI Generated: {stats['ai_generated']} 🤖")
    print(f"With Listings: {stats['with_listings']} 🏠")
    
    print(f"\nResponse Types:")
    for resp_type, count in stats['types'].items():
        print(f"  {resp_type}: {count}")
    
    if issues:
        print(f"\n🚨 ISSUES IDENTIFIED:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print(f"\n🎉 NO MAJOR ISSUES FOUND!")
    
    # Show sample responses
    print(f"\n📝 SAMPLE RESPONSES:")
    for result in all_results[:3]:
        if result["success"]:
            print(f"  Query: {result['query'][:30]}...")
            print(f"  Type: {result['response_type']}")
            print(f"  Response: {result['raw_response'][:60]}...")
            print(f"  AI Generated: {result['ai_generated']}")
            print("  ---")
    
    # Return exit code based on success rate
    success_rate = stats['successful'] / stats['total'] if stats['total'] > 0 else 0
    if success_rate >= 0.8:
        print(f"\n🎯 GOOD: {success_rate:.1%} success rate")
        return 0
    else:
        print(f"\n⚠️  ISSUES: {success_rate:.1%} success rate")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 