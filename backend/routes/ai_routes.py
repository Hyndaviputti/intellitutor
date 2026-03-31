from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.gemini_service import GeminiService
from models.user_model import User
from models.chat_model import Chat
from datetime import datetime, timezone

ai_bp = Blueprint('ai', __name__)
gemini_service = GeminiService()
user_model = User()
chat_model = Chat()

@ai_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({'error': 'Question is required'}), 400
        
        question = data['question']
        context = data.get('context', None)
        
        # Get user profile for personalized response
        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)
        user_profile = user.get('profile', {}) if user else {}
        
        # Generate AI response
        response = gemini_service.generate_explanation(question, context)
        
        return jsonify({
            'question': question,
            'answer': response,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        session_id = data.get('session_id', None)
        user_id = get_jwt_identity()
        
        # Get recent chat history for context
        chat_history = chat_model.get_chat_history(user_id, session_id, limit=5)
        
        # Format chat history for Gemini
        formatted_history = []
        for chat in reversed(chat_history):
            formatted_history.append({
                'user': chat['user_message'],
                'tutor': chat['ai_response']
            })
        
        # Generate chat response
        response = gemini_service.chat_response(message, formatted_history)
        
        # Save chat message
        chat_id = chat_model.save_message(user_id, message, response, session_id)
        
        return jsonify({
            'message': message,
            'response': response,
            'chat_id': chat_id,
            'session_id': session_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    try:
        user_id = get_jwt_identity()
        session_id = request.args.get('session_id')
        limit = int(request.args.get('limit', 50))
        
        history = chat_model.get_chat_history(user_id, session_id, limit)
        
        # Format for frontend
        formatted_history = []
        for chat in reversed(history):
            formatted_history.append({
                'id': str(chat['_id']),
                'user_message': chat['user_message'],
                'ai_response': chat['ai_response'],
                'timestamp': chat['timestamp'],
                'session_id': chat['session_id']
            })
        
        return jsonify({'history': formatted_history}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    try:
        user_id = get_jwt_identity()
        sessions = chat_model.get_user_sessions(user_id)
        
        return jsonify({'sessions': sessions}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat/session/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_session(session_id):
    try:
        user_id = get_jwt_identity()
        session_id = request.view_args['session_id']
        
        result = chat_model.delete_session(user_id, session_id)
        
        return jsonify({'message': 'Session deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/concept-map', methods=['GET'])
@jwt_required()
def get_concept_map():
    try:
        topic = request.args.get('topic')
        if not topic:
            return jsonify({'error': 'topic parameter is required'}), 400
            
        result = gemini_service.generate_concept_map(topic)
        if "error" in result:
             return jsonify(result), 500
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
