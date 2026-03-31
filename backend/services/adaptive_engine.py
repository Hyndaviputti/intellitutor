from datetime import datetime
from services.analytics_service import AnalyticsService
from services.gemini_service import GeminiService
from models.quiz_model import Quiz

class AdaptiveEngine:
    def __init__(self):
        self.analytics_service = AnalyticsService()
        self.gemini_service = GeminiService()
        self.quiz_model = Quiz()
    
    def calculate_topic_elo(self, user_id, topic):
        """
        Calculates the user's implicit IRT/Elo rating for a topic based on 
        the sequence of their past attempts.
        """
        attempts = self.quiz_model.get_topic_attempts(user_id, topic)
        # Base Elo for a new topic
        user_elo = 1200
        
        # Difficulty base embeddings
        diff_elo_map = {
            'easy': 1000,
            'medium': 1200,
            'hard': 1500
        }
        
        K = 32 # Maximum elo change per attempt
        
        # Sort attempts chronologically
        attempts = sorted(attempts, key=lambda x: x.get('completed_at', ''))
        
        for attempt in attempts:
            diff = attempt.get('difficulty', 'medium')
            q_elo = diff_elo_map.get(diff, 1200)
            
            # Actual score 0.0 to 1.0
            actual = attempt.get('score', 0) / max(attempt.get('total_questions', 1), 1)
            
            # Expected score based on Elo math
            expected = 1 / (1 + 10 ** ((q_elo - user_elo) / 400))
            
            # Update user Elo
            user_elo += K * (actual - expected)
            
        return user_elo

    def determine_difficulty(self, user_id, topic):
        """
        Automatically determine next question difficulty using Scikit-Learn 
        Decision Trees to fully utilize ML, rather than static thresholds.
        """
        from services.ml_service import MLService
        ml_service = MLService()
        
        current_elo = self.calculate_topic_elo(user_id, topic)
        
        # Use explicit ML model for pathway determination
        optimal_diff = ml_service.predict_optimal_difficulty(user_id, topic, current_elo)
        
        return optimal_diff
    
    def generate_adaptive_quiz(self, user_id, topic, num_questions=5):
        """
        Generate quiz with automatic difficulty determination
        """
        difficulty = self.determine_difficulty(user_id, topic)
        
        # Generate quiz with determined difficulty
        quiz_data = self.gemini_service.generate_quiz(topic, difficulty, num_questions)
        
        if 'error' in quiz_data:
            return quiz_data
        
        # Add metadata for adaptive tracking
        quiz_data['adaptive_difficulty'] = difficulty
        quiz_data['user_id'] = user_id
        quiz_data['topic'] = topic
        quiz_data['generated_at'] = datetime.utcnow()
        
        return quiz_data
    
    def update_difficulty_after_quiz(self, user_id, topic, quiz_score, total_questions):
        """
        Update user difficulty level based on quiz performance
        """
        accuracy = (quiz_score / total_questions) * 100
        new_difficulty = self.determine_difficulty(user_id, topic)
        
        # The Elo engine determines it mathematically now, so this is just a proxy return 
        # to satisfy the old endpoint payload format
        
        return {
            'previous_difficulty': new_difficulty,
            'new_difficulty': new_difficulty,
            'accuracy': accuracy,
            'current_elo': round(self.calculate_topic_elo(user_id, topic), 2),
            'should_upgrade': False
        }
    
    def get_next_learning_path(self, user_id):
        """
        Generate adaptive learning path based on user performance.
        Now uses recent accuracy to "boost" users faster.
        """
        topic_stats = self.analytics_service.get_user_topic_stats(user_id)
        learning_path = []
        
        for topic, stats in topic_stats['topics'].items():
            # If the user is currently "strong" in a topic (based on recent accuracy),
            # we "boost" them by removing it from active study objectives.
            if stats['level'] == 'strong':
                continue
                
            difficulty = self.determine_difficulty(user_id, topic)
            recent_acc = stats.get('recent_accuracy', stats['accuracy'])
            avg_acc = stats['accuracy']
            
            # Dynamic reason based on performance delta
            if recent_acc > avg_acc + 5:
                # User is improving recently
                reason = f"Your recent performance in {topic} is improving ({round(recent_acc)}%)! Solidify this trend to reach 100% mastery."
                priority = 'medium'
            elif stats['level'] == 'weak':
                reason = f"Your current accuracy of {round(recent_acc)}% indicates a significant mastery gap. Focused training will prevent future blockers."
                priority = 'high'
            else:
                reason = f"Consolidating your {round(recent_acc)}% mastery in {topic} will strengthen your prerequisite knowledge for advanced modules."
                priority = 'medium'
                
            learning_path.append({
                'topic': topic,
                'priority': priority,
                'difficulty': difficulty,
                'current_accuracy': recent_acc, # Use recent accuracy for progress bar
                'reason': reason,
                'recommended_actions': self._get_recommendations_for_topic(topic, stats)
            })
            
        # Prioritize high priority (weak) topics first, then by lowest current accuracy
        learning_path.sort(key=lambda x: (x['priority'] != 'high', x['current_accuracy']))
        
        return learning_path[:5]
    
    def _get_recommendations_for_topic(self, topic, stats):
        """
        Generate specific recommendations for a topic
        """
        accuracy = stats['accuracy']
        recommendations = []
        
        if accuracy < 40:
            recommendations.append("Start with basic concepts and fundamentals")
            recommendations.append("Review prerequisite materials")
            recommendations.append("Practice with easier questions first")
        elif accuracy < 60:
            recommendations.append("Focus on understanding core concepts")
            recommendations.append("Practice more questions on this topic")
            recommendations.append("Review explanations for incorrect answers")
        elif accuracy < 80:
            recommendations.append("Challenge yourself with harder questions")
            recommendations.append("Practice timed quizzes")
            recommendations.append("Teach the concept to someone else")
        else:
            recommendations.append("Advanced practice with complex problems")
            recommendations.append("Apply concepts to real-world scenarios")
            recommendations.append("Help others with this topic")
        
        return recommendations
    
    def should_show_explanation(self, user_id, topic, question_difficulty):
        """
        Determine if explanations should be shown based on user level
        """
        user_skill = self.analytics_service.get_user_skill_levels(user_id)
        
        if topic not in user_skill:
            return True  # New user, show explanations
        
        skill_level = user_skill[topic]
        
        # Show explanations for difficult questions or weak areas
        if question_difficulty == 'hard' or skill_level == 'easy':
            return True
        
        return False
    
    def get_adaptive_feedback(self, user_id, topic, is_correct, question_difficulty):
        """
        Generate adaptive feedback based on user performance
        """
        if is_correct:
            if question_difficulty == 'hard':
                return "Excellent! You're mastering advanced concepts."
            elif question_difficulty == 'medium':
                return "Good job! You're ready for more challenging questions."
            else:
                return "Correct! Keep building your foundation."
        else:
            user_skill = self.analytics_service.get_user_skill_levels(user_id)
            skill_level = user_skill.get(topic, 'medium')
            
            if question_difficulty == 'hard' and skill_level == 'easy':
                return "This was a challenging question. Let's focus on building your foundation first."
            elif question_difficulty == 'easy':
                return "Let's review the basics. This concept is important for more advanced topics."
            else:
                return "Not quite right. Let's break this down step by step."
