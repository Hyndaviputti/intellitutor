from google import genai
from google.genai import types
import os
import time
import requests
from dotenv import load_dotenv
import json

load_dotenv()

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
        self.openrouter_api_key = os.getenv('QWEN_API_KEY')  # OpenRouter API key
        self.openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        
        # Tier 1: Primary Model (OpenRouter)
        self.primary_model = "qwen/qwen-2.5-72b-instruct"
        
        # Tier 2: Gemini Models
        self.gemini_models = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
        ]
        
        # Tier 3: Free-tier fallback models on OpenRouter
        self.fallback_models = [
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemma-3-27b-it:free",
            "qwen/qwen3.6-plus-preview:free",
            "qwen/qwen3-coder:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
        ]

    def _call_fallback(self, prompt, model_name, max_tokens=1000):
        """Fallback: call LLM model via OpenRouter API."""
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": max_tokens
        }
        resp = requests.post(self.openrouter_url, headers=headers, json=payload, timeout=60)
        if resp.status_code == 402:
            raise Exception(f"OpenRouter 402 Payment Required for {model_name}")
        elif resp.status_code == 401:
            raise Exception(f"OpenRouter 401 Invalid API Key for {model_name}")
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    def _generate_content(self, prompt, max_tokens=1500):
        """Try Primary model -> Gemini -> OpenRouter free models -> Pollinations"""
        last_error = None

        # Tier 1: Primary Model (Qwen 2.5 72B Instruct on OpenRouter)
        if self.openrouter_api_key:
            try:
                print(f"[AI] Trying Primary model: {self.primary_model}")
                return self._call_fallback(prompt, self.primary_model, max_tokens=max_tokens)
            except Exception as e:
                print(f"[ERROR] Primary {self.primary_model} failed, falling back... ({e})")
                last_error = e

        # Tier 2: Try each Gemini model
        for model in self.gemini_models:
            try:
                print(f"[AI] Trying Gemini model: {model}")
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(max_output_tokens=max_tokens)
                )
                return response.text
            except Exception as e:
                print(f"[ERROR] Gemini {model} failed: {e}")
                last_error = e
                # Continue to next model or tier

        # Tier 3: Try each OpenRouter free model
        if self.openrouter_api_key:
            for fallback in self.fallback_models:
                try:
                    print(f"[FALLBACK] Trying OpenRouter: {fallback}")
                    return self._call_fallback(prompt, fallback, max_tokens=max_tokens)
                except Exception as e:
                    print(f"[ERROR] OpenRouter fallback {fallback} failed: {e}")
                    last_error = e
                    continue

        # Tier 4: Free unauthenticated fallback
        try:
            print("[FALLBACK] Trying Pollinations (Free Unauthenticated Tier)")
            r = requests.post("https://text.pollinations.ai/", 
                              json={"messages": [{"role": "user", "content": prompt}], "model": "openai"},
                              timeout=60)
            if r.status_code == 200 and r.text:
                return r.text
        except Exception as e:
            print(f"[ERROR] Pollinations failed: {e}")
            last_error = e

        # All models exhausted
        raise last_error or Exception("All AI services exhausted")

    def generate_explanation(self, question, context=None):
        try:
            prompt = f"""
STRICT SYSTEM GUARDRAIL: YOU ARE AN ACADEMIC AI TUTOR. 
YOU ARE PROHIBITED FROM ANSWERING NON-EDUCATIONAL QUERIES.

1. EVALUATE THE TOPIC:
   If the question "{question}" is about:
   - Entertainment, Celebrities, Actors, Movies (e.g., Allu Arjun, Bollywood, Hollywood)
   - Sports stars, Game scores, or Gossip
   - Politics, Casual chat, or Inappropriate content
   YOU MUST REFUSE TO ANSWER.

2. MANDATORY REFUSAL FORMAT (IF NON-EDUCATIONAL):
   Return ONLY this JSON:
   {{
     "concept": "Non-educational query",
     "explanation": "I apologize, but I am an AI tutor designed specifically for academic subjects like Science, Technology, Math, and History. I cannot provide information on entertainment, celebrities, or other non-academic topics. Please ask me something related to your studies!",
     "example": "",
     "key_points": [],
     "common_mistakes": [],
     "practice_question": ""
   }}

3. IF EDUCATIONAL:
   Provide an expert explanation for academics, education, science, technology, programming, history, math, or humanities.
   Return ONLY JSON in this format:
   {{
     "concept": "Short definition",
     "explanation": "Step-by-step explanation",
     "example": "Clear example",
     "key_points": ["point1", "point2", "point3"],
     "common_mistakes": ["mistake1", "mistake2"],
     "practice_question": "One test question"
   }}

---
CONTEXT: {f'Additional context: {context}' if context else 'No additional context provided'}
User question: {question}
"""
            
            response = self._generate_content(prompt)
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                # Fallback to plain text if JSON parsing fails
                return {
                    "concept": "Unable to parse structured response",
                    "explanation": response,
                    "example": "",
                    "key_points": [],
                    "common_mistakes": [],
                    "practice_question": ""
                }
        except Exception as e:
            # Fallback response when API fails
            return {
                "concept": "AI Service Unavailable",
                "explanation": f"I apologize, but I'm currently unable to process your question about: {question}. The AI service is temporarily unavailable. Please try again later.",
                "example": "This is a fallback response due to service unavailability.",
                "key_points": ["AI service unavailable", "Please try again later", "Contact support if issue persists"],
                "common_mistakes": ["None - this is a system message"],
                "practice_question": "Try again when the service is available"
            }
    
    def generate_quiz(self, topic, difficulty, num_questions=5):
        try:
            prompt = f"""
STRICT SYSTEM GUARDRAIL: YOU ARE AN ACADEMIC QUIZ GENERATOR.
YOU ARE PROHIBITED FROM GENERATING QUIZZES ON NON-EDUCATIONAL TOPICS.

1. EVALUATE THE TOPIC:
   If the topic "{topic}" is about:
   - Entertainment, Celebrities, Actors, Movies, or TV Shows (e.g., Allu Arjun, Hollywood)
   - Sports stars, general gossip, or non-academic pop culture
   - Politics, casual chat, or inappropriate content
   YOU MUST REFUSE.

2. MANDATORY REFUSAL FORMAT (IF NON-EDUCATIONAL):
   Return ONLY this JSON:
   {{"error": "This topic is not educational. I can only generate quizzes for academic subjects like Computer Science, Biology, or History."}}

3. IF EDUCATIONAL:
   Generate exactly {num_questions} multiple choice questions about {topic} at {difficulty} difficulty level.
   Return ONLY a JSON object with this exact structure:
   {{
       "questions": [
           {{
               "question": "Question text here",
               "options": ["Option A", "Option B", "Option C", "Option D"],
               "correct_answer": 0,
               "topic": "{topic}",
               "difficulty": "{difficulty}",
               "hint": "Brief hint.",
               "explanation": "Brief explanation."
           }}
       ]
   }}
"""
            
            response = self._generate_content(prompt)
            try:
                # Clean response to extract JSON
                response_text = response.strip()
                if response_text.startswith('```json'):
                    response_text = response_text.replace('```json', '').replace('```', '').strip()
                
                quiz_data = json.loads(response_text)
                
                # Check for explicit errors from the prompt guardrail
                if 'error' in quiz_data:
                    return {"error": quiz_data['error']}
                
                # Validate structure
                if 'questions' not in quiz_data:
                    return {"error": "Invalid quiz structure"}
                
                # Ensure each question has required fields
                for i, question in enumerate(quiz_data['questions']):
                    if 'correct_answer' not in question:
                        # Fallback to first option if no correct_answer specified
                        question['correct_answer'] = 0
                    
                    # Validate correct_answer is within options range
                    if 'options' in question:
                        correct_idx = question['correct_answer']
                        if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(question['options']):
                            question['correct_answer'] = 0
                    
                    # Ensure topic and difficulty are set
                    question['topic'] = question.get('topic', topic)
                    question['difficulty'] = question.get('difficulty', difficulty)
                    question['hint'] = question.get('hint', "Think about the core concepts of this topic to find the answer.")
                    question['explanation'] = question.get('explanation', "The correct answer is based on the fundamental principles of the topic.")
            
                return quiz_data
            except json.JSONDecodeError as e:
                return {"error": f"Failed to parse quiz questions: {str(e)}"}
        except Exception as e:
            # Fallback when ALL AI tiers fail: Try local Database
            print(f"[CRITICAL] All AI Services failed. Attempting database fallback for: {topic}")
            try:
                from models.content_model import content_model
                db_questions = content_model.get_questions_by_topic_name(topic, num_questions)
                
                if not db_questions:
                    # Final final fallback: some general questions if even the specific topic isn't found
                   db_questions = content_model.get_random_questions(num_questions)
                
                if db_questions:
                    print(f"[SUCCESS] Recovered {len(db_questions)} questions from local repository.")
                    return {"questions": db_questions, "source": "local_repository"}
                    
            except Exception as db_err:
                print(f"[FAIL] Local repository lookup failed: {db_err}")

            return {"error": f"Unified intelligence services are currently unavailable (Error 402/429). Our teachers are working to restore service. Underlying cause: {str(e)}"}
    
    def generate_study_plan(self, weak_topics, duration="3 days"):
        try:
            prompt = f"""
            Given weak topics: {weak_topics}, generate a structured study plan in JSON format for {duration}.
            
            CRITICAL: Return ONLY this JSON structure:
            {{
                "plan": [
                    {{
                        "day": 1,
                        "tasks": ["Task 1", "Task 2", "Task 3"]
                    }},
                    {{
                        "day": 2,
                        "tasks": ["Task 1", "Task 2", "Task 3"]
                    }},
                    {{
                        "day": 3,
                        "tasks": ["Task 1", "Task 2", "Task 3"]
                    }}
                ]
            }}
            
            Requirements:
            - Focus specifically on the weak topics provided
            - Each day should have 3-4 specific, actionable tasks
            - Tasks should be progressive and build on each other
            - Include both study and practice activities
            - Return valid JSON only, no additional text
            """
            
            response = self._generate_content(prompt)
            try:
                response_text = response.strip()
                if response_text.startswith('```json'):
                    response_text = response_text.replace('```json', '').replace('```', '').strip()
                
                study_plan = json.loads(response_text)
                return study_plan
            except json.JSONDecodeError:
                return {"error": "Failed to generate study plan"}
        except Exception as e:
            # Fallback when API fails
            return {
                "plan": [
                    {"day": 3, "tasks": ["Take practice quiz", "Review weak areas", "Prepare summary notes"]}
                ]
            }
            
    def generate_concept_map(self, topic):
        try:
            prompt = f"""
            Generate a concept map showing the prerequisite knowledge and related concepts for {topic}.
            
            CRITICAL: Return ONLY a JSON object with this exact structure:
            {{
                "nodes": [
                    {{"id": "1", "data": {{"label": "Core Concept"}}, "position": {{"x": 250, "y": 0}}}}
                ],
                "edges": [
                    {{"id": "e1-2", "source": "1", "target": "2", "animated": true, "label": "requires"}}
                ]
            }}
            
            Requirements:
            - Provide 5 to 10 nodes relating to {topic}.
            - One node should be labeled exactly the '{topic}' as the central concept.
            - Provide meaningful edges that connect prerequisites.
            - Ensure positions are logically spaced out in a top-down or left-right flow (x, y coordinates).
            - Return valid JSON only, no additional text.
            """
            
            response = self._generate_content(prompt)
            try:
                response_text = response.strip()
                
                # Robust JSON extraction
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
                
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {"error": "Failed to generate concept map format. AI returned invalid structure."}
        except Exception as e:
            return {"error": f"AI service unavailable: {str(e)}"}

    def chat_response(self, message, chat_history=None):
        try:
            context = ""
            if chat_history:
                context = "Previous conversation (last 3 messages):\n"
                for msg in chat_history[-3:]:  # Last 3 messages for context
                    context += f"User: {msg.get('user', '')}\n"
                    context += f"Tutor: {msg.get('tutor', '')}\n"
            
            prompt = f"""
STRICT SYSTEM GUARDRAIL: YOU ARE AN ACADEMIC AI TUTOR. 

1. CORE LIMITATION:
   You ONLY respond to educational, academic, or learning-related queries.
   
2. EXPLICIT REFUSAL RULES:
   If the user asks about:
   - Celebrities, Actors, Musicians, or Entertainment (e.g., "Who is Allu Arjun?", Movie plots, Song lyrics)
   - Sports, Politics, or General Gossip
   - Casual chit-chat or inappropriate content
   
   YOU MUST POLITELY REFUSE. Use this exact tone:
   "I apologize, but I am designed exclusively as an AI tutor for educational and academic topics. I cannot answer questions about movies, celebrities, or non-educational subjects. How can I help you with your studies in Science, Math, or Programming today?"

3. CONTEXT & MESSAGE:
   Context: {context}
   User: {message}

4. RESPONSE STYLE (FOR VALID QUERIES):
   - Educational, conversational, and step-by-step.
   - Use analogies and clear examples.
   - Keep it structured and beginner-friendly.
"""
            
            response = self._generate_content(prompt)
            return response
        except Exception as e:
            # Fallback response when API fails
            return f"I apologize, but I'm currently unable to process your message: '{message}'. The AI service is temporarily unavailable. Please try again later."

    def generate_training_suggestions(self, topic: str, score: float, total_questions: int) -> list:
        try:
            percent = (score / total_questions) * 100 if total_questions > 0 else 0
            prompt = f"""
            A student just completed a quiz on {topic} and scored {score} out of {total_questions} ({percent:.1f}%).
            
            Based on this score, suggest exactly 3 specific next steps for their learning. You must provide real educational resources.
            
            CRITICAL: Return ONLY this JSON structure exactly:
            {{
                "suggestions": [
                    {{
                        "type": "video",
                        "title": "Specific focus area video",
                        "duration": "10 min",
                        "icon": "play_circle",
                        "color": "primary",
                        "url": "https://www.youtube.com/results?search_query=specific+topic",
                        "search_keywords": ["keyword1", "keyword2", "keyword3"]
                    }},
                    {{
                        "type": "article",
                        "title": "Specific article topic",
                        "duration": "5 min read",
                        "icon": "book",
                        "color": "secondary",
                        "url": "https://developer.mozilla.org/... or real link",
                        "search_keywords": ["keyword1", "keyword2", "keyword3"]
                    }},
                    {{
                        "type": "practice",
                        "title": "Hands-on exercise",
                        "duration": "15 min",
                        "icon": "terminal",
                        "color": "tertiary",
                        "url": "https://www.freecodecamp.org/... or real link",
                        "search_keywords": ["keyword1", "keyword2", "keyword3"]
                    }}
                ]
            }}
            
            Requirements:
            - If score is low (< 60%), suggest fundamental/beginner materials.
            - If score is medium (60-80%), suggest intermediate review and practice.
            - If score is high (> 80%), suggest advanced concepts or practical application. 
            - Generate highly targeted `search_keywords` based entirely on the user's performance weakness for each specific suggestion.
            - Keep titles specific to {topic}. Do not use generic titles.
            - Provide a REAL, WORKING URL in the "url" field for each suggestion. Use reputable sources like MDN Web Docs, freeCodeCamp, GeeksforGeeks, W3Schools.
            - For video links, use a YouTube search link (`https://www.youtube.com/results?search_query=...`) with specific keywords if you do not know a direct video link.
            - Return valid JSON only, no markdown formatting.
            """
            
            response = self._generate_content(prompt)
            response_text = response.strip()
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            data = json.loads(response_text)
            return data.get("suggestions", [])
        except Exception as e:
            # Fallback
            return [
                {
                    "type": "article",
                    "title": f"Review Core Concepts of {topic}",
                    "duration": "15 min read",
                    "icon": "book",
                    "color": "secondary",
                    "url": f"https://www.google.com/search?q={topic}+core+concepts",
                    "search_keywords": [topic, "core concepts", "tutorial"]
                },
                {
                    "type": "video",
                    "title": f"Understanding {topic} Basics",
                    "duration": "10 min video",
                    "icon": "play_circle",
                    "color": "tertiary",
                    "url": f"https://www.youtube.com/results?search_query={topic}+basics",
                    "search_keywords": [topic, "basics", "course"]
                },
                {
                    "type": "practice",
                    "title": "Essential Exercises",
                    "duration": "20 min practice",
                    "icon": "terminal",
                    "color": "primary",
                    "url": f"https://www.google.com/search?q={topic}+practice+exercises",
                    "search_keywords": [topic, "practice", "exercises"]
                }
            ]

    def generate_holistic_insight(self, stats: dict, persona: dict, prediction: dict, weak_topics: list) -> list:
        try:
            prompt = f"""
            You are 'IntelliTutor AI'. Generate exactly 3 short, punchy mastery insights.
            
            STUDENT DATA:
            - Accuracy: {stats.get('overall_accuracy', 0)}%
            - Persona: {persona.get('persona', 'Steady Learner')}
            - Predicted Score: {prediction.get('prediction', 'N/A')}%
            - Weak Topics: {weak_topics}
            
            STRICT RULES:
            1. Exactly 3 insights in a JSON array.
            2. "title": 2-3 words max.
            3. "content": Exactly ONE short sentence (max 10 words).
            4. "action_item": Exactly ONE short actionable phrase (max 6 words).
            5. Types: 'performance', 'prediction', 'competitive'.
            6. "competitive": Highlight our "Proactive Neural Path" vs "Static Videos" (Byju's/Coursera).
            
            JSON FORMAT:
            {{
                "insights": [
                    {{
                        "type": "performance",
                        "title": "Title Here",
                        "content": "One short sentence.",
                        "action_item": "Short action"
                    }}
                ]
            }}
            """
            
            response = self._generate_content(prompt)
            response_text = response.strip()
            # Clean JSON
            import re
            json_match = re.search(r'\[.*\]|\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            data = json.loads(response_text)
            return data.get("insights", [])
        except Exception as e:
            print(f"Holistic insight error: {str(e)}")
            # Real-world fallback
            return [
                {
                    "type": "performance",
                    "title": "Steady Progress Detected",
                    "content": f"Your current accuracy of {stats.get('overall_accuracy', 0)}% shows you're building a foundation. We've detected gaps in {', '.join(weak_topics[:2]) if weak_topics else 'your learning path'}.",
                    "action_item": "Focus on identified weak topics today."
                },
                {
                    "type": "competitive",
                    "title": "The IntelliTutor Difference",
                    "content": "Unlike static video platforms that force a linear path, our AI proactively adapts your study journey based on real-time neural patterns.",
                    "action_item": "Leverage your personalized learning path."
                }
            ]
