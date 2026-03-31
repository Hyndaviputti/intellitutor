import google.generativeai as genai
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.qwen_api_key = os.getenv('QWEN_API_KEY')
        self.openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        self.qwen_model = "qwen/qwen-2.5-72b-instruct:free" # Use free tier

    def _call_qwen(self, prompt, max_tokens=1000):
        """Fallback: call Qwen model via OpenRouter API."""
        headers = {
            "Authorization": f"Bearer {self.qwen_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.qwen_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": max_tokens
        }
        try:
            resp = requests.post(self.openrouter_url, headers=headers, json=payload, timeout=60)
            if resp.status_code == 402:
                print("[ERROR] OpenRouter Payment Required (402). Out of credits.")
                raise Exception("AI secondary service out of credits (402)")
            elif resp.status_code == 401:
                print("[ERROR] OpenRouter Invalid API Key (401).")
                raise Exception("AI secondary service authentication failed (401)")
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[RECOVERY] OpenRouter call failed: {e}")
            raise e

    def _generate_content(self, prompt, max_tokens=1500):
        """Try Gemini first; on rate-limit fall back to Qwen via OpenRouter."""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(max_output_tokens=max_tokens)
            )
            return response.text
        except Exception as gemini_err:
            err_str = str(gemini_err).lower()
            is_rate_limit = any(k in err_str for k in ["429", "resource exhausted", "rate limit", "quota"])
            if is_rate_limit and self.qwen_api_key:
                print(f"[FALLBACK] Gemini rate-limited, switching to Qwen: {gemini_err}")
                return self._call_qwen(prompt, max_tokens=max_tokens)
            else:
                raise gemini_err
    
    def generate_explanation(self, question, context=None):
        try:
            prompt = f"""
You are an expert AI tutor with deep knowledge in computer science and general education.

Your task is to teach the concept clearly, accurately, and step-by-step.

⚠️ STRICT RULES:
- Always provide factually correct information
- Do NOT hallucinate or guess unknown facts
- If unsure, say: "I am not fully certain, but here is the best explanation based on available knowledge"
- Keep explanation beginner-friendly but technically correct

---

## RESPONSE STRUCTURE (MANDATORY JSON FORMAT)

Return ONLY JSON in the following format:

{{
  "concept": "Short definition of the concept",
  "explanation": "Step-by-step explanation in simple language",
  "example": "A clear real-world or code example",
  "key_points": ["point1", "point2", "point3"],
  "common_mistakes": ["mistake1", "mistake2"],
  "practice_question": "One question to test understanding"
}}

⚠️ DO NOT return any text outside JSON

---

## TEACHING STYLE:
- Start from basics → then go deeper
- Use simple language (like explaining to a beginner)
- Use analogies if helpful
- Keep explanation structured (no long paragraphs)

---

## CONTEXT:
{f'Additional context: {context}' if context else 'No additional context provided'}

User question:
{question}

---

## FINAL INSTRUCTION:
Generate a complete, accurate, and structured response following all rules above.
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
            You are an educational quiz generator for an AI tutoring platform. You MUST only generate quizzes for academic and educational topics.
            
            IMPORTANT GUARDRAIL: If the topic "{topic}" is NOT related to academics, education, science, technology, engineering, mathematics, humanities, social sciences, or any legitimate educational subject, return ONLY this JSON:
            {{"error": "This topic is not educational. Please choose an academic subject."}}
            
            If the topic IS educational, generate exactly {num_questions} multiple choice questions about {topic} at {difficulty} difficulty level.
            
            CRITICAL: Return ONLY a JSON object with this exact structure:
            {{
                "questions": [
                    {{
                        "question": "Question text here",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": 0,
                        "topic": "{topic}",
                        "difficulty": "{difficulty}",
                        "hint": "Brief 1-sentence hint.",
                        "explanation": "Short 1-sentence explanation of the correct answer."
                    }}
                ]
            }}
            
            Requirements:
            - Questions must be clear and unambiguous
            - Only one option is correct (correct_answer field must be the index: 0, 1, 2, or 3)
            - Difficulty must match {difficulty} level
            - Cover different aspects of {topic}
            - Include topic field for each question
            - The 'hint' and 'explanation' fields MUST be extremely brief to save tokens.
            - Return valid JSON only, no additional text
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
            return {"error": f"AI service unavailable: {{str(e)}}"}
    def chat_response(self, message, chat_history=None):
        try:
            context = ""
            if chat_history:
                context = "Previous conversation (last 3 messages):\n"
                for msg in chat_history[-3:]:  # Last 3 messages for context
                    context += f"User: {msg.get('user', '')}\n"
                    context += f"Tutor: {msg.get('tutor', '')}\n"
            
            prompt = f"""
You are an expert AI tutor with deep knowledge in computer science and general education.

Your task is to teach the concept clearly, accurately, and step-by-step.

⚠️ STRICT RULES:
- Always provide factually correct information
- Do NOT hallucinate or guess unknown facts
- If unsure, say: "I am not fully certain, but here is the best explanation based on available knowledge"
- Keep explanation beginner-friendly but technically correct

---

## TEACHING STYLE:
- Start from basics → then go deeper
- Use simple language (like explaining to a beginner)
- Use analogies if helpful
- Keep explanation structured (no long paragraphs)
- Be conversational but educational

---

## CONTEXT:
{context}

Current user message:
{message}

---

## RESPONSE GUIDELINES:
1. Provide a direct, helpful answer to the user's question
2. Explain the concept clearly with examples
3. Encourage further learning
4. Keep it appropriate for the user's level
5. Be conversational and engaging
6. If the user is asking for help with a specific problem, guide them through the solution step-by-step

---

## FINAL INSTRUCTION:
Generate a complete, accurate, and conversational educational response following all rules above.
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
