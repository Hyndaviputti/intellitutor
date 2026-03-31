from flask import Blueprint, request, jsonify
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.quiz_model import Quiz
from models.user_model import User
from services.analytics_service import AnalyticsService
from services.ml_service import MLService
from services.gemini_service import GeminiService

progress_bp = Blueprint('progress', __name__)
quiz_model = Quiz()
user_model = User()
gemini_service = GeminiService()
analytics_service = AnalyticsService()
ml_service = MLService()

@progress_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_progress(user_id):
    try:
        # Verify user is requesting their own progress or is an admin
        current_user_id = get_jwt_identity()
        current_user = user_model.find_by_id(current_user_id)
        
        if current_user_id != user_id and current_user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Initialize default values
        default_response = {
            'user_id': user_id,
            'total_attempts': 0,
            'total_questions_answered': 0,
            'total_correct_answers': 0,
            'overall_accuracy': 0,
            'topic_stats': {},
            'weak_topics': {},
            'skill_levels': {},
            'learning_progress': [],
            'performance_trends': [],
            'recent_attempts': []
        }
        
        try:
            # Get comprehensive analytics
            topic_stats = analytics_service.get_user_topic_stats(user_id)
            weak_topics = analytics_service.get_weak_topics(user_id)
            skill_levels = analytics_service.get_user_skill_levels(user_id)
            learning_progress = analytics_service.get_learning_progress(user_id)
            performance_trends = analytics_service.get_performance_trends(user_id)
            
            # Get user's quiz attempts
            attempts = quiz_model.get_user_attempts(user_id)
            
            # Calculate statistics
            total_attempts = len(attempts)
            total_questions = sum(attempt['total_questions'] for attempt in attempts)
            total_correct = sum(attempt['score'] for attempt in attempts)
            overall_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
            
            return jsonify({
                'user_id': user_id,
                'total_attempts': total_attempts,
                'total_questions_answered': total_questions,
                'total_correct_answers': total_correct,
                'overall_accuracy': round(overall_accuracy, 2),
                'topic_stats': topic_stats,
                'weak_topics': weak_topics,
                'skill_levels': skill_levels,
                'learning_progress': learning_progress,
                'performance_trends': performance_trends,
                'recent_attempts': attempts[:10]  # Last 10 attempts
            }), 200
            
        except Exception as analytics_error:
            # If analytics fail, return default data
            print(f"Analytics error for user {user_id}: {str(analytics_error)}")
            return jsonify(default_response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/recommend', methods=['POST'])
@jwt_required()
def get_recommendations():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        try:
            # Get weak topics for structured recommendation
            weak_topics = analytics_service.get_weak_topics(user_id)
            
            # Generate structured study plan
            duration = data.get('duration', '3 days')
            study_plan = gemini_service.generate_study_plan(
                list(weak_topics.keys()) if weak_topics else [],
                duration
            )
            
            return jsonify({
                'recommendations': {
                    'weak_topics': weak_topics,
                    'study_plan': study_plan,
                    'suggested_focus': list(weak_topics.keys())[:3] if weak_topics else []
                }
            }), 200
            
        except Exception as analytics_error:
            # If analytics fail, return default recommendations
            print(f"Recommendations error for user {user_id}: {str(analytics_error)}")
            return jsonify({
                'recommendations': {
                    'weak_topics': {},
                    'study_plan': 'Start with basic topics to build your foundation',
                    'suggested_focus': []
                }
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """
    Get detailed analytics for dashboard
    """
    try:
        user_id = get_jwt_identity()
        days = request.args.get('days', 30, type=int)
        
        # Initialize default analytics
        default_analytics = {
            'topic_stats': {},
            'weak_topics': {},
            'skill_levels': {},
            'learning_progress': [],
            'performance_trends': []
        }
        
        try:
            # Get comprehensive analytics
            topic_stats = analytics_service.get_user_topic_stats(user_id)
            weak_topics = analytics_service.get_weak_topics(user_id)
            skill_levels = analytics_service.get_user_skill_levels(user_id)
            learning_progress = analytics_service.get_learning_progress(user_id, days)
            performance_trends = analytics_service.get_performance_trends(user_id)
            
            return jsonify({
                'topic_stats': topic_stats,
                'weak_topics': weak_topics,
                'skill_levels': skill_levels,
                'learning_progress': learning_progress,
                'performance_trends': performance_trends
            }), 200
            
        except Exception as analytics_error:
            # If analytics fail, return default data
            print(f"Analytics error for user {user_id}: {str(analytics_error)}")
            return jsonify(default_analytics), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/weak-topics', methods=['GET'])
@jwt_required()
def get_weak_topics():
    """
    Get weak topics with detailed analysis
    """
    try:
        user_id = get_jwt_identity()
        try:
            weak_topics = analytics_service.get_weak_topics(user_id)
            return jsonify({'weak_topics': weak_topics}), 200
        except Exception as analytics_error:
            print(f"Weak topics error for user {user_id}: {str(analytics_error)}")
            return jsonify({'weak_topics': {}}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/study-streak', methods=['GET'])
@jwt_required()
def get_study_streak():
    """
    Get current study streak for user
    """
    try:
        user_id = get_jwt_identity()
        try:
            study_streak = analytics_service.calculate_study_streak(user_id)
            return jsonify({'study_streak': study_streak}), 200
        except Exception as analytics_error:
            print(f"Study streak error for user {user_id}: {str(analytics_error)}")
            return jsonify({'study_streak': 0}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/skill-levels', methods=['GET'])
@jwt_required()
def get_skill_levels():
    """
    Get user skill levels per topic
    """
    try:
        user_id = get_jwt_identity()
        try:
            skill_levels = analytics_service.get_user_skill_levels(user_id)
            return jsonify({'skill_levels': skill_levels}), 200
        except Exception as analytics_error:
            print(f"Skill levels error for user {user_id}: {str(analytics_error)}")
            return jsonify({'skill_levels': {}}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/persona', methods=['GET'])
@jwt_required()
def get_persona():
    try:
        user_id = get_jwt_identity()
        persona = ml_service.get_user_persona(user_id)
        return jsonify(persona), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/predict-score', methods=['GET'])
@jwt_required()
def predict_score():
    try:
        user_id = get_jwt_identity()
        topic = request.args.get('topic')
        prediction = ml_service.predict_next_score(user_id, topic)
        return jsonify(prediction), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@progress_bp.route('/proactive-insight', methods=['GET'])
@jwt_required()
def get_proactive_insight():
    try:
        user_id = get_jwt_identity()
        
        # 1. Check Cache (10 minutes)
        cached_insights, last_at = user_model.get_proactive_insights(user_id)
        if cached_insights and last_at:
            age = (datetime.utcnow() - last_at).total_seconds()
            if age < 600:  # 10 minutes
                return jsonify({'insights': cached_insights}), 200
        
        # 2. Get Stats
        attempts = quiz_model.get_user_attempts(user_id)
        total_questions = sum(attempt['total_questions'] for attempt in attempts)
        total_correct = sum(attempt['score'] for attempt in attempts)
        overall_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
        stats = {
            'overall_accuracy': round(overall_accuracy, 2),
            'knowledge_points': total_correct
        }
        
        # 3. Get Persona
        persona = ml_service.get_user_persona(user_id)
        
        # 4. Get Predicted Score (for latest weak topic)
        weak_topics_dict = analytics_service.get_weak_topics(user_id)
        weak_topics = list(weak_topics_dict.keys())
        prediction = {"prediction": "N/A", "message": "No data"}
        if weak_topics:
            prediction = ml_service.predict_next_score(user_id, weak_topics[0])
            
        # 5. Generate Holistic Insight via Gemini
        insights = gemini_service.generate_holistic_insight(
            stats, persona, prediction, weak_topics
        )
        
        # 6. Save to Cache
        if insights:
            user_model.update_proactive_insights(user_id, insights)
        
        return jsonify({'insights': insights}), 200
    except Exception as e:
        print(f"Proactive insight route error: {str(e)}")
        return jsonify({'error': str(e)}), 500
