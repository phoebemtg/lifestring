#!/bin/bash

# Render.com Deployment Script for Lifestring Backend
# This script sets up deployment to Render.com

set -e  # Exit on any error

echo "🚀 Starting Lifestring Backend Deployment to Render.com..."
echo "================================================"

# Create render.yaml for deployment configuration
cat > render.yaml << 'EOF'
services:
  - type: web
    name: lifestring-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: OPENAI_API_KEY
        value: placeholder
      - key: SUPABASE_URL
        value: https://bkaiuwzwepdxdwhznwbt.supabase.co
      - key: SUPABASE_ANON_KEY
        value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA
EOF

echo "✅ Created render.yaml configuration"

# Create a simple Dockerfile for better deployment
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
EOF

echo "✅ Created Dockerfile"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

echo ""
echo "🎉 Deployment files created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to https://render.com and create a new account"
echo "   2. Connect your GitHub repository"
echo "   3. Create a new Web Service"
echo "   4. Select this repository"
echo "   5. Render will automatically detect the render.yaml and deploy"
echo ""
echo "🔗 Your backend will be available at: https://lifestring-api.onrender.com"
echo ""
echo "🔧 After deployment, update the frontend .env.production:"
echo "   VITE_BACKEND_URL=https://lifestring-api.onrender.com"
echo ""
echo "⚠️  Remember to update the OPENAI_API_KEY in Render dashboard with your real API key!"
