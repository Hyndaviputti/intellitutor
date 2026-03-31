import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Test Gemini API directly
api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key found: {bool(api_key)}")
print(f"API Key starts with: {api_key[:10]}..." if api_key else "No API key")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Simple test
    response = model.generate_content("Hello, can you explain what is Python in one sentence?")
    print(f"\nGemini API test successful!")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"\nGemini API test failed: {e}")
    print(f"Error type: {type(e)}")
    
    # Check if it's an API key issue
    if "quota" in str(e).lower() or "api" in str(e).lower():
        print("This might be an API key or quota issue")
    elif "network" in str(e).lower() or "connection" in str(e).lower():
        print("This might be a network connectivity issue")
    else:
        print("This might be a different issue")
