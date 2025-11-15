#!/bin/bash

# Improved Lifestring API Deployment Script for Google Cloud Run
# Includes all necessary environment variables and error handling

set -e

echo "🚀 Deploying Improved Lifestring API to Google Cloud Run"
echo "======================================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Please set PROJECT_ID environment variable"
    echo "   export PROJECT_ID=your-gcp-project-id"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Please set OPENAI_API_KEY environment variable"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set - will use Supabase REST API fallback"
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_JWT_SECRET" ]; then
    echo "❌ Please set Supabase environment variables:"
    echo "   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"
echo "🔑 OpenAI API Key: ${OPENAI_API_KEY:0:10}..."
echo "🗄️  Database URL: ${DATABASE_URL:0:20}..."
echo "🔗 Supabase URL: $SUPABASE_URL"
echo ""

# Set project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Build and push image
echo "🐳 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/lifestring-api .

# Prepare environment variables
ENV_VARS="APP_ENV=production"
ENV_VARS="$ENV_VARS,DEBUG=False"
ENV_VARS="$ENV_VARS,OPENAI_API_KEY=$OPENAI_API_KEY"
ENV_VARS="$ENV_VARS,SUPABASE_URL=$SUPABASE_URL"
ENV_VARS="$ENV_VARS,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
ENV_VARS="$ENV_VARS,SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET"

# Add database URL if provided
if [ ! -z "$DATABASE_URL" ]; then
    ENV_VARS="$ENV_VARS,DATABASE_URL=$DATABASE_URL"
fi

# Add API keys for real-time data (optional)
if [ ! -z "$OPENWEATHER_API_KEY" ]; then
    ENV_VARS="$ENV_VARS,OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY"
fi

if [ ! -z "$NEWSAPI_KEY" ]; then
    ENV_VARS="$ENV_VARS,NEWSAPI_KEY=$NEWSAPI_KEY"
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run with environment variables..."
gcloud run deploy lifestring-api \
  --image gcr.io/$PROJECT_ID/lifestring-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "$ENV_VARS"

# Get service URL
SERVICE_URL=$(gcloud run services describe lifestring-api --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📚 API Docs: $SERVICE_URL/docs"
echo "❤️  Health Check: $SERVICE_URL/up"
echo "🤖 AI Chat Demo: $SERVICE_URL/demo"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
echo "Testing health check..."
if curl -s "$SERVICE_URL/up" | grep -q "ok"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

echo "Testing AI chat..."
if curl -s -X POST "$SERVICE_URL/api/ai/public-chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello", "user_name": "Test"}' | grep -q "message"; then
    echo "✅ AI chat endpoint working"
else
    echo "❌ AI chat endpoint failed"
fi

echo ""
echo "🔑 Next steps:"
echo "   1. Update your frontend to use: $SERVICE_URL"
echo "   2. Test the AI chat functionality"
echo "   3. Fix database credentials if needed"
echo ""
echo "💡 To update environment variables later:"
echo "   gcloud run services update lifestring-api --region us-central1 --set-env-vars \"NEW_VAR=value\""
echo ""
echo "🔍 To view logs:"
echo "   gcloud logs tail --follow --resource-type cloud_run_revision --resource-labels service_name=lifestring-api"
