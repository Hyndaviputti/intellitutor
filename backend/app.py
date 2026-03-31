from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Import blueprints
from routes.user_routes import user_bp
from routes.ai_routes import ai_bp
from routes.quiz_routes import quiz_bp
from routes.progress_routes import progress_bp
from routes.spaced_repetition_routes import spaced_repetition_bp
from routes.collaborative_routes import collaborative_bp
from routes.teacher_routes import teacher_bp
from routes.admin_routes import admin_bp

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # We'll handle this in the routes

jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(progress_bp, url_prefix='/api/progress')
app.register_blueprint(spaced_repetition_bp, url_prefix='/api/spaced-repetition')
app.register_blueprint(collaborative_bp, url_prefix='/api/collaborative')
app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'IntelliTutor AI Backend is running!'
    })

# Root endpoint
@app.route('/')
def root():
    return jsonify({
        'message': 'Welcome to IntelliTutor AI API',
        'version': '1.0.0',
        'endpoints': {
            'user': '/api/user',
            'ai': '/api/ai',
            'quiz': '/api/quiz',
            'progress': '/api/progress'
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting IntelliTutor AI Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
