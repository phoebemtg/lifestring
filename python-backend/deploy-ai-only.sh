#!/bin/bash

echo "🚀 Deploying AI-only Lifestring API..."
echo "📋 Project: lifestring-473816"
echo "📋 Service: lifestring-api-simple"
echo "📋 Region: us-central1"

# Set project
gcloud config set project lifestring-473816

# Check if required files exist
if [ ! -f "simple_main.py" ]; then
    echo "❌ simple_main.py not found"
    exit 1
fi

if [ ! -f "Dockerfile.ai-only" ]; then
    echo "❌ Dockerfile.ai-only not found"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

if [ ! -d "app" ]; then
    echo "❌ app directory not found"
    exit 1
fi

echo "✅ All required files found"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Copy files to temp directory
cp -r app "$TEMP_DIR/"
cp simple_main.py "$TEMP_DIR/"
cp Dockerfile.ai-only "$TEMP_DIR/Dockerfile"
cp requirements.txt "$TEMP_DIR/"

# Change to temp directory
cd "$TEMP_DIR"

echo "🚀 Deploying AI-only service..."

# Deploy to Cloud Run
gcloud run deploy lifestring-api-simple \
    --source=. \
    --region=us-central1 \
    --project=lifestring-473816 \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    --max-instances=10 \
    --port=8080

if [ $? -eq 0 ]; then
    echo "✅ AI-only deployment successful!"
    echo "🔗 Service URL: https://lifestring-api-simple-6946562411.us-central1.run.app"
    echo "🧪 Test endpoints:"
    echo "   - Health: https://lifestring-api-simple-6946562411.us-central1.run.app/up"
    echo "   - AI Chat: https://lifestring-api-simple-6946562411.us-central1.run.app/api/ai/lifestring-chat-public"
else
    echo "❌ Deployment failed"
    exit 1
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"
echo "🧹 Cleaned up temporary files"
