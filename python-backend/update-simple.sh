#!/bin/bash

# Update the existing lifestring-api-simple service with our improved code
set -e

echo "🚀 Updating lifestring-api-simple with improved code..."

# Set project and service details
PROJECT_ID="lifestring-473816"
SERVICE_NAME="lifestring-api-simple"
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

echo "🚀 Updating Cloud Run service with improved code..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 100 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "ENVIRONMENT=production,PORT=8080,OPENAI_API_KEY=sk-placeholder,DATABASE_URL=postgresql://placeholder,SUPABASE_URL=https://placeholder.supabase.co,SUPABASE_ANON_KEY=placeholder,SUPABASE_SERVICE_ROLE_KEY=placeholder" \
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
sleep 15

# Test root endpoint
echo "Testing root endpoint..."
ROOT_RESPONSE=$(curl -s "$SERVICE_URL/" || echo "FAILED")
echo "Root response: $ROOT_RESPONSE"

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
echo "   Root: $SERVICE_URL/"
echo "   Public AI: $SERVICE_URL/api/ai/public-chat"
echo "   Auth AI: $SERVICE_URL/api/ai/lifestring-chat"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your frontend VITE_BACKEND_URL to: $SERVICE_URL"
echo "   2. Set proper environment variables in Cloud Run console"
echo "   3. Test the authenticated endpoint with a valid JWT token"
echo ""
echo "✨ Update complete!"
