#!/bin/bash

# Railway Deployment Script for Lifestring Backend
# This script deploys the FastAPI backend to Railway

set -e  # Exit on any error

echo "🚀 Starting Lifestring Backend Deployment to Railway..."
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project if needed
if [ ! -f "railway.json" ]; then
    echo "🆕 Creating new Railway project..."
    railway init
fi

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set ENVIRONMENT=production
railway variables set PORT=8080
railway variables set OPENAI_API_KEY=placeholder
railway variables set SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9oy-improved.sh

# Deploy to Railway
echo "🌐 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "✅ Your backend is now live on Railway"
    
    # Get the deployment URL
    RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')
    echo "🔗 Backend URL: $RAILWAY_URL"
    
    echo ""
    echo "🔍 Next steps:"
    echo "   1. Update frontend .env.production with new backend URL"
    echo "   2. Deploy frontend to Vercel"
    echo "   3. Test the full application"
else
    echo "❌ Deployment failed!"
    exit 1
fi
