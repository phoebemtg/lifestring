# Lifestring Python Backend (FastAPI)

Complete Python/FastAPI conversion of the Lifestring Laravel backend.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL with pgvector extension (or use Supabase)
- Redis (optional, for background tasks)
- OpenAI API key

### Installation

1. **Clone and navigate to python-backend:**
```bash
cd python-backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. **Run the application:**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

---

## 🐳 Docker Setup (Recommended)

### Run with Docker Compose

```bash
# Start all services (API + PostgreSQL + Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

This will start:
- **API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 📁 Project Structure

```
python-backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependencies (auth, db)
│   │   └── v1/
│   │       ├── users.py         # User endpoints
│   │       ├── strings.py       # String/post endpoints
│   │       ├── rooms.py         # Room endpoints
│   │       ├── messages.py      # Message endpoints
│   │       ├── events.py        # Event endpoints
│   │       └── ai_chat.py       # AI chat endpoints
│   ├── core/
│   │   ├── config.py            # Settings
│   │   ├── database.py          # Database connection
│   │   └── security.py          # JWT verification
│   ├── models/
│   │   ├── user.py              # User models
│   │   ├── string.py            # String models
│   │   ├── room.py              # Room/Message models
│   │   ├── event.py             # Event model
│   │   └── enneagram.py         # Enneagram model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── string.py            # String schemas
│   │   ├── room.py              # Room/Message schemas
│   │   └── event.py             # Event schemas
│   ├── services/
│   │   └── openai_service.py    # OpenAI integration
│   └── main.py                  # FastAPI app
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔑 Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://xxx.supabase.co

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
EMBED_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini

# AI Bot
AI_BOT_USER_ID=00000000-0000-0000-0000-000000000000

# Security
SECRET_KEY=your-secret-key-for-jwt
```

---

## 📡 API Endpoints

### Authentication
All endpoints require Bearer token authentication (Supabase JWT).

### Users
- `GET /api/me` - Get current user
- `GET /api/users` - List users
- `GET /api/users/{user_id}` - Get user by ID
- `POST /api/users` - Create user (admin)
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user (admin)
- `POST /api/users/{user_id}/embed/create` - Generate user embedding

### Strings (Posts)
- `GET /api/strings` - List all strings
- `GET /api/my/strings` - Get my strings
- `GET /api/my/liked-strings` - Get liked strings
- `GET /api/strings/{string_id}` - Get string by ID
- `POST /api/strings` - Create string
- `PUT /api/strings/{string_id}` - Update string
- `DELETE /api/strings/{string_id}` - Delete string
- `POST /api/strings/{string_id}/like` - Toggle like

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/my/rooms` - Get my rooms
- `GET /api/rooms/{room_id}` - Get room by ID
- `POST /api/rooms` - Create room
- `PUT /api/rooms/{room_id}` - Update room
- `DELETE /api/rooms/{room_id}` - Delete room

### Messages
- `GET /api/rooms/{room_id}/messages` - Get room messages
- `POST /api/rooms/{room_id}/messages` - Send message
- `DELETE /api/messages/{message_id}` - Delete message

### Events
- `GET /api/events` - List all events
- `GET /api/my/events` - Get my events
- `GET /api/events/{event_id}` - Get event by ID
- `POST /api/events` - Create event
- `PUT /api/events/{event_id}` - Update event
- `DELETE /api/events/{event_id}` - Delete event

### AI Chat
- `POST /api/ai/chat` - Create AI chat room
- `POST /api/ai/chat/{room_id}/message` - Send message to AI
- `POST /api/ai/chat/{room_id}/stream` - Stream AI response

---

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

---

## 🚢 Deployment

### Deploy to GCP Cloud Run

1. **Build and push Docker image:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/lifestring-api
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy lifestring-api \
  --image gcr.io/PROJECT_ID/lifestring-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://...,OPENAI_API_KEY=sk-...
```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create lifestring-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set SUPABASE_JWT_SECRET=...

# Deploy
git push heroku main
```

---

## 🔄 Migration from Laravel

### Database
- **No schema changes needed** - Uses same PostgreSQL database
- **Same tables** - user_profiles, strings, rooms, messages, events, etc.
- **Same pgvector extension** - For AI embeddings

### API Compatibility
- **Same endpoints** - `/api/users`, `/api/strings`, etc.
- **Same authentication** - Supabase JWT tokens
- **Same responses** - JSON format maintained

### What Changed
- **Framework**: Laravel → FastAPI
- **Language**: PHP → Python
- **ORM**: Eloquent → SQLAlchemy
- **Server**: PHP-FPM → Uvicorn (ASGI)

---

## 📊 Performance

- **~3x faster** than Laravel for API responses
- **Async support** for concurrent requests
- **Streaming responses** for AI chat
- **Connection pooling** for database

---

## 🐛 Troubleshooting

### Database connection error
```bash
# Check DATABASE_URL format
DATABASE_URL=postgresql://user:password@host:5432/database
```

### pgvector extension missing
```sql
-- Run in PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;
```

### Import errors
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 🤝 Support

For questions or issues, contact Christian or refer to the project documentation.

