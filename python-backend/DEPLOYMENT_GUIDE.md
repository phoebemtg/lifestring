# Lifestring API Deployment Guide

## Quick Start

1. **Setup environment variables:**
   ```bash
   ./setup-deployment.sh
   ```

2. **Deploy to Google Cloud Run:**
   ```bash
   ./deploy-improved.sh
   ```

## Prerequisites

- Google Cloud CLI installed and authenticated
- Docker (for local testing)
- All required environment variables set

## Environment Variables

### Required Variables
```bash
export PROJECT_ID="your-gcp-project-id"
export OPENAI_API_KEY="sk-proj-..."
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
export SUPABASE_JWT_SECRET="eyJhbGciOiJIUzI1NiIs..."
```

### Optional Variables
```bash
export DATABASE_URL="postgresql://postgres.your-project:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
export OPENWEATHER_API_KEY="your-weather-api-key"
export NEWSAPI_KEY="your-news-api-key"
```

## Database Connection

The API now supports **graceful database fallback**:

- ✅ **Primary**: Direct PostgreSQL connection for full features
- ✅ **Fallback**: Supabase REST API for core functionality
- ✅ **Error Handling**: Graceful degradation when database is unavailable

### If Database Connection Fails

1. **Check Supabase Dashboard:**
   - Go to Settings → Database
   - Copy the correct connection string
   - Update your `DATABASE_URL`

2. **The API will still work** using Supabase REST API fallback
   - User authentication works
   - Profile data loading works
   - AI chat functionality works
   - Only conversation history storage is limited

## Deployment Steps

### 1. Test Locally
```bash
# Test database connection
python3 test_db_connection.py

# Start local server
python3 -m uvicorn app.main:app --reload
```

### 2. Setup Deployment
```bash
# Run setup script
./setup-deployment.sh

# This will:
# - Check Google Cloud CLI
# - Validate environment variables
# - Test database connection
# - Prepare for deployment
```

### 3. Deploy
```bash
# Deploy with improved script
./deploy-improved.sh

# This will:
# - Build Docker image
# - Deploy to Cloud Run
# - Set all environment variables
# - Test the deployment
# - Provide service URL
```

## Post-Deployment

### 1. Test the API
```bash
# Health check
curl https://your-service-url/up

# AI chat test
curl -X POST "https://your-service-url/api/ai/public-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user_name": "Test"}'
```

### 2. Update Frontend
Update your frontend to use the new service URL:
```javascript
const API_BASE = "https://your-service-url";
```

### 3. Monitor Logs
```bash
gcloud logs tail --follow \
  --resource-type cloud_run_revision \
  --resource-labels service_name=lifestring-api
```

## Troubleshooting

### Database Issues
- ✅ **API still works** with REST API fallback
- Check Supabase dashboard for correct credentials
- Verify connection string format

### Authentication Issues
- Check JWT secret matches Supabase
- Verify CORS origins include your frontend URL

### API Errors
- Check logs: `gcloud logs tail --follow`
- Test individual endpoints
- Verify environment variables are set

## Features Included

✅ **LLM Improvements:**
- GPT-4o and GPT-4o-mini integration
- Anti-hallucination rules
- Real-time data integration (sports, weather, news)
- Conversation memory system

✅ **Error Handling:**
- Database connection fallback
- Graceful error responses
- Comprehensive logging

✅ **Production Ready:**
- Docker containerization
- Cloud Run deployment
- Environment variable management
- Health checks and monitoring
