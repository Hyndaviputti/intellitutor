from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.teacher_service import TeacherService
from services.privacy_service import PrivacyService

teacher_bp = Blueprint('teacher', __name__)
teacher_service = TeacherService()
privacy_service = PrivacyService()

@teacher_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    try:
        user_id = get_jwt_identity()
        anonymize = request.args.get('anonymize', 'false').lower() == 'true'
        
        overview = teacher_service.get_class_overview(user_id, anonymize=anonymize)
        return jsonify(overview), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/admin/retention', methods=['POST'])
@jwt_required()
def apply_retention_policy():
    """
    Apply data retention policy (admin or authorized teacher).
    """
    try:
        data = request.get_json() or {}
        days = data.get('days', 365)
        
        result = privacy_service.enforce_retention_policy(days=days)
        return jsonify({"message": "Retention policy applied", "result": result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
