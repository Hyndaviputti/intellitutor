import requests
import json

# Test API endpoints
base_url = "http://localhost:5000"

# Test health endpoint
try:
    response = requests.get(f"{base_url}/api/health")
    print(f"Health check: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Health check failed: {e}")

# Test root endpoint
try:
    response = requests.get(f"{base_url}/")
    print(f"\nRoot endpoint: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Root endpoint failed: {e}")

# Test login with dummy credentials
try:
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = requests.post(f"{base_url}/api/user/login", json=login_data)
    print(f"\nLogin test: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Login test failed: {e}")
