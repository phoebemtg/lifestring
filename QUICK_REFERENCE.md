# Lifestring Quick Reference Guide

**Last Updated:** September 30, 2025

---

## 🎯 Project Overview

**Lifestring** is a social networking platform with AI-powered features for connecting people based on interests, passions, and personality types.

**Timeline:** 4 weeks (Oct 1-31, 2025)  
**Goal:** Launch AI chat feature + mobile app

---

## 🏗️ Current Tech Stack

### **Backend**
- **Framework:** Laravel 12 (PHP 8.2+)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase JWT
- **AI:** OpenAI API (embeddings + chat)
- **Vector DB:** pgvector extension

### **Frontend** (TBD - waiting for Christian)
- Likely React-based (mentioned Lovable)
- TypeScript
- Tailwind CSS
- React Query
- Supabase client

### **Infrastructure**
- **Current:** Supabase (DB + Auth + Storage)
- **Target:** GCP (Cloud Run + Cloud SQL + Cloud Storage)

---

## 📊 Database Schema (Key Tables)

```
user_profiles
├── user_id (UUID, PK)
├── contact_info (JSONB)
├── social_links (JSONB)
├── attributes (JSONB) - passions, hobbies, interests
├── biography (JSONB)
└── is_admin, is_mod (BOOLEAN)

strings (posts/content)
├── id (UUID, PK)
├── user_id (UUID, FK)
├── content_text (TEXT)
├── content_images (JSONB)
├── likes_count, comments_count (INT)
└── timestamps

rooms (chat rooms)
├── id (UUID, PK)
├── name (TEXT)
├── metadata (JSONB) ← Use this for AI chat config!
└── timestamps

messages
├── id (UUID, PK)
├── room_id (UUID, FK)
├── user_id (UUID, FK)
├── content (TEXT)
└── timestamps

user_embeddings (AI)
├── id (BIGINT, PK)
├── user_id (UUID, FK)
├── embedding (VECTOR(1536))
├── content_hash (TEXT)
└── model_version (TEXT)

string_embeddings (AI)
├── id (BIGINT, PK)
├── string_id (UUID, FK)
├── embedding (VECTOR(1536))
└── timestamps
```

---

## 🔌 Existing API Endpoints

### **Authentication**
```
GET  /api/me                    # Get current user
```

### **Users**
```
GET    /api/users               # List users
GET    /api/users/{id}          # Get user
POST   /api/users               # Create user
PUT    /api/users/{id}          # Update user
DELETE /api/users/{id}          # Delete user
POST   /api/users/{id}/embed/create  # Generate AI embedding
```

### **Strings (Posts)**
```
GET    /api/strings             # List strings
POST   /api/strings             # Create string
GET    /api/my/strings          # My strings
GET    /api/my/liked-strings    # Strings I liked
POST   /api/strings/{id}/like   # Toggle like
GET    /api/recommended/strings # AI recommendations
```

### **Chat (Existing!)**
```
GET    /api/rooms               # List rooms
POST   /api/rooms               # Create room
GET    /api/my/rooms            # My rooms
GET    /api/rooms/{id}/messages # Get messages
POST   /api/rooms/{id}/messages # Send message
POST   /api/rooms/{id}/participants  # Add participant
```

### **Events**
```
GET    /api/events              # List events
POST   /api/events              # Create event
GET    /api/my/events           # My events
```

---

## 🤖 AI Chat Implementation Plan

### **Approach: Extend Existing Rooms**

1. **Create AI bot user** in `user_profiles`
2. **Use `rooms.metadata`** to mark AI chat rooms:
   ```json
   {
     "type": "ai_chat",
     "model": "gpt-4o-mini",
     "context_enabled": true
   }
   ```
3. **New endpoints:**
   ```
   POST   /api/ai/chat                  # Create AI chat
   POST   /api/ai/chat/{room}/message   # Send to AI
   POST   /api/ai/chat/{room}/stream    # Stream response
   GET    /api/ai/chat/{room}/history   # Get history
   DELETE /api/ai/chat/{room}           # Delete chat
   ```

### **Files to Create**
```
app/Http/Controllers/AIChatController.php
app/Services/OpenAIService.php
app/Services/AIContextBuilder.php
app/Services/RAGService.php (optional)
config/ai.php
```

### **Cost Estimate**
- **Model:** GPT-4o-mini
- **Cost per 1K tokens:** ~$0.0004
- **Average conversation:** ~3K tokens = $0.0011
- **1,000 users, 10 chats/month:** ~$11/month

---

## 🌐 Frontend Hosting Options

| Option | Pros | Cons | Cost | Score |
|--------|------|------|------|-------|
| **Vercel** | Best DX, fast, auto-scaling | Vendor lock-in | $0-20/mo | ⭐⭐⭐⭐⭐ |
| **Netlify** | Good DX, easy setup | Slower | $0-19/mo | ⭐⭐⭐⭐ |
| **GCP Cloud Run** | Unified stack, flexible | More setup | $10-30/mo | ⭐⭐⭐⭐ |
| **Firebase Hosting** | Fast CDN, simple | Limited features | $0-25/mo | ⭐⭐⭐ |

**Recommendation:** Vercel (fastest to production)

---

## 📱 Mobile App Strategy

### **Recommended: React Native + Expo**

**Why?**
- ✅ Share code with web
- ✅ True native performance
- ✅ Access to native APIs
- ✅ Over-the-air updates
- ✅ Expo Go for testing

**Why NOT Median?**
- ❌ Just a WebView wrapper
- ❌ Poor performance
- ❌ Limited native features
- ❌ Bad UX

### **Alternative: PWA**
- Faster (1 week vs 2 weeks)
- No app store approval
- Works on all platforms
- **Limitation:** No push notifications on iOS

---

## 📅 4-Week Timeline

### **Week 1: AI Chat Backend**
- Set up dev environment
- Implement AI chat API
- Test with Postman
- Deploy to GCP staging

### **Week 2: Frontend Integration**
- Choose hosting (Vercel)
- Build AI chat UI
- Add streaming responses
- Deploy to production

### **Week 3: Mobile App**
- Set up React Native + Expo
- Build core screens
- Integrate AI chat
- Add push notifications

### **Week 4: Polish & Launch**
- UI/UX refinements
- Performance optimization
- Security audit
- Submit to app stores
- Production launch

---

## 🚀 Quick Start Commands

### **Backend**
```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Start server
php artisan serve
# or
composer dev  # Runs server + queue + vite

# Run tests
php artisan test
```

### **Database**
```bash
# Connect to Supabase
psql -h db.xxx.supabase.co -U postgres -d postgres

# Run migrations (if any)
php artisan migrate

# Seed data
php artisan db:seed
```

### **Testing API**
```bash
# Health check
curl http://localhost:8000/up

# With auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/me
```

---

## 🔑 Environment Variables Needed

```env
# App
APP_NAME=Lifestring
APP_ENV=local
APP_KEY=base64:...
APP_URL=http://localhost:8000

# Database (Supabase)
DB_CONNECTION=pgsql
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<ASK_CHRISTIAN>

# Supabase Auth
SUPABASE_JWT_SECRET=<ASK_CHRISTIAN>

# OpenAI
OPENAI_API_KEY=<ASK_CHRISTIAN>
EMBED_MODEL=text-embedding-3-small

# AI Bot
AI_BOT_USER_ID=<CREATE_AFTER_SETUP>
```

---

## 📞 Questions for Christian

### **Access & Credentials**
1. Frontend repository URL?
2. Supabase credentials (DB + JWT secret)?
3. OpenAI API key?
4. GCP project access?

### **Product**
5. Current user base/traffic?
6. Design mockups for AI chat?
7. Priority: AI chat or mobile app first?
8. Any specific AI features wanted?

### **Business**
9. Budget for infrastructure?
10. Timeline flexibility?
11. App store accounts (Apple/Google)?

---

## 🆘 Common Issues & Solutions

### **Database Connection Error**
```bash
php artisan config:clear
php artisan cache:clear
# Check .env DB credentials
```

### **Composer Install Fails**
```bash
composer clear-cache
composer install --no-scripts
composer install
```

### **Port Already in Use**
```bash
kill -9 $(lsof -ti:8000)
# or
php artisan serve --port=8001
```

### **OpenAI API Error**
```bash
# Check API key in .env
echo $OPENAI_API_KEY
# Test in tinker
php artisan tinker
OpenAI::chat()->create([...]);
```

---

## 📚 Useful Resources

- **Laravel Docs:** https://laravel.com/docs/12.x
- **OpenAI API:** https://platform.openai.com/docs
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Expo:** https://docs.expo.dev

---

## 🎯 Success Criteria

### **Week 1**
- [ ] AI chat API working
- [ ] Can send message and get response
- [ ] Deployed to GCP staging

### **Week 2**
- [ ] Frontend integrated
- [ ] Streaming responses working
- [ ] Deployed to production

### **Week 3**
- [ ] Mobile app running on test devices
- [ ] Core features working
- [ ] Push notifications set up

### **Week 4**
- [ ] Apps submitted to stores
- [ ] Production stable
- [ ] Documentation complete

---

## 💡 Pro Tips

1. **Start Simple:** Get basic AI chat working before adding RAG/functions
2. **Test Early:** Use Postman to test API before frontend integration
3. **Monitor Costs:** Set up OpenAI usage alerts
4. **Version Control:** Commit often, use feature branches
5. **Ask Questions:** Better to clarify than assume

---

**Good luck with the project! 🚀**

*This is a living document - update as you learn more!*

