#!/bin/bash

# Quick deployment script for Lifestring backend
# This script deploys the improved backend with better error handling

set -e  # Exit on any error

echo "🚀 Starting Lifestring Backend Deployment..."

# Check if we're in the right directory
if [ ! -f "main.py" ] && [ ! -f "app/main.py" ]; then
    echo "❌ Error: Please run this script from the python-backend directory"
    exit 1
fi

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set project ID
PROJECT_ID="lifestring-473816"
SERVICE_NAME="lifestring-api"
REGION="us-central1"

echo "📋 Using project: $PROJECT_ID"
echo "📋 Service name: $SERVICE_NAME"
echo "📋 Region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

# Check if .env file exists and warn about environment variables
if [ -f ".env" ]; then
    echo "✅ Found .env file"
    echo "⚠️  Make sure your environment variables are set correctly:"
    echo "   - DATABASE_URL (Supabase connection string)"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - OPENAI_API_KEY"
    echo "   - OPENWEATHER_API_KEY"
    echo "   - NEWSAPI_KEY"
else
    echo "⚠️  No .env file found. Environment variables will need to be set in Cloud Run."
fi

# Build and deploy
echo "🔨 Building and deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8000 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 100 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "ENVIRONMENT=production" \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Service URL: $SERVICE_URL"
echo ""
echo "🧪 Testing the deployment..."

# Test the health endpoint
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - service might still be starting up"
fi

# Test the AI endpoints
echo "🤖 Testing AI endpoints..."

# Test public endpoint
echo "Testing public AI endpoint..."
PUBLIC_RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/ai/public-chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, this is a test", "user_name": "Test User"}' || echo "FAILED")

if [[ "$PUBLIC_RESPONSE" == *"FAILED"* ]] || [[ "$PUBLIC_RESPONSE" == *"trouble connecting"* ]]; then
    echo "⚠️  Public AI endpoint test failed"
    echo "Response: $PUBLIC_RESPONSE"
else
    echo "✅ Public AI endpoint working"
fi

echo ""
echo "📋 Deployment Summary:"
echo "   Service URL: $SERVICE_URL"
echo "   Health endpoint: $SERVICE_URL/health"
echo "   Public AI endpoint: $SERVICE_URL/api/ai/public-chat"
echo "   Authenticated AI endpoint: $SERVICE_URL/api/ai/lifestring-chat"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your frontend VITE_BACKEND_URL to: $SERVICE_URL"
echo "   2. Test the authenticated endpoint with a valid JWT token"
echo "   3. Check Cloud Run logs if there are any issues:"
echo "      gcloud logs read --service=$SERVICE_NAME --region=$REGION"
echo ""
echo "✨ Deployment complete!"
