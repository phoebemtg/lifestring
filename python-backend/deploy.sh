#!/bin/bash

# Lifestring API Deployment Script for Google Cloud Run

set -e

echo "🚀 Deploying Lifestring API to Google Cloud Run"
echo "=============================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Please set PROJECT_ID environment variable"
    echo "   export PROJECT_ID=your-gcp-project-id"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"
echo ""

# Set project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Build and push image
echo "🐳 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/lifestring-api .

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy lifestring-api \
  --image gcr.io/$PROJECT_ID/lifestring-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "APP_ENV=production,DEBUG=False,OPENAI_API_KEY=$OPENAI_API_KEY"

# Get service URL
SERVICE_URL=$(gcloud run services describe lifestring-api --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📚 API Docs: $SERVICE_URL/docs"
echo "❤️  Health Check: $SERVICE_URL/up"
echo ""
echo "🔑 Next steps:"
echo "   1. Set environment variables with real credentials"
echo "   2. Test the API endpoints"
echo "   3. Update frontend to use this URL"
echo ""
echo "💡 To set environment variables:"
echo "   gcloud run services update lifestring-api --region us-central1 --set-env-vars \"DATABASE_URL=...,SUPABASE_JWT_SECRET=...\""
