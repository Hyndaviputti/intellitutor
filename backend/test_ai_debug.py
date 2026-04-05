import os
import sys
import traceback
from dotenv import load_dotenv

# Define the paths
BACKEND_DIR = r"c:\Users\putti\OneDrive\Desktop\IntellitutorAi final year project\intellitutor\backend"
sys.path.append(BACKEND_DIR)

from services.gemini_service import GeminiService

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

def test_chat():
    with open("ai_test_output.log", "w", encoding="utf-8") as f:
        sys.stdout = f
        sys.stderr = f
        
        gemini = GeminiService()
        message = "who is alluarjun"
        print(f"Testing chat_response with: {message}")
        try:
            response = gemini.chat_response(message)
            print(f"\nAI Response: {response}")
        except Exception:
            print("\nCaught Exception in test routine:")
            traceback.print_exc()
            
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

if __name__ == "__main__":
    test_chat()
