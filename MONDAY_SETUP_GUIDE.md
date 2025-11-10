# Monday Setup Guide - Lifestring Project
**Date:** September 30, 2025  
**For:** Phoebe's Monday exploration day

---

## 🎯 Goals for Monday

1. ✅ Understand the current codebase
2. ✅ Set up local development environment
3. ✅ Test existing API endpoints
4. ✅ Research frontend hosting options
5. ✅ Prepare questions for Tuesday's meeting

---

## 📋 Checklist

### **Morning (9 AM - 12 PM): Local Setup**

#### 1. Prerequisites Check
```bash
# Check PHP version (need 8.2+)
php --version

# Check Composer
composer --version

# Check Node.js (need 18+)
node --version

# Check PostgreSQL client
psql --version
```

If missing, install:
- **PHP 8.2+**: `brew install php@8.2` (macOS)
- **Composer**: https://getcomposer.org/download/
- **Node.js**: `brew install node` (macOS)

#### 2. Clone & Setup Backend
```bash
# Navigate to project
cd /Users/ptroupgalligan/Downloads/lifestring

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 3. Configure Environment
Edit `.env` file with credentials from Christian:

```env
APP_NAME=Lifestring
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Supabase)
DB_CONNECTION=pgsql
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<GET_FROM_CHRISTIAN>

# Supabase JWT Secret
SUPABASE_JWT_SECRET=<GET_FROM_CHRISTIAN>

# OpenAI
OPENAI_API_KEY=<GET_FROM_CHRISTIAN>
EMBED_MODEL=text-embedding-3-small

# AI Bot User ID (create this later)
AI_BOT_USER_ID=ai-assistant-uuid
```

#### 4. Test Database Connection
```bash
# Test connection
php artisan tinker

# In tinker:
DB::connection()->getPdo();
# Should not throw error

# Check tables
DB::select('SELECT * FROM user_profiles LIMIT 1');

exit
```

#### 5. Start Development Server
```bash
# Option 1: Simple
php artisan serve
# Server: http://localhost:8000

# Option 2: With queue and Vite (recommended)
composer dev
# This runs: server + queue + vite concurrently
```

#### 6. Test API
```bash
# Health check
curl http://localhost:8000/up

# Should return: {"status":"ok"}
```

---

### **Late Morning (11 AM - 12 PM): API Testing**

#### 1. Install Postman or use curl

#### 2. Test Endpoints

**Note:** You'll need a valid Supabase JWT token. Get this from Christian or create a test user.

```bash
# Set token variable
TOKEN="your-supabase-jwt-token"

# Test: Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/me

# Test: Get strings
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/strings

# Test: Get rooms
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/rooms

# Test: Get my rooms
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/my/rooms
```

#### 3. Create Postman Collection

Save these requests in Postman for easy testing:

1. **Auth**
   - GET `/api/me`

2. **Users**
   - GET `/api/users`
   - GET `/api/users/{id}`

3. **Strings**
   - GET `/api/strings`
   - POST `/api/strings`
   - GET `/api/my/strings`

4. **Chat**
   - GET `/api/rooms`
   - POST `/api/rooms`
   - GET `/api/rooms/{id}/messages`
   - POST `/api/rooms/{id}/messages`

---

### **Lunch Break (12 PM - 1 PM)**

---

### **Afternoon (1 PM - 3 PM): Frontend Hosting Research**

#### 1. Vercel Exploration (45 min)

**Setup:**
```bash
# Create test React app
npx create-react-app vercel-test
cd vercel-test

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, connect GitHub
```

**Test:**
- Deploy the app
- Check deployment speed
- Test environment variables
- Check analytics dashboard
- Test preview deployments (create a branch, push)

**Document:**
- Deployment time
- Ease of use (1-10)
- Features available
- Pricing for expected traffic

#### 2. Netlify Exploration (30 min)

**Setup:**
```bash
# Use same test app
cd vercel-test

# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Follow prompts
```

**Compare:**
- Deployment speed vs Vercel
- UI/UX of dashboard
- Features
- Pricing

#### 3. GCP Cloud Run Exploration (45 min)

**Setup:**
```bash
# Create Dockerfile for React app
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build and deploy (if you have GCP access)
gcloud run deploy vercel-test \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Document:**
- Setup complexity
- Deployment time
- Cost estimate
- Integration with backend

#### 4. Create Comparison Document

Create a simple table:

| Feature | Vercel | Netlify | GCP Cloud Run |
|---------|--------|---------|---------------|
| Setup Time | | | |
| Deployment Speed | | | |
| Ease of Use (1-10) | | | |
| Auto-scaling | | | |
| Preview Deploys | | | |
| Analytics | | | |
| Est. Monthly Cost | | | |
| **Recommendation** | | | |

---

### **Late Afternoon (3 PM - 5 PM): Codebase Deep Dive**

#### 1. Understand Models

```bash
# Open in your editor
code app/Models/

# Review these files:
# - User.php
# - Strings.php
# - Room.php
# - Message.php
# - StringEmbeds.php
# - UserEmbeds.php
```

**Questions to answer:**
- How are user embeddings generated?
- How are string recommendations calculated?
- What's the relationship between rooms and messages?
- How does the polymorphic relationship work for strings?

#### 2. Understand Controllers

```bash
# Review controllers
code app/Http/Controllers/

# Focus on:
# - UserController.php (especially createEmbed method)
# - StringsController.php (especially getRecommendedStrings)
# - RoomController.php
# - MessageController.php
```

**Questions to answer:**
- How is OpenAI currently being used?
- What's the flow for creating embeddings?
- How are recommendations generated?
- Can we reuse any of this for AI chat?

#### 3. Understand Database Schema

```bash
# Open schema file
code db_files/schema.sql

# Or explore via database
php artisan tinker

# In tinker:
Schema::getColumnListing('user_profiles');
Schema::getColumnListing('rooms');
Schema::getColumnListing('messages');
Schema::getColumnListing('string_embeddings');
```

**Create a diagram:**
- Draw relationships between tables
- Identify key fields
- Note JSONB fields and their structure

#### 4. Test Existing AI Features

```bash
# In tinker
php artisan tinker

# Test embedding generation
$user = User::first();
$controller = new \App\Http\Controllers\UserController();
$result = $controller->createEmbed($user);
print_r($result);

# Check if embedding was created
$embedding = \App\Models\UserEmbeds::where('user_id', $user->user_id)->first();
echo "Embedding dimensions: " . count($embedding->embedding);
```

---

### **End of Day (5 PM): Prepare for Tuesday**

#### 1. Document Findings

Create a file `MONDAY_FINDINGS.md`:

```markdown
# Monday Exploration Findings

## ✅ Completed
- [ ] Local environment setup
- [ ] API testing
- [ ] Frontend hosting research
- [ ] Codebase review

## 🔍 Key Discoveries

### Backend Architecture
- [Your notes here]

### Existing AI Features
- [Your notes here]

### Frontend Hosting
- **Recommendation:** [Vercel/Netlify/GCP]
- **Reasoning:** [Why]

## ❓ Questions for Christian

1. Frontend codebase access?
2. Supabase credentials?
3. OpenAI API key?
4. Current user base/traffic?
5. Design mockups for AI chat?
6. Budget for infrastructure?
7. Priority: AI chat or mobile app first?

## 💡 Initial Ideas for AI Chat

- [Your ideas based on codebase review]

## 🚧 Potential Challenges

- [Any concerns or blockers you identified]

## 📅 Proposed Timeline for Week 1

- Tuesday: [Tasks]
- Wednesday: [Tasks]
- Thursday: [Tasks]
- Friday: [Tasks]
```

#### 2. Prepare Demo/Mockup

If time permits, create a simple mockup of the AI chat UI:
- Use Figma (free)
- Or create a simple HTML mockup
- Show how it would integrate with existing chat

#### 3. Review Documents

Read through:
- `LIFESTRING_PROJECT_PLAN.md`
- `AI_CHAT_TECHNICAL_SPEC.md`

Make notes on:
- Anything unclear
- Questions to ask
- Suggestions for improvement

---

## 🆘 Troubleshooting

### Issue: Composer install fails

```bash
# Update Composer
composer self-update

# Clear cache
composer clear-cache

# Try again
composer install --no-scripts
composer install
```

### Issue: Database connection fails

```bash
# Check .env file
cat .env | grep DB_

# Test connection manually
psql -h db.xxx.supabase.co -U postgres -d postgres

# If it works, issue is with Laravel config
php artisan config:clear
php artisan cache:clear
```

### Issue: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Issue: Port 8000 already in use

```bash
# Find process using port 8000
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)

# Or use different port
php artisan serve --port=8001
```

---

## 📚 Resources

### Laravel Documentation
- https://laravel.com/docs/12.x

### OpenAI API
- https://platform.openai.com/docs/api-reference

### Supabase
- https://supabase.com/docs

### Vercel
- https://vercel.com/docs

### React Native + Expo
- https://docs.expo.dev/

---

## 📞 Contact

If you get stuck:
1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check error messages carefully
3. Google the error
4. Ask Christian for credentials/access
5. Document the issue for Tuesday's meeting

---

## ✅ End of Day Checklist

- [ ] Local environment running
- [ ] Can access API endpoints
- [ ] Tested at least 3 endpoints
- [ ] Compared 2+ hosting options
- [ ] Reviewed key models and controllers
- [ ] Created findings document
- [ ] Prepared questions for Tuesday
- [ ] Committed any test code to a branch
- [ ] Documented any issues encountered

---

**Good luck! You've got this! 🚀**

Remember: The goal is to **understand** the codebase, not to build everything on day 1. Take notes, ask questions, and prepare for a productive Tuesday kickoff!

