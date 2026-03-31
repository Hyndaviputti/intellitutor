from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from models.user_model import User
from datetime import timedelta

user_bp = Blueprint('user', __name__)
user_model = User()

@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        existing_user = user_model.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user_id = user_model.create_user(
            data['name'],
            data['email'],
            hashed_password.decode('utf-8')
        )
        
        # Create access token
        access_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'name': data['name'],
            'email': data['email'],
            'role': 'student',
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user
        user = user_model.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(
            identity=str(user['_id']),
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user.get('role', 'student'),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user.get('role', 'student'),
            'profile': user.get('profile', {}),
            'created_at': user['created_at']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_model.update_profile(user_id, data.get('profile', {}))
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
