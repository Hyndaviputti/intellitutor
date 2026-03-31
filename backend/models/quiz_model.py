from datetime import datetime, timedelta, timezone
from bson import ObjectId
from config.db import db

class Quiz:
    def __init__(self):
        self.collection = db.get_collection('quizzes')
        self.attempts_collection = db.get_collection('quiz_attempts')
    
    def create_quiz(self, topic, difficulty, questions, user_id):
        quiz = {
            'topic': topic,
            'difficulty': difficulty,
            'questions': questions,
            'created_by': user_id,
            'created_at': datetime.utcnow(),
            'metadata': {
                'question_count': len(questions),
                'estimated_time': len(questions) * 2,  # 2 minutes per question
                'tags': self._extract_tags_from_questions(questions)
            }
        }
        result = self.collection.insert_one(quiz)
        return str(result.inserted_id)
    
    def _extract_tags_from_questions(self, questions):
        """
        Extract tags from questions for better categorization
        """
        tags = set()
        for question in questions:
            if 'topic' in question:
                tags.add(question['topic'])
            # Add more sophisticated tag extraction logic here
        return list(tags)
    
    def submit_attempt(self, user_id, quiz_id, answers, score, total_questions):
        attempt = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'answers': answers,
            'score': score,
            'total_questions': total_questions,
            'accuracy': (score / total_questions) * 100,
            'completed_at': datetime.utcnow()
        }
        result = self.attempts_collection.insert_one(attempt)
        return str(result.inserted_id)
    
    def submit_adaptive_attempt(self, user_id, quiz_id, answers, score, total_questions, topic, difficulty):
        """
        Submit quiz attempt with adaptive learning metadata
        """
        attempt = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'answers': answers,
            'score': score,
            'total_questions': total_questions,
            'accuracy': (score / total_questions) * 100,
            'topic': topic,
            'difficulty': difficulty,
            'completed_at': datetime.utcnow()
        }
        result = self.attempts_collection.insert_one(attempt)
        return str(result.inserted_id)
    
    def get_user_attempts(self, user_id):
        attempts = list(self.attempts_collection.find({'user_id': user_id}).sort('completed_at', -1))
        
        # Convert ObjectId and datetime to JSON serializable format
        for attempt in attempts:
            if '_id' in attempt:
                attempt['_id'] = str(attempt['_id'])
            if 'completed_at' in attempt:
                # Ensure UTC timezone and add 'Z' suffix for proper ISO format
                if attempt['completed_at'].tzinfo is None:
                    # Naive datetime - assume UTC
                    attempt['completed_at'] = attempt['completed_at'].replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
                else:
                    # Aware datetime - convert to UTC and format
                    attempt['completed_at'] = attempt['completed_at'].astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        return attempts
    
    def get_topic_attempts(self, user_id, topic):
        attempts = list(self.attempts_collection.find({
            'user_id': user_id,
            'topic': topic
        }).sort('completed_at', -1))
        
        # Convert ObjectId and datetime to JSON serializable format
        for attempt in attempts:
            if '_id' in attempt:
                attempt['_id'] = str(attempt['_id'])
            if 'completed_at' in attempt:
                # Ensure UTC timezone and add 'Z' suffix for proper ISO format
                if attempt['completed_at'].tzinfo is None:
                    # Naive datetime - assume UTC
                    attempt['completed_at'] = attempt['completed_at'].replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
                else:
                    # Aware datetime - convert to UTC and format
                    attempt['completed_at'] = attempt['completed_at'].astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        return attempts
    
    def get_weak_topics(self, user_id):
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$lookup': {
                'from': 'quizzes',
                'localField': 'quiz_id',
                'foreignField': '_id',
                'as': 'quiz_info'
            }},
            {'$unwind': '$quiz_info'},
            {'$group': {
                '_id': '$quiz_info.topic',
                'avg_accuracy': {'$avg': '$accuracy'},
                'attempts': {'$sum': 1},
                'total_questions': {'$sum': '$total_questions'},
                'total_correct': {'$sum': '$score'}
            }},
            {'$match': {'avg_accuracy': {'$lt': 60}}},
            {'$sort': {'avg_accuracy': 1}}
        ]
        return list(self.attempts_collection.aggregate(pipeline))
    
    def get_user_performance_by_topic(self, user_id):
        """
        Get detailed performance metrics by topic for adaptive learning
        """
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': '$topic',
                'attempts': {'$sum': 1},
                'avg_accuracy': {'$avg': '$accuracy'},
                'avg_score': {'$avg': '$score'},
                'avg_total': {'$avg': '$total_questions'},
                'best_score': {'$max': '$score'},
                'worst_score': {'$min': '$score'},
                'recent_accuracy': {
                    '$avg': {
                        '$cond': [
                            {'$gte': ['$completed_at', datetime.utcnow() - timedelta(days=7)]},
                            '$accuracy',
                            None
                        ]
                    }
                }
            }},
            {'$sort': {'avg_accuracy': 1}}
        ]
        
        results = list(self.attempts_collection.aggregate(pipeline))
        
        performance_data = {}
        for result in results:
            topic = result['_id']
            performance_data[topic] = {
                'attempts': result['attempts'],
                'avg_accuracy': round(result['avg_accuracy'], 1),
                'avg_score': round(result['avg_score'], 1),
                'avg_total': round(result['avg_total'], 1),
                'best_score': result['best_score'],
                'worst_score': result['worst_score'],
                'recent_accuracy': round(result['recent_accuracy'], 1) if result['recent_accuracy'] else None,
                'level': self._classify_performance_level(result['avg_accuracy'])
            }
        
        return performance_data
    
    def _classify_performance_level(self, accuracy):
        """
        Classify performance level based on accuracy
        """
        if accuracy < 60:
            return 'weak'
        elif accuracy <= 80:
            return 'moderate'
        else:
            return 'strong'
    
    def get_recent_attempts(self, user_id, days=7):
        """
        Get recent quiz attempts for the last N days
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        attempts = list(self.attempts_collection.find({
            'user_id': user_id,
            'completed_at': {'$gte': start_date}
        }).sort('completed_at', -1))
        
        # Convert ObjectId and datetime to JSON serializable format
        for attempt in attempts:
            if '_id' in attempt:
                attempt['_id'] = str(attempt['_id'])
            if 'completed_at' in attempt:
                # Ensure UTC timezone and add 'Z' suffix for proper ISO format
                if attempt['completed_at'].tzinfo is None:
                    # Naive datetime - assume UTC
                    attempt['completed_at'] = attempt['completed_at'].replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
                else:
                    # Aware datetime - convert to UTC and format
                    attempt['completed_at'] = attempt['completed_at'].astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        return attempts
    
    def get_quiz_with_details(self, quiz_id):
        """
        Get quiz with full details including questions
        """
        quiz = self.collection.find_one({'_id': ObjectId(quiz_id)})
        if quiz:
            quiz['_id'] = str(quiz['_id'])
        return quiz
    
    def get_attempt_with_quiz_details(self, attempt_id):
        """
        Get quiz attempt with full quiz details
        """
        attempt = self.attempts_collection.find_one({'_id': ObjectId(attempt_id)})
        if attempt:
            attempt['_id'] = str(attempt['_id'])
            # Get quiz details
            quiz = self.get_quiz_with_details(attempt['quiz_id'])
            attempt['quiz_details'] = quiz
        return attempt
