import google.generativeai as genai
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv('GEMINI_API_KEY')
    print(f"Testing Gemini Key: {api_key[:10]}...")
    try:
        genai.configure(api_key=api_key)
        # Using model name used in service
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Say hello in one word")
        print(f"Gemini SUCCESS: {response.text}")
        return True
    except Exception as e:
        print(f"Gemini FAILED: {e}")
        return False

def test_openrouter():
    api_key = os.getenv('QWEN_API_KEY')
    print(f"Testing OpenRouter Key: {api_key[:10]}...")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "qwen/qwen3-235b-a22b",
        "messages": [{"role": "user", "content": "Say hello in one word"}],
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        if resp.status_code == 200:
            print("OpenRouter SUCCESS")
            return True
        else:
            print(f"OpenRouter FAILED: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"OpenRouter ERROR: {e}")
        return False

if __name__ == "__main__":
    print("--- API Key Diagnostics ---")
    gemini_ok = test_gemini()
    print("-" * 30)
    openrouter_ok = test_openrouter()
    print("-" * 30)
    if not (gemini_ok or openrouter_ok):
        print("CRITICAL: All AI services are failing with current keys.")
    else:
        print("DIAGNOSTICS COMPLETE")
