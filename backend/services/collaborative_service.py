import uuid
from datetime import datetime
from bson import ObjectId
from config.db import db
from services.gemini_service import GeminiService

class CollaborativeService:
    def __init__(self):
        self.collection = db.get_collection('collaborative_sessions')
        self.gemini_service = GeminiService()
    
    def create_session(self, host_id, topic, difficulty, num_questions=5):
        """
        Create a new collaborative study session.
        """
        # Generate shared quiz
        quiz_data = self.gemini_service.generate_quiz(topic, difficulty, num_questions)
        if "error" in quiz_data:
            return quiz_data
            
        join_code = str(uuid.uuid4())[:8].upper()
        
        session = {
            "join_code": join_code,
            "host_id": host_id,
            "topic": topic,
            "difficulty": difficulty,
            "status": "waiting", # waiting, active, completed
            "participants": [host_id],
            "quiz_data": quiz_data["questions"],
            "current_question_index": 0,
            "scores": {str(host_id): 0},
            "created_at": datetime.utcnow()
        }
        
        result = self.collection.insert_one(session)
        session['_id'] = str(result.inserted_id)
        
        return session
        
    def join_session(self, user_id, join_code):
        """
        Join an existing session by code.
        """
        session = self.collection.find_one({"join_code": join_code})
        if not session:
            return {"error": "Session not found"}
            
        if session["status"] != "waiting":
            return {"error": "Session already started or completed"}
            
        if user_id not in session["participants"]:
            self.collection.update_one(
                {"_id": session["_id"]},
                {
                    "$push": {"participants": user_id},
                    "$set": {f"scores.{user_id}": 0}
                }
            )
            
        return {"message": "Joined successfully", "session_id": str(session["_id"])}
        
    def start_session(self, host_id, session_id):
        """
        Start the session (Host only).
        """
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return {"error": "Session not found"}
            
        if session["host_id"] != host_id:
            return {"error": "Only the host can start the session"}
            
        self.collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"status": "active"}}
        )
        return {"message": "Session started"}
        
    def update_score(self, user_id, session_id, points):
        """
        Update the user's score in the session.
        """
        result = self.collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$inc": {f"scores.{user_id}": points}}
        )
        if result.modified_count == 0:
            return {"error": "Failed to update score or session not found"}
        return {"message": "Score updated"}
        
    def get_session_state(self, session_id):
        """
        Get the current state of the session (for polling).
        """
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return {"error": "Session not found"}
            
        session['_id'] = str(session['_id'])
        return session

    def advance_question(self, host_id, session_id):
        """
        Advance to the next question (Host only).
        """
        session = self.collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return {"error": "Session not found"}
            
        if str(session["host_id"]) != str(host_id):
            return {"error": "Only the host can advance the question"}
            
        new_index = session.get("current_question_index", 0) + 1
        
        if new_index >= len(session["quiz_data"]):
            self.collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"status": "completed"}}
            )
            return {"status": "completed"}
        else:
            self.collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"current_question_index": new_index}}
            )
            return {"status": "active", "current_question_index": new_index}
