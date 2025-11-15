#!/bin/bash

# Minimal deployment script using the minimal Dockerfile
set -e

echo "🚀 Minimal Cloud Run Deployment..."

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
if [ ! -f "Dockerfile.minimal" ]; then
    echo "❌ Error: Dockerfile.minimal not found"
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

# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Copy necessary files to temp directory
cp -r app "$TEMP_DIR/"
cp requirements.txt "$TEMP_DIR/"
cp Dockerfile.minimal "$TEMP_DIR/Dockerfile"

# Change to temp directory
cd "$TEMP_DIR"

echo "🚀 Deploying to Cloud Run using minimal configuration..."

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
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Service URL: $SERVICE_URL"

# Clean up temp directory
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Test the deployment
echo ""
echo "🧪 Testing deployment..."
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - trying root endpoint..."
    ROOT_RESPONSE=$(curl -s "$SERVICE_URL/" || echo "FAILED")
    echo "Root response: $ROOT_RESPONSE"
fi

echo ""
echo "📋 Deployment Summary:"
echo "   Service URL: $SERVICE_URL"
echo "   Health: $SERVICE_URL/health"
echo "   Public AI: $SERVICE_URL/api/ai/public-chat"
echo ""
echo "✨ Deployment complete!"
