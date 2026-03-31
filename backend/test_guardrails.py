import os
from dotenv import load_dotenv

load_dotenv()

from services.gemini_service import GeminiService

gemini = GeminiService()

# Test 1: Non-educational topic to trigger guardrail
print("--- TEST 1: Non-educational Topic ---")
result_1 = gemini.generate_quiz("Movie Gossip", "easy", 3)
print(result_1)

# Test 2: Educational topic
print("\n--- TEST 2: Educational Topic ---")
result_2 = gemini.generate_quiz("Python programming", "easy", 3)
print(f"Contains questions: {'questions' in result_2}")
if 'questions' in result_2:
    print(f"Number of questions: {len(result_2['questions'])}")
