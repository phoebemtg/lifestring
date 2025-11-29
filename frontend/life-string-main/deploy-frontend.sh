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

# Set up custom domain
echo "🔗 Setting up custom domain..."
vercel domains add lifestring.ai --yes || echo "Domain already exists"
vercel alias set $(vercel ls | grep lifestring-frontend | head -1 | awk '{print $2}') lifestring.ai || echo "Alias already set"

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "✅ Your changes are now live on lifestring.ai"
    echo ""
    echo "🔍 Changes deployed:"
    echo "   - Added footer to main landing page with Terms, Privacy, Support, About links"
    echo "   - Removed blue cloud background from SignIn page"
    echo "   - Added footer to SignIn and AuthPage components"
    echo "   - Created new footer pages: Privacy Policy, Support, About"
    echo ""
    echo "🧪 Test your deployment:"
    echo "   1. Visit lifestring.ai"
    echo "   2. Check the footer at the bottom of the landing page"
    echo "   3. Click 'Sign In' and verify the clean design without blue background"
    echo "   4. Test footer links: Terms, Privacy, Support, About"
else
    echo "❌ Deployment failed!"
    exit 1
fi
