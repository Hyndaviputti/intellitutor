from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.spaced_repetition_service import SpacedRepetitionService

spaced_repetition_bp = Blueprint('spaced_repetition', __name__)
sr_service = SpacedRepetitionService()

@spaced_repetition_bp.route('/review', methods=['POST'])
@jwt_required()
def process_review():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        topic = data.get('topic')
        question_id = data.get('question_id')
        quality = data.get('quality') # 0-5
        
        if not all([topic, question_id, quality is not None]):
            return jsonify({'error': 'topic, question_id, and quality are required'}), 400
            
        result = sr_service.process_review(user_id, topic, question_id, int(quality))
        return jsonify({"message": "Review processed", "result": result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@spaced_repetition_bp.route('/due', methods=['GET'])
@jwt_required()
def get_due_items():
    try:
        user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 10))
        
        items = sr_service.get_due_items(user_id, limit)
        return jsonify({'due_items': items}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@spaced_repetition_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = get_jwt_identity()
        stats = sr_service.get_topic_stats(user_id)
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
