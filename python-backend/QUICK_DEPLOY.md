# 🚀 QUICK DEPLOY - Lifestring Backend

## Option 1: Railway.app (RECOMMENDED - 2 minutes)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click**: "Deploy from GitHub repo"
4. **Select**: This repository (`lifestring`)
5. **Set Root Directory**: `python-backend`
6. **Add Environment Variables**:
   ```
   ENVIRONMENT=production
   OPENAI_API_KEY=your-openai-key-here
   SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA
   ```
7. **Deploy** - Your API will be at: `https://your-app-name.up.railway.app`

## Option 2: Render.com (5 minutes)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **New Web Service** → Connect GitHub → Select repo
4. **Settings**:
   - Root Directory: `python-backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add same environment variables as above**
6. **Deploy** - Your API will be at: `https://your-app-name.onrender.com`

## Option 3: Heroku (10 minutes)

1. Install Heroku CLI
2. `heroku create lifestring-api`
3. `heroku config:set OPENAI_API_KEY=your-key`
4. `heroku config:set SUPABASE_URL=https://bkaiuwzwepdxdwhznwbt.supabase.co`
5. `heroku config:set SUPABASE_ANON_KEY=eyJ...`
6. `git push heroku main`

## ✅ Files Ready:
- railway.json ✅
- render.yaml ✅  
- Dockerfile ✅
- requirements.txt ✅

**Just need your OpenAI API key to complete!**

## 🔄 After Backend Deploys:
1. Update frontend/.env.production with new backend URL
2. Redeploy frontend: `cd frontend/life-string-main && ./deploy-frontend.sh`
3. Test at https://lifestring.ai

**FASTEST: Use Railway.app - takes 2 minutes!**
