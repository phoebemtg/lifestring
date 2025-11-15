#!/bin/bash

# Simple deployment script for Lifestring backend
set -e

echo "🚀 Simple Lifestring Backend Deployment..."

# Set project and service details
PROJECT_ID="lifestring-473816"
SERVICE_NAME="lifestring-api"
REGION="us-central1"

echo "📋 Project: $PROJECT_ID"
echo "📋 Service: $SERVICE_NAME"
echo "📋 Region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

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

# Build the container image
echo "🔨 Building container image..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build with Cloud Build
gcloud builds submit --tag $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Container build failed"
    exit 1
fi

echo "✅ Container built successfully"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
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

# Test health endpoint
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - service might still be starting up"
fi

# Test public AI endpoint
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
echo "   Health: $SERVICE_URL/health"
echo "   Public AI: $SERVICE_URL/api/ai/public-chat"
echo "   Auth AI: $SERVICE_URL/api/ai/lifestring-chat"
echo ""
echo "✨ Deployment complete!"
