from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.collaborative_service import CollaborativeService

collaborative_bp = Blueprint('collaborative', __name__)
collab_service = CollaborativeService()

@collaborative_bp.route('/create', methods=['POST'])
@jwt_required()
def create_session():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        topic = data.get('topic')
        difficulty = data.get('difficulty', 'medium')
        num_questions = data.get('num_questions', 5)
        
        if not topic:
            return jsonify({'error': 'topic is required'}), 400
            
        session = collab_service.create_session(user_id, topic, difficulty, num_questions)
        return jsonify({"session": session}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaborative_bp.route('/join', methods=['POST'])
@jwt_required()
def join_session():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        join_code = data.get('join_code')
        
        if not join_code:
            return jsonify({'error': 'join_code is required'}), 400
            
        result = collab_service.join_session(user_id, join_code)
        if "error" in result:
             return jsonify(result), 400
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaborative_bp.route('/<session_id>/start', methods=['POST'])
@jwt_required()
def start_session(session_id):
    try:
        user_id = get_jwt_identity()
        result = collab_service.start_session(user_id, session_id)
        if "error" in result:
             return jsonify(result), 403
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaborative_bp.route('/<session_id>/score', methods=['POST'])
@jwt_required()
def update_score(session_id):
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        points = data.get('points', 0)
        
        result = collab_service.update_score(user_id, session_id, points)
        if "error" in result:
             return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaborative_bp.route('/<session_id>/state', methods=['GET'])
@jwt_required()
def get_session_state(session_id):
    try:
        result = collab_service.get_session_state(session_id)
        if "error" in result:
             return jsonify(result), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaborative_bp.route('/<session_id>/advance', methods=['POST'])
@jwt_required()
def advance_question(session_id):
    try:
        user_id = get_jwt_identity()
        result = collab_service.advance_question(user_id, session_id)
        if "error" in result:
             return jsonify(result), 403
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
