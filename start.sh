#!/bin/bash

echo "🚀 Starting RoomScout AI Application..."

# Check if MongoDB is running
echo "📊 Checking MongoDB status..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   mongod --dbpath /path/to/your/data/directory"
    echo ""
    echo "For now, we'll continue without MongoDB (some features won't work)"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/chat-files
mkdir -p server/uploads/housing-images
mkdir -p server/uploads/general

echo "✅ All dependencies installed!"
echo ""
echo "🎯 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev 