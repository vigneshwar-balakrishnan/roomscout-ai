#!/bin/bash

# RoomScout AI Setup Script
# This script will set up the complete RoomScout AI project

echo "🏠 RoomScout AI - Northeastern University Housing Assistant"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/chat-files
mkdir -p server/uploads/housing-images
mkdir -p server/uploads/general

echo "✅ Upload directories created"

# Check if MongoDB is running (optional)
echo ""
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB:"
        echo "   mongod"
    fi
else
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "   Please install MongoDB or use MongoDB Atlas"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🏠 RoomScout AI - Making housing search easier for Northeastern University students!" 