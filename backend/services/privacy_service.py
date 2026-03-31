import hashlib
from datetime import datetime, timedelta
from config.db import db

class PrivacyService:
    def __init__(self):
        self.users_collection = db.get_collection('users')
        self.quiz_attempts_collection = db.get_collection('quiz_attempts')
        self.chat_sessions_collection = db.get_collection('chat_sessions')

    def anonymize_data(self, user_data):
        """
        Strips PII from user analytics data.
        """
        if not user_data:
            return None
            
        anonymized = user_data.copy()
        
        # Remove direct identifiers
        if 'email' in anonymized:
            del anonymized['email']
        if 'name' in anonymized:
            del anonymized['name']
        if 'password_hash' in anonymized:
            del anonymized['password_hash']
            
        # Optional: hash the ID to provide a consistent pseudo-identifier
        if '_id' in anonymized:
            pseudo_id = hashlib.sha256(str(anonymized['_id']).encode()).hexdigest()[:12]
            anonymized['pseudo_id'] = pseudo_id
            del anonymized['_id']
            
        return anonymized
        
    def get_anonymized_analytics(self, role):
        """
        Returns an anonymized dataset of learner analytics for research or teacher dashboard 
        if the teacher doesn't have explicit permission to view names.
        """
        if role != "teacher" and role != "admin":
            return []
            
        # Fetch high-level analytics without names
        pipeline = [
            {"$group": {
                "_id": "$topic",
                "avg_score": {"$avg": "$score"},
                "total_attempts": {"$sum": 1}
            }},
            {"$sort": {"total_attempts": -1}}
        ]
        
        results = list(self.quiz_attempts_collection.aggregate(pipeline))
        return results

    def enforce_retention_policy(self, days=365):
        """
        Deletes or fully anonymizes old analytics data based on configurable retention policies.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Delete old chat sessions
        chat_result = self.chat_sessions_collection.delete_many({"timestamp": {"$lt": cutoff_date}})
        
        # Optionally delete old quiz attempts or strip them
        quiz_result = self.quiz_attempts_collection.delete_many({"completed_at": {"$lt": cutoff_date}})
        
        return {
            "deleted_chat_sessions": chat_result.deleted_count,
            "deleted_quiz_attempts": quiz_result.deleted_count,
            "cutoff_date": cutoff_date.isoformat()
        }
