#!/bin/bash

# Frontend Deployment Script for Lifestring.ai
# This script builds and deploys the React frontend to Vercel

set -e  # Exit on any error

echo "🚀 Starting Lifestring Frontend Deployment..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "✅ Your changes are now live on lifestring.ai"
    echo ""
    echo "🔍 Changes deployed:"
    echo "   - Profile photos now appear in navigation sidebar"
    echo "   - Users will see their profile photo instead of Home icon"
    echo "   - Fallback to Home icon if no profile photo exists"
    echo ""
    echo "🧪 Test your deployment:"
    echo "   1. Visit lifestring.ai"
    echo "   2. Log in with an account that has a profile photo"
    echo "   3. Check the sidebar - you should see your profile photo"
else
    echo "❌ Deployment failed!"
    exit 1
fi
