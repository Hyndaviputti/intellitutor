from config.db import db
from services.privacy_service import PrivacyService
from bson import ObjectId

class TeacherService:
    def __init__(self):
        self.users_collection = db.get_collection('users')
        self.quiz_attempts_collection = db.get_collection('quiz_attempts')
        self.privacy_service = PrivacyService()
        
    def get_class_overview(self, teacher_id, anonymize=False):
        """
        Get aggregated overview of the current user's performance.
        """
        pipeline = [
            {"$match": {"user_id": teacher_id}},
            {"$group": {
                "_id": "$topic",
                "average_score": {"$avg": {"$divide": ["$score", "$total_questions"]}},
                "total_questions_attempted": {"$sum": "$total_questions"},
                "active_students": {"$addToSet": "$user_id"}
            }},
            {"$project": {
                "topic": "$_id",
                "average_accuracy": {"$multiply": ["$average_score", 100]},
                "total_practice": "$total_questions_attempted",
                "unique_students": {"$size": "$active_students"},
                "_id": 0
            }},
            {"$sort": {"average_accuracy": 1}} # Sort by weakest topics first
        ]
        
        topic_performance = list(self.quiz_attempts_collection.aggregate(pipeline))
        
        return {
            "topic_performance": topic_performance,
            "students": [],
            "total_students": len(topic_performance) > 0 and 1 or 0
        }
