#!/bin/bash

# Set environment variables for Lifestring API on Cloud Run
# Run this after getting credentials from Christian

set -e

echo "🔑 Setting environment variables for Lifestring API"
echo "=================================================="

# Interactive credential collection
echo "Please enter the credentials from Christian:"
echo ""

read -p "Supabase Database URL (postgresql://...): " DATABASE_URL
read -p "Supabase JWT Secret: " SUPABASE_JWT_SECRET
read -p "Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "OpenAI API Key (sk-...): " OPENAI_API_KEY

echo ""

# Validate inputs
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

if [ -z "$SUPABASE_JWT_SECRET" ]; then
    echo "❌ SUPABASE_JWT_SECRET is required"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is required"
    exit 1
fi

echo "🔧 Updating Cloud Run service with environment variables..."

gcloud run services update lifestring-api \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=$DATABASE_URL" \
  --set-env-vars "SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET" \
  --set-env-vars "SUPABASE_URL=$SUPABASE_URL" \
  --set-env-vars "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" \
  --set-env-vars "OPENAI_API_KEY=$OPENAI_API_KEY" \
  --set-env-vars "SECRET_KEY=$(openssl rand -hex 32)"

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "🧪 Testing the API..."

# Get service URL
SERVICE_URL=$(gcloud run services describe lifestring-api --region us-central1 --format 'value(status.url)')

# Test health check
echo "Testing health check..."
curl -s "$SERVICE_URL/up" | jq .

echo ""
echo "🎉 API is ready!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📚 API Docs: $SERVICE_URL/docs"
