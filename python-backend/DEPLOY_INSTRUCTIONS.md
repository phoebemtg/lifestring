# Deploy Lifestring Backend to Render.com

## Quick Deploy Steps:

1. **Go to Render.com and sign up/login**
   - Visit: https://render.com
   - Sign up with GitHub account

2. **Connect your GitHub repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select this repository: `lifestring`
   - Root directory: `python-backend`

3. **Configure the service:**
   - **Name**: `lifestring-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables:**
   ```
   ENVIRONMENT=production
   OPENAI_API_KEY=your-actual-openai-api-key-here
   SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your API will be available at: `https://lifestring-api.onrender.com`

## Alternative: Railway.app

If Render doesn't work, try Railway:
1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select this repo, set root directory to `python-backend`
5. Add the same environment variables
6. Deploy

## Files Ready:
- ✅ render.yaml (Render config)
- ✅ Dockerfile (Container config)  
- ✅ requirements.txt (Dependencies)
- ✅ All environment variables configured

**Need your OpenAI API key to complete deployment!**
