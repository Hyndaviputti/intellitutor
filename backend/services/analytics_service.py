from datetime import datetime, timedelta
from bson import ObjectId
from config.db import db

class AnalyticsService:
    def __init__(self):
        self.quiz_attempts_collection = db.get_collection('quiz_attempts')
        self.users_collection = db.get_collection('users')
        self.chat_sessions_collection = db.get_collection('chat_sessions')
    
    def calculate_study_streak(self, user_id):
        """
        Calculate current study streak based on daily activity
        Activity includes: quiz attempts, chat sessions
        """
        # Get activity dates for the last 90 days
        start_date = datetime.utcnow() - timedelta(days=90)
        
        # Get quiz attempts
        quiz_pipeline = [
            {'$match': {
                'user_id': user_id,
                'completed_at': {'$gte': start_date}
            }},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$completed_at'}},
                'has_activity': {'$sum': 1}
            }},
            {'$project': {
                'date': '$_id',
                'has_activity': 1
            }}
        ]
        
        # Get chat sessions
        chat_pipeline = [
            {'$match': {
                'user_id': user_id,
                'timestamp': {'$gte': start_date}
            }},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                'has_activity': {'$sum': 1}
            }},
            {'$project': {
                'date': '$_id',
                'has_activity': 1
            }}
        ]
        
        quiz_dates = list(self.quiz_attempts_collection.aggregate(quiz_pipeline))
        chat_dates = list(self.chat_sessions_collection.aggregate(chat_pipeline))
        
        # Debug: Print raw data
        print(f"DEBUG: Quiz dates for user {user_id}: {quiz_dates}")
        print(f"DEBUG: Chat dates for user {user_id}: {chat_dates}")
        
        # Combine activities
        activity_dates = set()
        
        for item in quiz_dates:
            activity_dates.add(item['date'])
        
        for item in chat_dates:
            activity_dates.add(item['date'])
        
        print(f"DEBUG: Combined activity dates: {sorted(activity_dates)}")
        
        # Convert to list for easier handling
        activity_dates = list(activity_dates)
        
        # Calculate streak
        if not activity_dates:
            return 0
        
        # Sort dates in descending order
        activity_dates.sort(reverse=True)
        
        # Get today's date in UTC
        today = datetime.utcnow().date()
        today_str = today.strftime('%Y-%m-%d')
        yesterday_str = (today - timedelta(days=1)).strftime('%Y-%m-%d')
        
        print(f"DEBUG: Today: {today_str}, Yesterday: {yesterday_str}")
        
        streak = 0
        current_date = today
        
        # If no activity today, check if there's activity yesterday to start streak
        if today_str not in activity_dates:
            print(f"DEBUG: No activity today, checking yesterday...")
            if yesterday_str not in activity_dates:
                print(f"DEBUG: No activity yesterday either, streak is 0")
                return 0  # No activity today or yesterday, streak is 0
            current_date = today - timedelta(days=1)
            print(f"DEBUG: Starting streak from yesterday: {current_date.strftime('%Y-%m-%d')}")
        
        # Count consecutive days backwards from the starting point
        max_iterations = 90  # Prevent infinite loops
        iterations = 0
        
        while iterations < max_iterations:
            date_str = current_date.strftime('%Y-%m-%d')
            print(f"DEBUG: Checking {date_str}, found in activities: {date_str in activity_dates}")
            
            if date_str in activity_dates:
                streak += 1
                current_date -= timedelta(days=1)
                iterations += 1
                print(f"DEBUG: Streak increased to {streak}")
            else:
                print(f"DEBUG: Breaking streak at {date_str}")
                break
        
        print(f"DEBUG: Final streak: {streak}")
        return streak
    
    def get_user_topic_stats(self, user_id):
        """
        Get comprehensive topic statistics for a user
        Returns: Dictionary with topics and their performance levels
        """
        # Get all attempts sorted by date to find recent ones
        all_attempts = list(self.quiz_attempts_collection.find({'user_id': user_id}).sort('completed_at', -1))
        
        topic_groups = {}
        for attempt in all_attempts:
            topic = attempt.get('topic', 'General')
            if topic not in topic_groups:
                topic_groups[topic] = []
            topic_groups[topic].append(attempt)
        
        topics = {}
        for topic, attempts in topic_groups.items():
            total_questions = sum(a.get('total_questions', 0) for a in attempts)
            total_correct = sum(a.get('score', 0) for a in attempts)
            avg_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
            
            # Recent performance (last 3 attempts)
            recent_attempts = attempts[:3]
            recent_questions = sum(a.get('total_questions', 0) for a in recent_attempts)
            recent_correct = sum(a.get('score', 0) for a in recent_attempts)
            recent_accuracy = (recent_correct / recent_questions * 100) if recent_questions > 0 else avg_accuracy
            
            # Determine level based on RECENT performance to "boost" user
            if recent_accuracy >= 85:
                level = 'strong'
            elif recent_accuracy >= 60:
                level = 'moderate'
            else:
                level = 'weak'
            
            topics[topic] = {
                'accuracy': round(avg_accuracy, 1),
                'recent_accuracy': round(recent_accuracy, 1),
                'level': level,
                'total_questions': total_questions,
                'correct_answers': total_correct,
                'attempts': len(attempts)
            }
        
        return {'topics': topics}
    
    def get_weak_topics(self, user_id):
        """
        Get only weak topics (accuracy < 60%)
        """
        topic_stats = self.get_user_topic_stats(user_id)
        weak_topics = {}
        
        for topic, stats in topic_stats['topics'].items():
            if stats['level'] == 'weak':
                weak_topics[topic] = stats
        
        return weak_topics
    
    def get_user_skill_levels(self, user_id):
        """
        Get user skill level per topic (easy/medium/hard)
        """
        topic_stats = self.get_user_topic_stats(user_id)
        skill_levels = {}
        
        for topic, stats in topic_stats['topics'].items():
            accuracy = stats['accuracy']
            if accuracy > 80:
                skill_levels[topic] = 'hard'
            elif accuracy >= 50:
                skill_levels[topic] = 'medium'
            else:
                skill_levels[topic] = 'easy'
        
        return skill_levels
    
    def get_learning_progress(self, user_id, days=7):
        """
        Get learning progress over time
        Returns simple format for frontend timeline
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        print(f"Getting learning progress for user {user_id} from {start_date}")
        
        # Simple aggregation to get daily performance
        pipeline = [
            {'$match': {
                'user_id': user_id,
                'completed_at': {'$gte': start_date}
            }},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$completed_at'}},
                'total_questions': {'$sum': '$total_questions'},
                'correct_answers': {'$sum': '$score'},
                'attempts_count': {'$sum': 1}
            }},
            {'$project': {
                '_id': 0,
                'date': '$_id',
                'accuracy': {
                    '$cond': {
                        'if': {'$eq': ['$total_questions', 0]},
                        'then': 0,
                        'else': {
                            '$multiply': [
                                {'$divide': ['$correct_answers', '$total_questions']},
                                100
                            ]
                        }
                    }
                }
            }},
            {'$sort': {'date': 1}}
        ]
        
        results = list(self.quiz_attempts_collection.aggregate(pipeline))
        print(f"Raw aggregation results: {results}")
        
        # Create a map of available data
        data_map = {result['date']: result['accuracy'] for result in results}
        
        # Generate all 7 days with data
        formatted_results = []
        days_mapping = {
            'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
            'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
        }
        
        for i in range(7):
            date_obj = datetime.utcnow() - timedelta(days=6-i)
            date_str = date_obj.strftime('%Y-%m-%d')
            day_name = days_mapping.get(date_obj.strftime('%A'), 'Mon')
            
            accuracy = data_map.get(date_str, 0)  # Default to 0 if no data
            
            formatted_results.append({
                'date': day_name,
                'score': round(accuracy, 1),
                'topic': 'General'
            })
        
        print(f"Formatted results for frontend: {formatted_results}")
        
        return formatted_results
    
    def get_performance_trends(self, user_id):
        """
        Get performance trends for recommendations
        """
        topic_stats = self.get_user_topic_stats(user_id)
        
        trends = {
            'improving_topics': [],
            'declining_topics': [],
            'stable_topics': [],
            'weak_topics': [],
            'strong_topics': []
        }
        
        for topic, stats in topic_stats['topics'].items():
            topic_data = {
                'topic': topic,
                'accuracy': stats['accuracy'],
                'level': stats['level']
            }
            
            if stats['level'] == 'weak':
                trends['weak_topics'].append(topic_data)
            elif stats['level'] == 'strong':
                trends['strong_topics'].append(topic_data)
            else:
                trends['stable_topics'].append(topic_data)
        
        return trends
