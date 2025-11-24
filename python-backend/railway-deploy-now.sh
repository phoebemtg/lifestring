#!/bin/bash

echo "🚀 Deploying Lifestring Backend to Railway..."
echo "=============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "🆕 Creating new Railway project..."
railway init

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set ENVIRONMENT=production
railway variables set SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA

# Prompt for OpenAI API key
echo "🔑 Please enter your OpenAI API key:"
read -s OPENAI_KEY
railway variables set OPENAI_API_KEY=$OPENAI_KEY

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at the Railway URL shown above"
echo "📝 Copy the URL and update frontend/.env.production"
