from datetime import datetime
from bson import ObjectId
from config.db import db

class Content:
    def __init__(self):
        self.topics_collection = db.get_collection('global_topics')
        self.questions_collection = db.get_collection('predefined_questions')
    
    def add_topic(self, title, description, category, difficulty='beginner'):
        topic = {
            'title': title,
            'description': description,
            'category': category,
            'difficulty': difficulty,
            'created_at': datetime.utcnow(),
            'status': 'active'
        }
        result = self.topics_collection.insert_one(topic)
        return str(result.inserted_id)
    
    def get_all_topics(self):
        topics = list(self.topics_collection.find({'status': 'active'}))
        for t in topics:
            t['_id'] = str(t['_id'])
        return topics
    
    def delete_topic(self, topic_id):
        result = self.topics_collection.update_one(
            {'_id': ObjectId(topic_id)},
            {'$set': {'status': 'deleted'}}
        )
        return result.modified_count > 0
    
    def add_questions_bulk(self, questions_list, topic_id=None):
        """
        questions_list: list of dicts with {question, options, correct_answer, explanation}
        """
        for q in questions_list:
            q['created_at'] = datetime.utcnow()
            if topic_id:
                q['topic_id'] = topic_id
        
        if not questions_list:
            return 0
            
        result = self.questions_collection.insert_many(questions_list)
        return len(result.inserted_ids)
    
    def get_questions_by_topic_name(self, topic_name, limit=5):
        """Find questions by topic name string (case-insensitive)"""
        import re
        regex = re.compile(f"^{re.escape(topic_name)}$", re.IGNORECASE)
        pipeline = [
            {"$match": {'topic': regex}},
            {"$sample": {"size": limit}}
        ]
        questions = list(self.questions_collection.aggregate(pipeline))
        for q in questions:
            q['_id'] = str(q['_id'])
        return questions

    def get_random_questions(self, limit=5):
        """Fallback: get random questions from any topic"""
        pipeline = [{"$sample": {"size": limit}}]
        questions = list(self.questions_collection.aggregate(pipeline))
        for q in questions:
            q['_id'] = str(q['_id'])
        return questions

content_model = Content()
