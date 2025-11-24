#!/bin/bash

# Heroku Deployment Script for Lifestring Backend
# This script deploys the FastAPI backend to Heroku

set -e  # Exit on any error

echo "🚀 Starting Lifestring Backend Deployment to Heroku..."
echo "================================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "📦 Installing Heroku CLI..."
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# Login to Heroku (if not already logged in)
echo "🔐 Logging into Heroku..."
heroku login

# Create Heroku app if it doesn't exist
APP_NAME="lifestring-api-backend"
if ! heroku apps:info $APP_NAME &> /dev/null; then
    echo "🆕 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "✅ Using existing Heroku app: $APP_NAME"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set ENVIRONMENT=production --app $APP_NAME
heroku config:set PORT=8080 --app $APP_NAME
heroku config:set OPENAI_API_KEY=placeholder --app $APP_NAME
heroku config:set SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co --app $APP_NAME
heroku config:set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9oy-improved.sh --app $APP_NAME

# Add git remote if it doesn't exist
if ! git remote get-url heroku &> /dev/null; then
    heroku git:remote -a $APP_NAME
fi

# Deploy to Heroku
echo "🌐 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
git push heroku main

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "✅ Your backend is now live on Heroku"
    
    # Get the deployment URL
    HEROKU_URL="https://$APP_NAME.herokuapp.com"
    echo "🔗 Backend URL: $HEROKU_URL"
    
    echo ""
    echo "🔍 Next steps:"
    echo "   1. Update frontend .env.production with new backend URL: $HEROKU_URL"
    echo "   2. Redeploy frontend to Vercel"
    echo "   3. Test the full application"
else
    echo "❌ Deployment failed!"
    exit 1
fi
