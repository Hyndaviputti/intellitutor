import requests
import json

base_url = "http://localhost:5000"

# First, let's create a test user and login
register_data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123"
}

try:
    # Register user
    response = requests.post(f"{base_url}/api/user/register", json=register_data)
    print(f"Register: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        token = response.json()['access_token']
        user_id = response.json()['user_id']
        
        # Test authenticated endpoints
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test chat sessions
        sessions_response = requests.get(f"{base_url}/api/ai/chat/sessions", headers=headers)
        print(f"\nChat sessions: {sessions_response.status_code}")
        print(f"Response: {sessions_response.json()}")
        
        # Test sending a chat message
        chat_data = {
            "message": "Hello, can you explain what is Python?",
            "session_id": "test_session_123"
        }
        chat_response = requests.post(f"{base_url}/api/ai/chat", json=chat_data, headers=headers)
        print(f"\nSend chat: {chat_response.status_code}")
        print(f"Response: {chat_response.json()}")
        
        # Test revision endpoints
        revision_response = requests.get(f"{base_url}/api/revision/due", headers=headers)
        print(f"\nRevision due: {revision_response.status_code}")
        print(f"Response: {revision_response.json()}")
        
except Exception as e:
    print(f"Error: {e}")
