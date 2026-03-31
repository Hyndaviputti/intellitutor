from datetime import datetime, timedelta
import os
from config.db import db
from models.user_model import User
from models.quiz_model import Quiz

class AdminService:
    def __init__(self):
        self.user_model = User()
        self.quiz_model = Quiz()
        self.attempts_collection = db.get_collection('quiz_attempts')
        self.chat_collection = db.get_collection('chat_sessions')
        self.env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')

    def get_system_config(self):
        """Retrieve masked API keys."""
        gemini = os.getenv('GEMINI_API_KEY', '')
        qwen = os.getenv('QWEN_API_KEY', '')
        
        def mask(s):
            if not s or len(s) < 8: return "****"
            return f"{s[:4]}...{s[-4:]}"
            
        return {
            "GEMINI_API_KEY": mask(gemini),
            "QWEN_API_KEY": mask(qwen)
        }

    def update_config(self, keys_dict):
        """Update .env file with new keys."""
        valid_keys = ['GEMINI_API_KEY', 'QWEN_API_KEY']
        updates = {k: v for k, v in keys_dict.items() if k in valid_keys}
        
        if not updates:
            return False, "No valid keys provided"

        try:
            # Read current lines
            if os.path.exists(self.env_path):
                with open(self.env_path, 'r') as f:
                    lines = f.readlines()
            else:
                lines = []

            # Update existing or add new
            new_lines = []
            keys_processed = set()
            
            for line in lines:
                key_found = False
                for k, v in updates.items():
                    if line.startswith(f"{k}="):
                        new_lines.append(f"{k}={v}\n")
                        keys_processed.add(k)
                        key_found = True
                        break
                if not key_found:
                    new_lines.append(line)
            
            # Add keys that weren't in the file
            for k, v in updates.items():
                if k not in keys_processed:
                    new_lines.append(f"{k}={v}\n")

            # Write back
            with open(self.env_path, 'w') as f:
                f.writelines(new_lines)
            
            # Reload environment
            from dotenv import load_dotenv
            load_dotenv(self.env_path, override=True)
            
            return True, "Configuration updated successfully"
        except Exception as e:
            return False, str(e)

    def test_api_connectivity(self):
        """Run real-time diagnostics on current keys."""
        results = {}
        
        # Test Gemini
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
            model = genai.GenerativeModel('gemini-1.5-flash')
            model.generate_content("test", generation_config={"max_output_tokens": 1})
            results["GEMINI_API_KEY"] = {"status": "success", "message": "Connected"}
        except Exception as e:
            results["GEMINI_API_KEY"] = {"status": "error", "message": str(e)}

        # Test OpenRouter
        try:
            import requests
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {"Authorization": f"Bearer {os.getenv('QWEN_API_KEY')}"}
            resp = requests.post(url, headers=headers, json={"model": "qwen/qwen3-235b-a22b", "messages": [{"role": "user", "content": "hi"}], "max_tokens": 1}, timeout=5)
            if resp.status_code == 200:
                results["QWEN_API_KEY"] = {"status": "success", "message": "Connected"}
            else:
                results["QWEN_API_KEY"] = {"status": "error", "message": f"Error {resp.status_code}: {resp.text[:50]}"}
        except Exception as e:
            results["QWEN_API_KEY"] = {"status": "error", "message": str(e)}
            
        return results

    def get_system_stats(self):
        """Aggregate global system-wide stats"""
        total_users = self.user_model.collection.count_documents({})
        total_quizzes = self.attempts_collection.count_documents({})
        
        # Calculate global accuracy
        pipeline = [
            {'$group': {
                '_id': None,
                'avg_accuracy': {'$avg': '$accuracy'},
                'total_correct': {'$sum': '$score'},
                'total_questions': {'$sum': '$total_questions'}
            }}
        ]
        accuracy_stats = list(self.attempts_collection.aggregate(pipeline))
        global_accuracy = accuracy_stats[0]['avg_accuracy'] if accuracy_stats else 0
        
        # Most popular topics
        topic_pipeline = [
            {'$group': {'_id': '$topic', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 5}
        ]
        popular_topics = list(self.attempts_collection.aggregate(topic_pipeline))
        
        return {
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'global_accuracy': round(global_accuracy, 1),
            'popular_topics': [{'topic': t['_id'], 'count': t['count']} for t in popular_topics]
        }

    def get_global_activity(self, limit=20):
        """Get recent activity from all students"""
        # Recent Quiz Attempts
        attempts = list(self.attempts_collection.find().sort('completed_at', -1).limit(limit))
        
        activities = []
        for a in attempts:
            user = self.user_model.find_by_id(a['user_id'])
            activities.append({
                'id': str(a['_id']),
                'type': 'quiz',
                'user_name': user.get('name', 'Unknown User') if user else 'Deleted User',
                'user_email': user.get('email', '') if user else '',
                'topic': a.get('topic', 'General'),
                'score': a.get('score'),
                'total': a.get('total_questions'),
                'timestamp': a.get('completed_at').isoformat() if isinstance(a.get('completed_at'), datetime) else a.get('completed_at')
            })
            
        # Sort combined activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return activities[:limit]

    def get_learning_trends(self):
        """Get daily quiz completion trends for the last 7 days"""
        trends = []
        now = datetime.utcnow()
        for i in range(7):
            date = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            next_day = date + timedelta(days=1)
            
            count = self.attempts_collection.count_documents({
                'completed_at': {'$gte': date, '$lt': next_day}
            })
            
            trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
            
        return trends[::-1] # Return in chronological order

admin_service = AdminService()
