#!/bin/bash

# RoomScout AI Python API Startup Script
# Based on Assignments 6, 7, and 8 with security hardening

echo "=================================================="
echo "🚀 RoomScout AI Python API Startup"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
DEVELOPMENT_MODE=true
EOF
    echo "✅ .env file created with placeholder API keys"
    echo "⚠️  Please update the .env file with your actual API keys"
    echo "💡 Development mode enabled to save tokens"
fi

# Check if port 5001 is available
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5001 is already in use. Stopping existing process..."
    lsof -ti:5001 | xargs kill -9
    sleep 2
fi

echo "🚀 Starting RoomScout AI Flask API on http://localhost:5001"
echo "Endpoints available:"
echo "  GET  /health - Health check"
echo "  POST /classify - Classify message"
echo "  POST /extract - Extract housing data"
echo "  POST /process - Complete pipeline processing"
echo "  POST /process-file - Process file upload"
echo "  POST /chat-query - Process chat query"
echo "  POST /security-test - Test security hardening"
echo "  GET  /metrics - Get performance metrics"
echo "  POST /batch-process - Process multiple messages"
echo ""
echo "💡 Token Optimization Features:"
echo "  - Development mode: Uses gpt-3.5-turbo instead of gpt-4o-mini"
echo "  - Reduced max_tokens: 500 instead of 1000"
echo "  - LangSmith tracing disabled in dev mode"
echo "  - Simulated responses for testing"
echo ""
echo "Press Ctrl+C to stop"
echo "=================================================="

# Start the Flask API
python roomscout_pipeline.py 