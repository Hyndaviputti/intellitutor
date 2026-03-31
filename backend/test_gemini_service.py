from services.gemini_service import GeminiService

# Test the Gemini service
gs = GeminiService()
response = gs.chat_response('Hello, explain Python in one sentence')
print('Response:', response)
