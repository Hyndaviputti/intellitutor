import uuid
from datetime import datetime, timedelta
from bson import ObjectId
from config.db import db
from services.gemini_service import GeminiService

class CollaborativeService:
    def __init__(self):
        self.collection = db.get_collection('collaborative_sessions')
        self.gemini_service = GeminiService()
        self.QUESTION_DURATION = 20  # seconds
        self.LEADERBOARD_DURATION = 5  # seconds
    
    def create_session(self, host_id, topic, difficulty, num_questions=5):
        quiz_data = self.gemini_service.generate_quiz(topic, difficulty, num_questions)
        if "error" in quiz_data: return quiz_data
            
        join_code = str(uuid.uuid4())[:8].upper()
        session = {
            "join_code": join_code,
            "host_id": host_id,
            "topic": topic,
            "difficulty": difficulty,
            "status": "waiting", # waiting, active_question, show_leaderboard, completed
            "participants": [host_id],
            "quiz_data": quiz_data["questions"],
            "current_question_index": 0,
            "question_start_time": None,
            "phase_end_time": None,
            "answers": {}, # Format: { q_idx: { user_id: { answer: int, timestamp: datetime } } }
            "scores": {str(host_id): 0},
            "created_at": datetime.utcnow()
        }
        result = self.collection.insert_one(session)
        session['_id'] = str(result.inserted_id)
        return session
        
    def join_session(self, user_id, join_code):
        session = self.collection.find_one({"join_code": join_code})
        if not session: return {"error": "Session not found"}
        if session["status"] != "waiting": return {"error": "Session already started"}
            
        if user_id not in session["participants"]:
            self.collection.update_one(
                {"_id": session["_id"]},
                {"$push": {"participants": user_id}, "$set": {f"scores.{user_id}": 0}}
            )
        return {"message": "Joined successfully", "session_id": str(session["_id"])}
        
    def start_session(self, host_id, session_id):
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session: return {"error": "Session not found"}
        if str(session["host_id"]) != str(host_id): return {"error": "Only host can start"}
            
        now = datetime.utcnow()
        self.collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {
                "status": "active_question",
                "question_start_time": now,
                "phase_end_time": now + timedelta(seconds=self.QUESTION_DURATION),
                "current_question_index": 0
            }}
        )
        return {"message": "Session started", "status": "active_question"}

    def submit_answer(self, user_id, session_id, question_index, answer_index):
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session or session["status"] != "active_question":
            return {"error": "Cannot submit answer now"}
        
        if int(question_index) != session["current_question_index"]:
            return {"error": "Answer for wrong question index"}

        now = datetime.utcnow()
        q_idx_str = str(question_index)
        
        # Check if already answered
        existing_answers = session.get("answers", {}).get(q_idx_str, {})
        if user_id in existing_answers:
            return {"error": "Answer already submitted"}

        # Calculate score (Base 100 + speed bonus up to 50)
        correct_answer = session["quiz_data"][question_index]["correct_answer"]
        points = 0
        if answer_index == correct_answer:
            start_time = session["question_start_time"]
            time_taken = (now - start_time).total_seconds()
            speed_bonus = max(0, int((self.QUESTION_DURATION - time_taken) * 2.5)) # Max 50 bonus
            points = 100 + speed_bonus

        # Update database
        self.collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {f"answers.{q_idx_str}.{user_id}": {"answer": answer_index, "timestamp": now}},
                "$inc": {f"scores.{user_id}": points}
            }
        )

        # Refresh session to check if all answered
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        q_answers = session.get("answers", {}).get(q_idx_str, {})
        
        if len(q_answers) >= len(session["participants"]):
            # All answered, move to leaderboard early
            self._move_to_leaderboard(session_id)
            
        return {"message": "Answer recorded", "points": points}

    def _move_to_leaderboard(self, session_id):
        now = datetime.utcnow()
        self.collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "status": "show_leaderboard",
                    "phase_end_time": now + timedelta(seconds=self.LEADERBOARD_DURATION)
                }
            }
        )

    def _advance_to_next_question(self, session_id, session):
        new_index = session["current_question_index"] + 1
        if new_index >= len(session["quiz_data"]):
            self.collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"status": "completed", "phase_end_time": None}}
            )
        else:
            now = datetime.utcnow()
            self.collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "status": "active_question",
                    "current_question_index": new_index,
                    "question_start_time": now,
                    "phase_end_time": now + timedelta(seconds=self.QUESTION_DURATION)
                }}
            )

    def get_session_state(self, session_id):
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session: return {"error": "Session not found"}
        
        # Auto-progression logic
        now = datetime.utcnow()
        if session["status"] == "active_question":
            if now > session["phase_end_time"]:
                self._move_to_leaderboard(session_id)
                session = self.collection.find_one({"_id": ObjectId(session_id)})
        elif session["status"] == "show_leaderboard":
            if now > session["phase_end_time"]:
                self._advance_to_next_question(session_id, session)
                session = self.collection.find_one({"_id": ObjectId(session_id)})

        session['_id'] = str(session['_id'])
        # Add server time for clock sync
        session['server_time'] = datetime.utcnow()
        return session
