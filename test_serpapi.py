import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_serpapi():
    serpapi_key = os.getenv("SERPAPI_KEY")
    
    if not serpapi_key:
        print("❌ No SerpAPI key found")
        return
        
    print(f"🔑 Testing SerpAPI key: {serpapi_key[:8]}...{serpapi_key[-4:]}")
    
    # Simple test search
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google",
        "q": "test",
        "api_key": serpapi_key
    }
    
    response = requests.get(url, params=params)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SerpAPI key is working!")
        data = response.json()
        print(f"Found {len(data.get('organic_results', []))} results")
    else:
        print(f"❌ Error: {response.text[:500]}")

if __name__ == "__main__":
    test_serpapi()