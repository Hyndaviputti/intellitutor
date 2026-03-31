from datetime import datetime
from bson import ObjectId
from config.db import db

class User:
    def __init__(self):
        self.collection = db.get_collection('users')
    
    def create_user(self, name, email, password, role='student'):
        user = {
            'name': name,
            'email': email,
            'password': password,  # Will be hashed before storing
            'role': role,
            'created_at': datetime.utcnow(),
            'profile': {
                'level': 'beginner',
                'interests': [],
                'weak_topics': []
            },
            'adaptive_learning': {
                'skill_levels': {},  # topic: easy/medium/hard
                'learning_preferences': {
                    'preferred_difficulty': 'medium',
                    'study_time_preference': 'morning',
                    'learning_style': 'visual'
                },
                'performance_history': {
                    'last_quiz_date': None,
                    'total_study_time': 0,
                    'streak_days': 0
                }
            }
        }
        result = self.collection.insert_one(user)
        return str(result.inserted_id)
    
    def find_by_email(self, email):
        return self.collection.find_one({'email': email})
    
    def find_by_id(self, user_id):
        return self.collection.find_one({'_id': ObjectId(user_id)})
    
    def update_profile(self, user_id, profile_data):
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'profile': profile_data}}
        )
    
    def update_skill_level(self, user_id, topic, difficulty):
        """
        Update user skill level for a specific topic
        """
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {f'adaptive_learning.skill_levels.{topic}': difficulty}}
        )
    
    def get_skill_levels(self, user_id):
        """
        Get user skill levels for all topics
        """
        user = self.find_by_id(user_id)
        if user and 'adaptive_learning' in user:
            return user['adaptive_learning'].get('skill_levels', {})
        return {}
    
    def update_performance_history(self, user_id, quiz_data):
        """
        Update user performance history
        """
        update_data = {
            '$set': {
                'adaptive_learning.performance_history.last_quiz_date': datetime.utcnow()
            },
            '$inc': {
                'adaptive_learning.performance_history.total_study_time': quiz_data.get('study_time', 0)
            }
        }
        
        # Update streak if quiz was completed today
        last_quiz = self.collection.find_one({
            '_id': ObjectId(user_id),
            'adaptive_learning.performance_history.last_quiz_date': {
                '$gte': datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            }
        })
        
        if not last_quiz:
            update_data['$inc']['adaptive_learning.performance_history.streak_days'] = 1
        
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            update_data
        )
    def update_proactive_insights(self, user_id, insights):
        """Store generated insights to avoid redundant AI calls"""
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'adaptive_learning.last_proactive_insights': insights,
                'adaptive_learning.last_insight_at': datetime.utcnow()
            }}
        )

    def get_proactive_insights(self, user_id):
        """Retrieve cached insights and their generation timestamp"""
        user = self.find_by_id(user_id)
        if user and 'adaptive_learning' in user:
            return user['adaptive_learning'].get('last_proactive_insights'), \
                   user['adaptive_learning'].get('last_insight_at')
        return None, None

    def get_all_users(self):
        """Retrieve all users"""
        return list(self.collection.find({}, {'password': 0}))

    def update_user_role(self, user_id, new_role):
        """Update a user's role"""
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': new_role}}
        )

    def delete_user(self, user_id):
        """Delete a user account"""
        return self.collection.delete_one({'_id': ObjectId(user_id)})
