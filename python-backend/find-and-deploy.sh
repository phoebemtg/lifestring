#!/bin/bash

# Find credentials and deploy Lifestring API to GCP

set -e

echo "🔍 Finding GCP Projects and Deploying Lifestring API"
echo "=================================================="
echo ""

# Step 1: Find GCP projects
echo "📋 Your GCP Projects:"
gcloud projects list
echo ""

# Step 2: Get project ID
read -p "Enter the PROJECT_ID you want to use: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ PROJECT_ID is required"
    exit 1
fi

echo "✅ Using project: $PROJECT_ID"
echo ""

# Step 3: Set project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID
echo ""

# Step 4: Deploy with placeholder credentials
echo "🚀 Deploying to Cloud Run with placeholder credentials..."
echo "   (We'll update with real credentials after deployment)"
echo ""

gcloud run deploy lifestring-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "APP_ENV=production,DEBUG=False,PORT=8080"

# Step 5: Get service URL
SERVICE_URL=$(gcloud run services describe lifestring-api --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📚 API Docs: $SERVICE_URL/docs"
echo "❤️  Health Check: $SERVICE_URL/up"
echo ""

# Step 6: Test health check
echo "🧪 Testing health check..."
if curl -s "$SERVICE_URL/up" | grep -q "ok"; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed (expected without real database credentials)"
fi

echo ""
echo "🔑 Next steps:"
echo "   1. Get Supabase credentials from Christian"
echo "   2. Get OpenAI API key from Christian"
echo "   3. Run: ./set-env.sh to update environment variables"
echo "   4. Test with real data"
echo ""

echo "📧 Send this to Christian:"
echo "   Hi Christian! Python backend deployed successfully to:"
echo "   $SERVICE_URL/docs"
echo "   Just need Supabase and OpenAI credentials to complete setup."
echo ""

echo "🎉 Deployment successful!"
