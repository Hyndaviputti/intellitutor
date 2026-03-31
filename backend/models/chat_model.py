from datetime import datetime, timezone
from bson import ObjectId
from config.db import db

class Chat:
    def __init__(self):
        self.collection = db.get_collection('chats')
    
    def save_message(self, user_id, message, response, session_id=None):
        chat_message = {
            'user_id': user_id,
            'session_id': session_id or str(ObjectId()),
            'user_message': message,
            'ai_response': response,
            'timestamp': datetime.utcnow()
        }
        result = self.collection.insert_one(chat_message)
        return str(result.inserted_id)
    
    def get_chat_history(self, user_id, session_id=None, limit=50):
        query = {'user_id': user_id}
        if session_id:
            query['session_id'] = session_id
        
        history = list(self.collection.find(query)
                     .sort('timestamp', -1)
                     .limit(limit))
        
        # Convert ObjectId and datetime to JSON serializable format
        for chat in history:
            if '_id' in chat:
                chat['_id'] = str(chat['_id'])
            if 'timestamp' in chat and chat['timestamp']:
                # Ensure UTC timezone and add 'Z' suffix for proper ISO format
                if chat['timestamp'].tzinfo is None:
                    # Naive datetime - assume UTC
                    chat['timestamp'] = chat['timestamp'].replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
                else:
                    # Aware datetime - convert to UTC and format
                    chat['timestamp'] = chat['timestamp'].astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        return history
    
    def get_user_sessions(self, user_id):
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$sort': {'timestamp': -1}},
            {'$group': {
                '_id': '$session_id',
                'last_message': {'$first': '$user_message'},
                'last_response': {'$first': '$ai_response'},
                'timestamp': {'$first': '$timestamp'},
                'message_count': {'$sum': 1}
            }},
            {'$sort': {'timestamp': -1}},
            {'$limit': 20}
        ]
        sessions = list(self.collection.aggregate(pipeline))
        
        # Convert ObjectId and datetime to JSON serializable format
        for session in sessions:
            if '_id' in session:
                session['_id'] = str(session['_id'])
            if 'timestamp' in session and session['timestamp']:
                # Ensure UTC timezone and add 'Z' suffix for proper ISO format
                if session['timestamp'].tzinfo is None:
                    # Naive datetime - assume UTC
                    session['timestamp'] = session['timestamp'].replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
                else:
                    # Aware datetime - convert to UTC and format
                    session['timestamp'] = session['timestamp'].astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        return sessions
    
    def delete_session(self, user_id, session_id):
        return self.collection.delete_many({
            'user_id': user_id,
            'session_id': session_id
        })
    
    def get_chat_stats(self, user_id):
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': None,
                'total_messages': {'$sum': 1},
                'first_message': {'$min': '$timestamp'},
                'last_message': {'$max': '$timestamp'},
                'session_ids': {'$addToSet': '$session_id'}
            }}
        ]
        result = list(self.collection.aggregate(pipeline))
        if result:
            stats = result[0]
            return {
                'total_messages': stats['total_messages'],
                'first_message': stats['first_message'],
                'last_message': stats['last_message'],
                'unique_sessions': len(stats.get('session_ids', []))
            }
        return {
            'total_messages': 0,
            'first_message': None,
            'last_message': None,
            'unique_sessions': 0
        }
