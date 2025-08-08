"""
RoomScout AI - Flask API Wrapper
Comprehensive API with endpoints for classification, extraction, processing, and security testing
"""

import os
import json
import time
import logging
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import shutil

# Import our RoomScout pipeline
from roomscout_pipeline import RoomScoutPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'csv', 'json'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize RoomScout pipeline
try:
    pipeline = RoomScoutPipeline()
    logger.info("✅ RoomScout pipeline initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize RoomScout pipeline: {e}")
    pipeline = None

# Performance monitoring
class PerformanceMonitor:
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.total_processing_time = 0
        self.start_time = datetime.now()
    
    def record_request(self, processing_time: float, success: bool = True):
        self.request_count += 1
        self.total_processing_time += processing_time
        if not success:
            self.error_count += 1
    
    def get_stats(self) -> Dict[str, Any]:
        uptime = (datetime.now() - self.start_time).total_seconds()
        avg_processing_time = self.total_processing_time / max(self.request_count, 1)
        error_rate = self.error_count / max(self.request_count, 1)
        
        return {
            'uptime_seconds': round(uptime, 2),
            'total_requests': self.request_count,
            'error_count': self.error_count,
            'error_rate': round(error_rate * 100, 2),
            'avg_processing_time': round(avg_processing_time, 3),
            'requests_per_minute': round(self.request_count / (uptime / 60), 2)
        }

# Initialize performance monitor
performance_monitor = PerformanceMonitor()

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def log_request(request_type: str, processing_time: float, success: bool = True, error: str = None):
    """Log request details for monitoring"""
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'request_type': request_type,
        'processing_time': processing_time,
        'success': success,
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'ip_address': request.remote_addr
    }
    
    if error:
        log_data['error'] = error
    
    logger.info(f"Request: {json.dumps(log_data, indent=2)}")
    performance_monitor.record_request(processing_time, success)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with detailed status"""
    start_time = time.time()
    
    try:
        # Check pipeline status
        pipeline_status = "OK" if pipeline else "ERROR"
        
        # Check upload directory
        upload_dir_status = "OK" if os.path.exists(UPLOAD_FOLDER) else "ERROR"
        
        # Get performance stats
        stats = performance_monitor.get_stats()
        
        response = {
            'status': 'OK',
            'message': 'RoomScout AI Flask API is running',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0',
            'components': {
                'pipeline': pipeline_status,
                'upload_directory': upload_dir_status
            },
            'performance': stats
        }
        
        processing_time = time.time() - start_time
        log_request('health_check', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('health_check', processing_time, False, str(e))
        return jsonify({
            'status': 'ERROR',
            'message': f'Health check failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/classify', methods=['POST'])
def classify_message():
    """Classify if a message is housing-related"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        # Parse WhatsApp message and classify
        parsed_message = pipeline.parse_whatsapp_message(message)
        classification_result = pipeline.classify_message(parsed_message['content'])
        
        response = {
            'success': True,
            'message': message,
            'is_housing': classification_result['is_housing'],
            'reasoning': classification_result['reasoning'],
            'confidence': classification_result['confidence'],
            'whatsapp_parsed': parsed_message
        }
        
        processing_time = time.time() - start_time
        log_request('classify', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('classify', processing_time, False, str(e))
        logger.error(f"Classification error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/extract', methods=['POST'])
def extract_housing_data():
    """Extract housing data from a message"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        use_cot = data.get('use_cot', False)
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        # Parse WhatsApp message and extract
        parsed_message = pipeline.parse_whatsapp_message(message)
        extraction_result = pipeline.extract_housing_data(parsed_message['content'], use_cot)
        
        if not extraction_result['success']:
            return jsonify({
                'success': False,
                'error': extraction_result['error']
            }), 500
        
        # Validate extracted data
        validation_result = pipeline.validate_extracted_data(extraction_result['data'])
        
        response = {
            'success': True,
            'message': message,
            'extracted_data': validation_result['data'],
            'completeness_score': validation_result['completeness_score'],
            'extraction_method': extraction_result['method'],
            'whatsapp_parsed': parsed_message
        }
        
        processing_time = time.time() - start_time
        log_request('extract', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('extract', processing_time, False, str(e))
        logger.error(f"Extraction error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/process', methods=['POST'])
def process_message():
    """Complete pipeline processing with security and performance tracking"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        # Process through complete pipeline
        result = pipeline.process_message(message)
        
        response = {
            'success': True,
            'result': result
        }
        
        processing_time = time.time() - start_time
        log_request('process', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('process', processing_time, False, str(e))
        logger.error(f"Processing error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/process-file', methods=['POST'])
def process_file():
    """Process a file containing multiple messages"""
    start_time = time.time()
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: txt, csv, json'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{int(time.time())}_{filename}")
        file.save(temp_path)
        
        try:
            # Read and process file content
            with open(temp_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split into messages (assuming one message per line)
            messages = [line.strip() for line in content.split('\n') if line.strip()]
            
            if not pipeline:
                return jsonify({'error': 'Pipeline not initialized'}), 500
            
            # Process each message
            results = []
            for message in messages:
                result = pipeline.process_message(message)
                results.append(result)
            
            # Calculate batch metrics
            housing_count = sum(1 for r in results if r['is_housing'])
            avg_processing_time = sum(r['processing_time'] for r in results) / len(results)
            avg_confidence = sum(r['confidence_score'] for r in results) / len(results)
            
            response = {
                'success': True,
                'filename': filename,
                'total_messages': len(results),
                'housing_messages': housing_count,
                'results': results,
                'metrics': {
                    'average_processing_time': round(avg_processing_time, 3),
                    'average_confidence': round(avg_confidence, 3),
                    'housing_detection_rate': round(housing_count / len(results) * 100, 1)
                }
            }
            
            processing_time = time.time() - start_time
            log_request('process_file', processing_time, True)
            
            return jsonify(response)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('process_file', processing_time, False, str(e))
        logger.error(f"File processing error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/chat-query', methods=['POST'])
def chat_query():
    """Process a chat query with context"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        # Accept both 'query' and 'message' fields for compatibility
        message = data.get('message') or data.get('query', '')
        context = data.get('context', '')
        user_id = data.get('user_id', '')
        
        if not message:
            return jsonify({'error': 'Message or query is required'}), 400
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        # Use the AI chat response generation
        ai_result = pipeline.generate_ai_chat_response(message, context)
        
        # Format response to match frontend expectations
        response = {
            'response': ai_result.get('response', 'I apologize, but I encountered an error processing your request.'),
            'type': ai_result.get('type', 'conversation'),
            'data': ai_result.get('data'),
            'suggestions': ai_result.get('suggestions', []),
            'ai_generated': ai_result.get('ai_generated', False),
            'timestamp': datetime.now().isoformat()
        }
        
        processing_time = time.time() - start_time
        log_request('chat_query', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('chat_query', processing_time, False, str(e))
        logger.error(f"Chat query error: {traceback.format_exc()}")
        return jsonify({
            'response': "Hey! 😅 I hit a technical snag, but I'm still here to help! What kind of housing are you looking for near NEU?",
            'type': 'error_recovery',
            'suggestions': ["Find budget apartments", "Get neighborhood info", "Upload WhatsApp file"],
            'ai_generated': False,
            'error': str(e)
        }), 500

@app.route('/security-test', methods=['POST'])
def security_test():
    """Test security hardening with attack scenarios"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data or 'scenarios' not in data:
            return jsonify({'error': 'Test scenarios are required'}), 400
        
        test_scenarios = data['scenarios']
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        results = []
        for scenario in test_scenarios:
            result = pipeline.process_message(scenario['prompt'])
            results.append({
                'scenario': scenario.get('name', 'Unknown'),
                'attack_type': scenario.get('type', 'Unknown'),
                'prompt': scenario['prompt'],
                'result': result,
                'blocked': result['security_status'] == 'THREAT_BLOCKED'
            })
        
        blocked_count = sum(1 for r in results if r['blocked'])
        
        response = {
            'success': True,
            'results': results,
            'security_metrics': {
                'total_attacks': len(results),
                'blocked_attacks': blocked_count,
                'block_rate': round(blocked_count / len(results) * 100, 1)
            }
        }
        
        processing_time = time.time() - start_time
        log_request('security_test', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('security_test', processing_time, False, str(e))
        logger.error(f"Security test error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Get detailed performance and system metrics"""
    try:
        stats = performance_monitor.get_stats()
        
        response = {
            'pipeline_info': {
                'name': 'RoomScout AI Flask API',
                'version': '1.0.0',
                'based_on': 'Assignments 6, 7, 8',
                'security_hardening': 'Assignment 8',
                'whatsapp_parsing': 'Real data analysis'
            },
            'performance_targets': {
                'classification_accuracy': '87%',
                'extraction_completeness': '83%',
                'processing_time': '0.004s/message',
                'user_satisfaction': '7.7/10'
            },
            'security_features': [
                'Identity Lock Protocol',
                'Instruction Immunity System',
                'Content Validation & Housing Focus',
                'Privacy Protection Guards',
                'Structured Security Responses'
            ],
            'current_performance': stats,
            'system_status': {
                'pipeline_initialized': pipeline is not None,
                'upload_directory_exists': os.path.exists(UPLOAD_FOLDER),
                'timestamp': datetime.now().isoformat()
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Metrics error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/batch-process', methods=['POST'])
def batch_process():
    """Process multiple messages in batch"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data or 'messages' not in data:
            return jsonify({'error': 'Messages array is required'}), 400
        
        messages = data['messages']
        
        if not pipeline:
            return jsonify({'error': 'Pipeline not initialized'}), 500
        
        results = []
        for message in messages:
            result = pipeline.process_message(message)
            results.append(result)
        
        # Calculate batch metrics
        housing_count = sum(1 for r in results if r['is_housing'])
        avg_processing_time = sum(r['processing_time'] for r in results) / len(results)
        avg_confidence = sum(r['confidence_score'] for r in results) / len(results)
        
        response = {
            'success': True,
            'results': results,
            'metrics': {
                'total_messages': len(results),
                'housing_messages': housing_count,
                'average_processing_time': round(avg_processing_time, 3),
                'average_confidence': round(avg_confidence, 3)
            }
        }
        
        processing_time = time.time() - start_time
        log_request('batch_process', processing_time, True)
        
        return jsonify(response)
        
    except Exception as e:
        processing_time = time.time() - start_time
        log_request('batch_process', processing_time, False, str(e))
        logger.error(f"Batch processing error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/health',
            '/classify',
            '/extract', 
            '/process',
            '/process-file',
            '/chat-query',
            '/security-test',
            '/metrics',
            '/batch-process'
        ]
    }), 404

@app.errorhandler(413)
def too_large(error):
    """Handle file too large errors"""
    return jsonify({
        'error': 'File too large',
        'max_size': '16MB'
    }), 413

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'Please try again later'
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting RoomScout AI Flask API...")
    logger.info("Based on Assignments 6, 7, and 8 with security hardening")
    logger.info("Endpoints available:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /classify - Classify message")
    logger.info("  POST /extract - Extract housing data")
    logger.info("  POST /process - Complete pipeline processing")
    logger.info("  POST /process-file - Process file upload")
    logger.info("  POST /chat-query - Process chat query")
    logger.info("  POST /security-test - Test security hardening")
    logger.info("  GET  /metrics - Get performance metrics")
    logger.info("  POST /batch-process - Process multiple messages")
    
    app.run(host='0.0.0.0', port=5001, debug=True) 