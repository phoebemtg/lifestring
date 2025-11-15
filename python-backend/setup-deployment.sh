#!/bin/bash

# Setup script for Lifestring API deployment
# This script helps you set up all required environment variables

echo "🔧 Lifestring API Deployment Setup"
echo "=================================="
echo ""

# Load existing .env file
if [ -f ".env" ]; then
    echo "📄 Loading existing .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  No .env file found. You'll need to set variables manually."
fi

echo ""
echo "🔍 Current environment variables:"
echo "PROJECT_ID: ${PROJECT_ID:-'Not set'}"
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}${OPENAI_API_KEY:+...}"
echo "DATABASE_URL: ${DATABASE_URL:0:30}${DATABASE_URL:+...}"
echo "SUPABASE_URL: ${SUPABASE_URL:-'Not set'}"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}${SUPABASE_ANON_KEY:+...}"
echo "SUPABASE_JWT_SECRET: ${SUPABASE_JWT_SECRET:0:20}${SUPABASE_JWT_SECRET:+...}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    echo "❌ Not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

echo "✅ Google Cloud CLI is ready"
echo ""

# Set PROJECT_ID if not set
if [ -z "$PROJECT_ID" ]; then
    echo "🔧 Setting up Google Cloud Project..."
    echo "Available projects:"
    gcloud projects list --format="table(projectId,name)"
    echo ""
    read -p "Enter your PROJECT_ID: " PROJECT_ID
    export PROJECT_ID
fi

echo "📋 Using PROJECT_ID: $PROJECT_ID"
echo ""

# Validate required variables
MISSING_VARS=()

if [ -z "$OPENAI_API_KEY" ]; then
    MISSING_VARS+=("OPENAI_API_KEY")
fi

if [ -z "$SUPABASE_URL" ]; then
    MISSING_VARS+=("SUPABASE_URL")
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    MISSING_VARS+=("SUPABASE_ANON_KEY")
fi

if [ -z "$SUPABASE_JWT_SECRET" ]; then
    MISSING_VARS+=("SUPABASE_JWT_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables and run the script again:"
    echo "   export OPENAI_API_KEY='your-key'"
    echo "   export SUPABASE_URL='your-url'"
    echo "   export SUPABASE_ANON_KEY='your-key'"
    echo "   export SUPABASE_JWT_SECRET='your-secret'"
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""

# Test database connection
echo "🧪 Testing database connection..."
if python3 test_db_connection.py > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "⚠️  Database connection failed - will use REST API fallback"
    echo "   This is OK, the API will still work with Supabase REST API"
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "To deploy, run:"
echo "   ./deploy-improved.sh"
echo ""
echo "Or to deploy with custom settings:"
echo "   export PROJECT_ID=$PROJECT_ID"
echo "   export OPENAI_API_KEY='$OPENAI_API_KEY'"
echo "   export SUPABASE_URL='$SUPABASE_URL'"
echo "   export SUPABASE_ANON_KEY='$SUPABASE_ANON_KEY'"
echo "   export SUPABASE_JWT_SECRET='$SUPABASE_JWT_SECRET'"
if [ ! -z "$DATABASE_URL" ]; then
    echo "   export DATABASE_URL='$DATABASE_URL'"
fi
echo "   ./deploy-improved.sh"
