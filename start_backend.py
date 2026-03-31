import os
import sys
import subprocess

# Change to backend directory
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)

print(f"Starting backend from: {os.getcwd()}")
print(f"Environment file exists: {os.path.exists('.env')}")

# Load environment to verify
from dotenv import load_dotenv
load_dotenv()
print(f"GEMINI_API_KEY loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")

# Start Flask app
subprocess.run([sys.executable, 'app.py'])
