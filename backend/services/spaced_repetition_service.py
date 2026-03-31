import datetime
from bson import ObjectId
from config.db import db

class SpacedRepetitionService:
    def __init__(self):
        self.collection = db.get_collection('spaced_repetition_items')
    
    def process_review(self, user_id, topic, question_id, quality, question_text=None, explanation=None):
        """
        Updates the SM-2 spaced repetition metrics for a specific question/topic.
        `quality` is a 0-5 rating:
        0: Complete blackout.
        1: Incorrect response; the correct one remembered.
        2: Incorrect response; where the correct one seemed easy to recall.
        3: Correct response recalled with serious difficulty.
        4: Correct response after a hesitation.
        5: Perfect response.
        """
        
        # Find existing record
        query = {"user_id": user_id, "topic": topic, "question_id": question_id}
        item = self.collection.find_one(query)
        
        if not item:
            item = {
                "user_id": user_id,
                "topic": topic,
                "question_id": question_id,
                "question_text": question_text,
                "explanation": explanation,
                "repetition": 0,
                "interval": 0,
                "efactor": 2.5,
                "next_review": datetime.datetime.utcnow()
            }
            
        repetition = item['repetition']
        interval = item['interval']
        efactor = item['efactor']
        
        if quality >= 3:
            if repetition == 0:
                interval = 1
            elif repetition == 1:
                interval = 6
            else:
                from services.ml_service import MLService
                ml_svc = MLService()
                interval = ml_svc.predict_spaced_repetition_interval(interval, efactor, quality)
            repetition += 1
        else:
            repetition = 0
            interval = 1
            
        efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if efactor < 1.3:
            efactor = 1.3
            
        next_review = datetime.datetime.utcnow() + datetime.timedelta(days=interval)
        
        updated_item = {
            "$set": {
                "repetition": repetition,
                "interval": interval,
                "efactor": efactor,
                "next_review": next_review,
                "last_reviewed": datetime.datetime.utcnow()
            }
        }
        
        
        # Ensure we always update the text/explanation if provided
        if question_text: updated_item["$set"]["question_text"] = question_text
        if explanation: updated_item["$set"]["explanation"] = explanation

        self.collection.update_one(query, updated_item, upsert=True)
        return {"repetition": repetition, "interval": interval, "next_review": next_review}

    def record_quiz_result(self, user_id, topic, question_id, question_text, explanation, is_correct):
        """
        Automatically adds/updates a question in the SR system after a quiz.
        If incorrect, it's weighted as 'Hard' (quality 2).
        If correct, it's weighted as 'Good' (quality 4).
        """
        quality = 4 if is_correct else 2
        return self.process_review(user_id, topic, question_id, quality, question_text, explanation)
        
    def get_due_items(self, user_id, limit=10):
        """
        Retrieves items that are due for review.
        """
        now = datetime.datetime.utcnow()
        query = {
            "user_id": user_id,
            "next_review": {"$lte": now}
        }
        items = list(self.collection.find(query).sort("next_review", 1).limit(limit))
        
        # Convert ObjectIds to string for JSON serialization
        for item in items:
            item['_id'] = str(item['_id'])
            
        return items
        
    def get_topic_stats(self, user_id):
        """
        Get counts of items due, future due, and total per topic.
        """
        now = datetime.datetime.utcnow()
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$topic",
                "total": {"$sum": 1},
                "due": {"$sum": {"$cond": [{"$lte": ["$next_review", now]}, 1, 0]}}
            }}
        ]
        
        results = list(self.collection.aggregate(pipeline))
        stats = []
        for r in results:
            stats.append({
                "topic": r["_id"],
                "total_items": r["total"],
                "due_items": r["due"]
            })
            
        return stats
