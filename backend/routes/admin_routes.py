from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models.user_model import User
from models.content_model import Content
from services.admin_service import AdminService
import json

admin_bp = Blueprint('admin', __name__)
user_model = User()
content_model = Content()
admin_service = AdminService()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# --- User Management ---
@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_users():
    try:
        users = user_model.get_all_users()
        return jsonify({
            'users': [
                {
                    'id': str(u['_id']),
                    'name': u.get('name'),
                    'email': u.get('email'),
                    'role': u.get('role', 'student'),
                    'created_at': u.get('created_at').isoformat() if u.get('created_at') else None
                } for u in users
            ]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        success = user_model.delete_user(user_id)
        if success:
            return jsonify({'message': 'User deleted successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    try:
        data = request.get_json()
        new_role = data.get('role')
        if not new_role:
            return jsonify({'error': 'Role is required'}), 400
            
        success = user_model.update_user_role(user_id, new_role)
        if success:
            return jsonify({'message': f'User role updated to {new_role}'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- System Analytics & Monitoring ---
@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_system_analytics():
    try:
        stats = admin_service.get_system_stats()
        trends = admin_service.get_learning_trends()
        return jsonify({
            'stats': stats,
            'trends': trends
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/activities', methods=['GET'])
@admin_required
def get_global_activities():
    try:
        limit = request.args.get('limit', 20, type=int)
        activities = admin_service.get_global_activity(limit)
        return jsonify({'activities': activities}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Content Management ---
@admin_bp.route('/topics', methods=['POST'])
@admin_required
def add_topic():
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        category = data.get('category')
        difficulty = data.get('difficulty', 'beginner')
        
        if not all([title, description, category]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        topic_id = content_model.add_topic(title, description, category, difficulty)
        return jsonify({'message': 'Topic added successfully', 'topic_id': topic_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/topics', methods=['GET'])
@admin_required
def get_topics():
    try:
        topics = content_model.get_all_topics()
        return jsonify({'topics': topics}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/topics/<topic_id>', methods=['DELETE'])
@admin_required
def delete_topic(topic_id):
    try:
        if content_model.delete_topic(topic_id):
            return jsonify({'message': 'Topic deleted successfully'}), 200
        return jsonify({'error': 'Topic not found or already deleted'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/content/upload', methods=['POST'])
@admin_required
def upload_bulk_content():
    """Endpoint for bulk JSON uploads of topics/questions"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        content_data = json.load(file)
        
        # Process based on format (topics list or questions list)
        added_count = 0
        if isinstance(content_data, list):
            # Assume it's a list of questions if it has "question" field
            if content_data and 'question' in content_data[0]:
                added_count = content_model.add_questions_bulk(content_data)
                return jsonify({'message': f'Successfully uploaded {added_count} questions'}), 201
            else:
                # Assume it's a list of topics
                for t in content_data:
                    content_model.add_topic(
                        t.get('title'), 
                        t.get('description'), 
                        t.get('category'), 
                        t.get('difficulty', 'beginner')
                    )
                    added_count += 1
                return jsonify({'message': f'Successfully uploaded {added_count} topics'}), 201
        
        return jsonify({'error': 'Invalid format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- System Configuration ---
@admin_bp.route('/config', methods=['GET'])
@admin_required
def get_config():
    config = admin_service.get_system_config()
    return jsonify(config), 200

@admin_bp.route('/config', methods=['PUT'])
@admin_required
def update_config():
    data = request.json
    success, message = admin_service.update_config(data)
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400

@admin_bp.route('/test-keys', methods=['POST'])
@admin_required
def test_keys():
    results = admin_service.test_api_connectivity()
    return jsonify(results), 200
