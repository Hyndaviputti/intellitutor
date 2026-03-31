from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.gemini_service import GeminiService
from services.adaptive_engine import AdaptiveEngine
from models.quiz_model import Quiz
from models.user_model import User

quiz_bp = Blueprint('quiz', __name__)
gemini_service = GeminiService()
adaptive_engine = AdaptiveEngine()
quiz_model = Quiz()
user_model = User()

@quiz_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_quiz():
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({'error': 'Topic is required'}), 400
        
        topic = data['topic'].strip()
        num_questions = data.get('num_questions', 5)
        user_id = get_jwt_identity()
        
        # Validate: only allow educational/academic topics
        if not _is_educational_topic(topic):
            return jsonify({
                'error': f'"{topic}" is not an educational topic. Please enter an academic subject like Mathematics, Physics, Data Structures, Python, History, Biology, etc.'
            }), 400
        
        # ADAPTIVE: Automatically determine difficulty based on user performance
        difficulty = adaptive_engine.determine_difficulty(user_id, topic)
        
        # Check predefined questions first
        from models.content_model import Content
        content_model = Content()
        
        predefined_questions = content_model.get_questions_by_topic_name(topic, num_questions)
        
        if predefined_questions and len(predefined_questions) >= min(3, num_questions):
            # We have enough predefined questions, use them
            quiz_data = {
                'questions': predefined_questions,
                'adaptive_difficulty': difficulty,
                'user_id': user_id,
                'topic': topic
            }
        else:
            # Fall back to Gemini adaptive quiz
            quiz_data = adaptive_engine.generate_adaptive_quiz(user_id, topic, num_questions)
        
        if 'error' in quiz_data:
            return jsonify({'error': quiz_data['error']}), 500
        
        # Store quiz in database
        quiz_id = quiz_model.create_quiz(topic, difficulty, quiz_data['questions'], user_id)
        
        return jsonify({
            'quiz_id': quiz_id,
            'topic': topic,
            'difficulty': difficulty,
            'adaptive_difficulty': quiz_data.get('adaptive_difficulty', difficulty),
            'questions': quiz_data['questions']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('quiz_id', 'answers')):
            return jsonify({'error': 'Quiz ID and answers are required'}), 400
        
        quiz_id = data['quiz_id']
        answers = data['answers']
        user_id = get_jwt_identity()
        
        # Get quiz details
        quiz = quiz_model.get_quiz_with_details(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Calculate score
        correct_answers = 0
        total_questions = len(quiz['questions'])
        
        for i, question in enumerate(quiz['questions']):
            if i < len(answers):
                user_answer = answers[i]
                correct_answer = question.get('correct_answer', 0)
                
                if user_answer == correct_answer:
                    correct_answers += 1
        
        # Submit attempt with adaptive metadata
        attempt_id = quiz_model.submit_adaptive_attempt(
            user_id, quiz_id, answers, correct_answers, total_questions, 
            quiz['topic'], quiz['difficulty']
        )
        
        # Integration: Add questions to Spaced Repetition
        try:
            from services.spaced_repetition_service import SpacedRepetitionService
            sr_service = SpacedRepetitionService()
            for i, question in enumerate(quiz['questions']):
                is_correct = False
                if i < len(answers):
                    is_correct = (answers[i] == question.get('correct_answer', 0))
                
                # Use a unique ID for the question within the quiz or use the question text hash
                q_id = f"{quiz_id}_{i}"
                sr_service.record_quiz_result(
                    user_id, quiz['topic'], q_id, 
                    question['question'], question.get('explanation', ''), is_correct
                )
        except Exception as sr_error:
            print(f"Spaced Repetition tracking failed: {sr_error}")

        # Update user performance history
        study_time = quiz.get('metadata', {}).get('estimated_time', 10)
        user_model.update_performance_history(user_id, {'study_time': study_time})
        
        # ADAPTIVE: Update difficulty based on performance
        difficulty_update = adaptive_engine.update_difficulty_after_quiz(
            user_id, quiz['topic'], correct_answers, total_questions
        )
        
        # Update user skill level
        user_model.update_skill_level(user_id, quiz['topic'], difficulty_update['new_difficulty'])
        
        # Generate dynamic training suggestions based on performance
        training_suggestions = gemini_service.generate_training_suggestions(
            quiz['topic'], correct_answers, total_questions
        )
        
        return jsonify({
            'attempt_id': attempt_id,
            'score': correct_answers,
            'total_questions': total_questions,
            'accuracy': (correct_answers / total_questions * 100) if total_questions > 0 else 0,
            'difficulty_update': difficulty_update,
            'topic': quiz['topic'],
            'training_suggestions': training_suggestions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/attempts', methods=['GET'])
@jwt_required()
def get_attempts():
    try:
        user_id = get_jwt_identity()
        attempts = quiz_model.get_user_attempts(user_id)
        
        return jsonify({'attempts': attempts}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/topic-stats', methods=['GET'])
@jwt_required()
def get_topic_stats():
    try:
        user_id = get_jwt_identity()
        topic = request.args.get('topic')
        
        if topic:
            # Get stats for specific topic
            attempts = quiz_model.get_topic_attempts(user_id, topic)
            return jsonify({'topic': topic, 'attempts': attempts}), 200
        else:
            # Get all topic stats
            stats = quiz_model.get_user_performance_by_topic(user_id)
            return jsonify({'topic_stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/weak-topics', methods=['GET'])
@jwt_required()
def get_weak_topics():
    try:
        user_id = get_jwt_identity()
        weak_topics = quiz_model.get_weak_topics(user_id)
        return jsonify({'weak_topics': weak_topics}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/adaptive-path', methods=['GET'])
@jwt_required()
def get_adaptive_path():
    try:
        user_id = get_jwt_identity()
        learning_path = adaptive_engine.get_next_learning_path(user_id)
        return jsonify({'learning_path': learning_path}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/available-topics', methods=['GET'])
@jwt_required()
def get_available_topics():
    try:
        from models.content_model import Content
        content_model = Content()
        topics = content_model.get_all_topics()
        return jsonify({'topics': topics}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Educational Topic Validation ---

EDUCATIONAL_CATEGORIES = [
    # STEM
    "math", "mathematics", "algebra", "geometry", "calculus", "trigonometry", "statistics",
    "physics", "chemistry", "biology", "science", "astronomy", "ecology", "genetics",
    "computer", "programming", "python", "java", "javascript", "c++", "c#", "html", "css",
    "data structure", "algorithm", "machine learning", "artificial intelligence", "ai", "ml",
    "deep learning", "neural network", "database", "sql", "nosql", "mongodb", "react",
    "web development", "software", "engineering", "operating system", "networking", "cloud",
    "cybersecurity", "blockchain", "devops", "api", "oop", "object oriented",
    # Humanities & Social Sciences
    "history", "geography", "economics", "political science", "psychology", "sociology",
    "philosophy", "literature", "english", "grammar", "writing", "linguistics",
    # Business & Commerce
    "accounting", "finance", "marketing", "management", "business", "commerce",
    # Sciences
    "anatomy", "physiology", "microbiology", "biotechnology", "environmental science",
    "organic chemistry", "inorganic chemistry", "biochemistry", "pharmaceutical",
    # Engineering
    "electrical", "mechanical", "civil", "electronics", "robotics", "automation",
    # Education & General Academic
    "education", "pedagogy", "research", "thesis", "academic",
    "logical reasoning", "aptitude", "quantitative", "verbal",
    # Arts & Design (educational)
    "music theory", "art history", "design principles",
]

NON_EDUCATIONAL_BLOCKLIST = [
    "movie", "film", "celebrity", "gossip", "recipe", "cooking", "food",
    "cricket", "football", "soccer", "basketball", "sports score",
    "dating", "relationship", "astrology", "horoscope",
    "meme", "joke", "funny", "entertainment", "game", "gaming",
    "stock price", "betting", "gambling", "lottery",
    "politics", "election result", "scandal",
]

def _is_educational_topic(topic: str) -> bool:
    """Check if a topic is educational/academic in nature."""
    topic_lower = topic.lower().strip()
    
    # Reject very short or empty topics
    if len(topic_lower) < 2:
        return False
    
    # Block explicitly non-educational topics
    for blocked in NON_EDUCATIONAL_BLOCKLIST:
        if blocked in topic_lower:
            return False
    
    # Allow if it matches any educational category keyword
    for edu_keyword in EDUCATIONAL_CATEGORIES:
        if edu_keyword in topic_lower:
            return True
    
    # For topics that don't match any keyword, allow them with a generous check
    # (the user might type something like "sorting" or "recursion" which is valid)
    # We allow it UNLESS it was blocked above — this keeps the filter permissive for
    # educational niches while blocking obvious non-educational topics.
    return True
