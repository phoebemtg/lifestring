#!/bin/bash

# Direct deployment to Cloud Run using source deployment
set -e

echo "🚀 Direct Cloud Run Deployment..."

# Set project and service details
PROJECT_ID="lifestring-473816"
SERVICE_NAME="lifestring-api"
REGION="us-central1"

echo "📋 Project: $PROJECT_ID"
echo "📋 Service: $SERVICE_NAME"
echo "📋 Region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Check if we have the required files
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found"
    exit 1
fi

if [ ! -d "app" ]; then
    echo "❌ Error: app directory not found"
    exit 1
fi

echo "✅ All required files found"

# Deploy directly to Cloud Run using source deployment
echo "🚀 Deploying to Cloud Run using source deployment..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 100 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "ENVIRONMENT=production,PORT=8080" \
    --quiet

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Service URL: $SERVICE_URL"

# Test the deployment
echo ""
echo "🧪 Testing deployment..."

# Wait a moment for the service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - service might still be starting up"
    echo "Let's try the root endpoint..."
    ROOT_RESPONSE=$(curl -s "$SERVICE_URL/" || echo "FAILED")
    echo "Root response: $ROOT_RESPONSE"
fi

# Test public AI endpoint
echo "Testing public AI endpoint..."
PUBLIC_RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/ai/public-chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, this is a test", "user_name": "Test User"}' || echo "FAILED")

if [[ "$PUBLIC_RESPONSE" == *"FAILED"* ]]; then
    echo "⚠️  Public AI endpoint test failed"
    echo "Response: $PUBLIC_RESPONSE"
else
    echo "✅ Public AI endpoint working"
    echo "Response preview: ${PUBLIC_RESPONSE:0:100}..."
fi

echo ""
echo "📋 Deployment Summary:"
echo "   Service URL: $SERVICE_URL"
echo "   Health: $SERVICE_URL/health"
echo "   Public AI: $SERVICE_URL/api/ai/public-chat"
echo "   Auth AI: $SERVICE_URL/api/ai/lifestring-chat"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your frontend VITE_BACKEND_URL to: $SERVICE_URL"
echo "   2. Test the authenticated endpoint with a valid JWT token"
echo "   3. Check Cloud Run logs if there are any issues:"
echo "      gcloud logs read --service=$SERVICE_NAME --region=$REGION"
echo ""
echo "✨ Deployment complete!"
