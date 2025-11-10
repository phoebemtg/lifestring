# ⚡ Lifestring Python Backend - Quick Start

## 🚀 Get Running in 5 Minutes

### Step 1: Navigate to Directory
```bash
cd python-backend
```

### Step 2: Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### Step 3: Configure Environment
```bash
nano .env
```

Add these required values:
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=sk-your-key-here
AI_BOT_USER_ID=00000000-0000-0000-0000-000000000000
```

### Step 4: Run the App
```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

### Step 5: Test It
Open browser: http://localhost:8000/docs

---

## 🐳 Even Faster with Docker

```bash
cd python-backend
docker-compose up -d
```

Done! API at http://localhost:8000

---

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:8000/up
```

### 2. Get Users (with auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/users
```

### 3. Create AI Chat
```bash
curl -X POST http://localhost:8000/api/ai/chat \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello!"}'
```

---

## 📚 API Documentation

Interactive docs: http://localhost:8000/docs

All endpoints:
- `/api/users` - User management
- `/api/strings` - Posts/content
- `/api/rooms` - Chat rooms
- `/api/messages` - Chat messages
- `/api/events` - Events
- `/api/ai/chat` - AI chat (NEW!)

---

## 🆘 Need Help?

### Common Issues

**"Module not found"**
```bash
pip install -r requirements.txt
```

**"Can't connect to database"**
- Check DATABASE_URL in .env
- Make sure Supabase is accessible

**"Invalid token"**
- Check SUPABASE_JWT_SECRET in .env
- Get token from Supabase auth

---

## 📞 Support

Questions? Check:
1. `README.md` - Full documentation
2. `PYTHON_CONVERSION_COMPLETE.md` - Conversion details
3. http://localhost:8000/docs - API reference

---

**That's it! You're ready to go! 🎉**

