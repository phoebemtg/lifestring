#!/bin/bash

# Lifestring Python Backend Setup Script
# This script sets up the Python FastAPI backend

set -e

echo "🚀 Lifestring Python Backend Setup"
echo "===================================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then 
    echo "❌ Python 3.11+ is required. You have Python $python_version"
    exit 1
fi
echo "✅ Python $python_version detected"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo "✅ pip upgraded"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your credentials:"
    echo "   - DATABASE_URL"
    echo "   - SUPABASE_JWT_SECRET"
    echo "   - OPENAI_API_KEY"
    echo "   - AI_BOT_USER_ID"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p app/api/v1
mkdir -p app/core
mkdir -p app/models
mkdir -p app/schemas
mkdir -p app/services
mkdir -p tests
echo "✅ Directories created"
echo ""

# Check if database is accessible
echo "🔍 Checking database connection..."
if [ -f ".env" ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL found in .env"
    else
        echo "⚠️  DATABASE_URL not set in .env"
    fi
else
    echo "⚠️  .env file not found"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env file with your credentials"
echo "   2. Run: source venv/bin/activate"
echo "   3. Run: uvicorn app.main:app --reload"
echo "   4. Visit: http://localhost:8000/docs"
echo ""
echo "🐳 Or use Docker:"
echo "   docker-compose up -d"
echo ""
echo "Happy coding! 🎉"

