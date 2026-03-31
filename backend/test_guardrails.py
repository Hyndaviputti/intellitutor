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

# Test 3: Explanation - Non-educational
print("\n--- TEST 3: Explanation - Non-educational Topic ---")
result_3 = gemini.generate_explanation("Who won the Oscar for best actor recently?")
print(result_3)

# Test 4: Explanation - Educational 
print("\n--- TEST 4: Explanation - Educational Topic ---")
result_4 = gemini.generate_explanation("What is a neural network?")
print(f"Contains concept: {'concept' in result_4}")

# Test 5: Chat - Non-educational
print("\n--- TEST 5: Chat - Non-educational Topic ---")
result_5 = gemini.chat_response("Can you tell me about the latest football match?")
print(result_5)

# Test 6: Chat - Educational
print("\n--- TEST 6: Chat - Educational Topic ---")
result_6 = gemini.chat_response("How does a binary search tree work?")
print(result_6[:100] + "...")
