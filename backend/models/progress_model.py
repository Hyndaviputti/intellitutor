from datetime import datetime, timedelta
from bson import ObjectId
from config.db import db

class Progress:
    def __init__(self):
        self.collection = db.get_collection('user_progress')
    
    def create_progress_record(self, user_id):
        """
        Create initial progress record for a user
        """
        progress = {
            'user_id': user_id,
            'created_at': datetime.utcnow(),
            'last_updated': datetime.utcnow(),
            'overall_stats': {
                'total_quizzes_taken': 0,
                'total_questions_answered': 0,
                'total_correct_answers': 0,
                'overall_accuracy': 0.0,
                'study_streak_days': 0,
                'total_study_time_minutes': 0
            },
            'topic_performance': {},  # topic: detailed stats
            'weekly_progress': [],   # weekly snapshots
            'achievements': [],       # unlocked achievements
            'learning_goals': {
                'daily_target_minutes': 30,
                'weekly_target_quizzes': 3,
                'target_accuracy': 80.0
            }
        }
        result = self.collection.insert_one(progress)
        return str(result.inserted_id)
    
    def update_progress(self, user_id, quiz_attempt):
        """
        Update progress after a quiz attempt
        """
        # Get or create progress record
        progress = self.collection.find_one({'user_id': user_id})
        if not progress:
            self.create_progress_record(user_id)
            progress = self.collection.find_one({'user_id': user_id})
        
        # Update overall stats
        overall_stats = progress['overall_stats']
        overall_stats['total_quizzes_taken'] += 1
        overall_stats['total_questions_answered'] += quiz_attempt['total_questions']
        overall_stats['total_correct_answers'] += quiz_attempt['score']
        overall_stats['overall_accuracy'] = (
            overall_stats['total_correct_answers'] / overall_stats['total_questions_answered'] * 100
        ) if overall_stats['total_questions_answered'] > 0 else 0
        
        # Update topic performance
        topic = quiz_attempt.get('topic', 'general')
        if topic not in progress['topic_performance']:
            progress['topic_performance'][topic] = {
                'attempts': 0,
                'questions_answered': 0,
                'correct_answers': 0,
                'accuracy': 0.0,
                'difficulty_level': 'medium',
                'last_attempt': None,
                'improvement_trend': 'stable'  # improving, declining, stable
            }
        
        topic_stats = progress['topic_performance'][topic]
        topic_stats['attempts'] += 1
        topic_stats['questions_answered'] += quiz_attempt['total_questions']
        topic_stats['correct_answers'] += quiz_attempt['score']
        topic_stats['accuracy'] = (
            topic_stats['correct_answers'] / topic_stats['questions_answered'] * 100
        ) if topic_stats['questions_answered'] > 0 else 0
        topic_stats['last_attempt'] = quiz_attempt['completed_at']
        
        # Update difficulty level based on accuracy
        if topic_stats['accuracy'] > 80:
            topic_stats['difficulty_level'] = 'hard'
        elif topic_stats['accuracy'] < 50:
            topic_stats['difficulty_level'] = 'easy'
        else:
            topic_stats['difficulty_level'] = 'medium'
        
        # Update weekly progress
        self._update_weekly_progress(progress, quiz_attempt)
        
        # Check for achievements
        self._check_achievements(progress, overall_stats)
        
        # Update last_updated
        progress['last_updated'] = datetime.utcnow()
        
        # Save the updated progress
        self.collection.update_one(
            {'user_id': user_id},
            {'$set': progress}
        )
        
        return progress
    
    def _update_weekly_progress(self, progress, quiz_attempt):
        """
        Update weekly progress snapshot
        """
        current_week = datetime.utcnow().strftime('%Y-%U')  # Year-Week number
        
        # Find existing week data
        week_data = None
        for week in progress['weekly_progress']:
            if week['week'] == current_week:
                week_data = week
                break
        
        if not week_data:
            week_data = {
                'week': current_week,
                'quizzes_taken': 0,
                'questions_answered': 0,
                'correct_answers': 0,
                'accuracy': 0.0,
                'study_time_minutes': 0,
                'topics_studied': set()
            }
            progress['weekly_progress'].append(week_data)
        
        # Update week data
        week_data['quizzes_taken'] += 1
        week_data['questions_answered'] += quiz_attempt['total_questions']
        week_data['correct_answers'] += quiz_attempt['score']
        week_data['accuracy'] = (
            week_data['correct_answers'] / week_data['questions_answered'] * 100
        ) if week_data['questions_answered'] > 0 else 0
        week_data['study_time_minutes'] += quiz_attempt.get('study_time', 10)  # Default 10 minutes
        
        if 'topic' in quiz_attempt:
            week_data['topics_studied'].add(quiz_attempt['topic'])
        
        # Convert set to list for storage
        week_data['topics_studied'] = list(week_data['topics_studied'])
        
        # Keep only last 12 weeks of data
        progress['weekly_progress'] = progress['weekly_progress'][-12:]
    
    def _check_achievements(self, progress, overall_stats):
        """
        Check and unlock achievements based on progress
        """
        achievements = progress.get('achievements', [])
        
        # First quiz achievement
        if overall_stats['total_quizzes_taken'] == 1:
            achievements.append({
                'id': 'first_quiz',
                'name': 'First Steps',
                'description': 'Completed your first quiz',
                'unlocked_at': datetime.utcnow(),
                'icon': '🎯'
            })
        
        # Accuracy achievements
        if overall_stats['overall_accuracy'] >= 90 and not any(a['id'] == 'accuracy_master' for a in achievements):
            achievements.append({
                'id': 'accuracy_master',
                'name': 'Accuracy Master',
                'description': 'Achieved 90% or higher accuracy',
                'unlocked_at': datetime.utcnow(),
                'icon': '🎯'
            })
        
        # Streak achievements
        if overall_stats['study_streak_days'] >= 7 and not any(a['id'] == 'week_streak' for a in achievements):
            achievements.append({
                'id': 'week_streak',
                'name': 'Week Warrior',
                'description': 'Maintained a 7-day study streak',
                'unlocked_at': datetime.utcnow(),
                'icon': '🔥'
            })
        
        progress['achievements'] = achievements
    
    def get_progress_summary(self, user_id):
        """
        Get comprehensive progress summary
        """
        progress = self.collection.find_one({'user_id': user_id})
        if not progress:
            return self.create_progress_record(user_id)
        
        return progress
    
    def get_learning_insights(self, user_id):
        """
        Generate learning insights and recommendations
        """
        progress = self.get_progress_summary(user_id)
        
        insights = {
            'strengths': [],
            'weak_areas': [],
            'recommendations': [],
            'progress_trend': 'stable',
            'next_focus_topics': []
        }
        
        # Analyze topic performance
        for topic, stats in progress['topic_performance'].items():
            if stats['accuracy'] >= 80:
                insights['strengths'].append({
                    'topic': topic,
                    'accuracy': stats['accuracy'],
                    'level': stats['difficulty_level']
                })
            elif stats['accuracy'] < 60:
                insights['weak_areas'].append({
                    'topic': topic,
                    'accuracy': stats['accuracy'],
                    'level': stats['difficulty_level'],
                    'suggested_action': 'practice more questions'
                })
        
        # Generate recommendations
        if insights['weak_areas']:
            insights['recommendations'].append("Focus on weak areas with targeted practice")
        
        if progress['overall_stats']['overall_accuracy'] < 70:
            insights['recommendations'].append("Review fundamentals before attempting advanced topics")
        
        # Determine next focus topics (top 3 weak areas)
        insights['next_focus_topics'] = [
            area['topic'] for area in sorted(insights['weak_areas'], key=lambda x: x['accuracy'])[:3]
        ]
        
        return insights
    
    def update_study_streak(self, user_id):
        """
        Update study streak based on daily activity
        """
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        progress = self.collection.find_one({'user_id': user_id})
        if not progress:
            return
        
        last_study_date = progress['overall_stats'].get('last_study_date')
        
        if last_study_date:
            last_study = datetime.strptime(last_study_date, '%Y-%m-%d')
            
            # If last study was yesterday, increment streak
            if (today - last_study).days == 1:
                progress['overall_stats']['study_streak_days'] += 1
            # If last study was more than a day ago, reset streak
            elif (today - last_study).days > 1:
                progress['overall_stats']['study_streak_days'] = 1
        
        # Update last study date
        progress['overall_stats']['last_study_date'] = today.strftime('%Y-%m-%d')
        
        self.collection.update_one(
            {'user_id': user_id},
            {'$set': progress}
        )
