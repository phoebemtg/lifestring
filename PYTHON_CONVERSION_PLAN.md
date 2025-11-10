# Lifestring Python Conversion Plan

**Requested by:** Christian  
**Timeline:** 3-4 weeks (aggressive) or 5-6 weeks (realistic)  
**Framework:** FastAPI + SQLAlchemy

---

## 🎯 **Conversion Strategy**

### **Phase 1: Foundation (Days 1-3)**
- Set up FastAPI project structure
- Configure PostgreSQL connection
- Set up authentication (Supabase JWT)
- Create base models

### **Phase 2: Core Models (Days 4-6)**
- User profiles
- Strings (posts)
- Rooms & Messages
- Events
- Embeddings

### **Phase 3: API Endpoints (Days 7-12)**
- User endpoints
- String endpoints
- Chat endpoints
- Event endpoints
- AI/embedding endpoints

### **Phase 4: AI Chat Feature (Days 13-16)**
- OpenAI integration
- AI chat endpoints
- RAG implementation
- Streaming responses

### **Phase 5: Testing & Deployment (Days 17-20)**
- Unit tests
- Integration tests
- Deploy to GCP Cloud Run
- Documentation

---

## 📊 **Detailed Timeline**

| Days | Tasks | Deliverables |
|------|-------|--------------|
| **1-3** | Setup, auth, database | Working FastAPI app with auth |
| **4-6** | Core models | All database models working |
| **7-9** | User & String APIs | CRUD endpoints tested |
| **10-12** | Chat & Event APIs | All endpoints migrated |
| **13-14** | OpenAI integration | Embeddings working |
| **15-16** | AI chat feature | Chat with AI working |
| **17-18** | Testing | All tests passing |
| **19-20** | Deployment | Production ready |

---

## 🏗️ **Project Structure**

```
lifestring-python/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (auth, db)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── strings.py
│   │       ├── rooms.py
│   │       ├── messages.py
│   │       ├── events.py
│   │       └── ai_chat.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── string.py
│   │   ├── room.py
│   │   ├── message.py
│   │   ├── event.py
│   │   └── embeddings.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── string.py
│   │   ├── room.py
│   │   ├── message.py
│   │   └── event.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openai_service.py
│   │   ├── embedding_service.py
│   │   ├── rag_service.py
│   │   └── recommendation_service.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── auth.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_users.py
│   ├── test_strings.py
│   └── test_ai_chat.py
├── .env
├── .env.example
├── pyproject.toml
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 📦 **Dependencies**

### **Core**
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `sqlalchemy` - ORM
- `alembic` - Database migrations
- `psycopg2-binary` - PostgreSQL driver
- `pydantic` - Data validation
- `pydantic-settings` - Settings management

### **Authentication**
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data

### **AI/ML**
- `openai` - OpenAI API client
- `pgvector` - Vector operations
- `numpy` - Numerical operations

### **Background Tasks**
- `celery` - Task queue
- `redis` - Message broker

### **Development**
- `pytest` - Testing
- `pytest-asyncio` - Async testing
- `httpx` - HTTP client for testing
- `black` - Code formatting
- `ruff` - Linting

---

## 🚀 **Quick Start Commands**

### **1. Create Project**
```bash
# Create directory
mkdir lifestring-python
cd lifestring-python

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Poetry (recommended) or use pip
pip install poetry
poetry init
```

### **2. Install Dependencies**
```bash
# Using Poetry
poetry add fastapi uvicorn[standard] sqlalchemy psycopg2-binary \
    pydantic pydantic-settings python-jose[cryptography] \
    passlib[bcrypt] openai pgvector alembic celery redis

poetry add --group dev pytest pytest-asyncio httpx black ruff

# Or using pip
pip install -r requirements.txt
```

### **3. Run Development Server**
```bash
# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or with auto-reload
python -m uvicorn app.main:app --reload
```

### **4. Database Migrations**
```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

### **5. Run Tests**
```bash
pytest
pytest -v  # Verbose
pytest --cov=app  # With coverage
```

---

## 🔄 **Conversion Checklist**

### **Day 1: Setup**
- [ ] Create project structure
- [ ] Set up virtual environment
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up database connection
- [ ] Test database connectivity

### **Day 2: Authentication**
- [ ] Implement JWT verification
- [ ] Create auth dependencies
- [ ] Test Supabase token validation
- [ ] Create user authentication flow

### **Day 3: Base Models**
- [ ] Create SQLAlchemy base
- [ ] Set up Alembic
- [ ] Create User model
- [ ] Test model creation

### **Day 4-5: Core Models**
- [ ] String model
- [ ] Room model
- [ ] Message model
- [ ] Event model
- [ ] Embedding models
- [ ] Test all relationships

### **Day 6: Schemas**
- [ ] User schemas (request/response)
- [ ] String schemas
- [ ] Room/Message schemas
- [ ] Event schemas

### **Day 7-8: User & String APIs**
- [ ] GET /api/users
- [ ] GET /api/users/{id}
- [ ] POST /api/users
- [ ] PUT /api/users/{id}
- [ ] DELETE /api/users/{id}
- [ ] GET /api/strings
- [ ] POST /api/strings
- [ ] POST /api/strings/{id}/like
- [ ] Test all endpoints

### **Day 9-10: Chat APIs**
- [ ] GET /api/rooms
- [ ] POST /api/rooms
- [ ] GET /api/rooms/{id}/messages
- [ ] POST /api/rooms/{id}/messages
- [ ] GET /api/my/rooms
- [ ] Test chat flow

### **Day 11-12: Event & Recommendation APIs**
- [ ] GET /api/events
- [ ] POST /api/events
- [ ] GET /api/recommended/strings
- [ ] GET /api/recommended/users
- [ ] Test recommendations

### **Day 13-14: OpenAI Integration**
- [ ] OpenAI service class
- [ ] Embedding generation
- [ ] Vector similarity search
- [ ] Test embeddings

### **Day 15-16: AI Chat**
- [ ] POST /api/ai/chat
- [ ] POST /api/ai/chat/{room}/message
- [ ] Streaming responses
- [ ] Context building
- [ ] RAG implementation
- [ ] Test AI chat

### **Day 17-18: Testing**
- [ ] Unit tests for models
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] Test coverage > 80%

### **Day 19-20: Deployment**
- [ ] Create Dockerfile
- [ ] Set up docker-compose
- [ ] Deploy to GCP Cloud Run
- [ ] Set up CI/CD
- [ ] Monitor and test production

---

## 📝 **Migration Notes**

### **Key Differences from Laravel**

| Laravel | FastAPI | Notes |
|---------|---------|-------|
| Eloquent ORM | SQLAlchemy | More explicit, less magic |
| Route Model Binding | Path parameters + DB query | Manual but flexible |
| Middleware | Dependencies | More composable |
| Form Requests | Pydantic schemas | Better type safety |
| Collections | Lists/Generators | Use Python itertools |
| Blade | Not needed | API only |
| Artisan | Alembic + Click | Separate tools |

### **Database Considerations**

- **No changes to database schema needed!** ✅
- Use existing Supabase PostgreSQL
- SQLAlchemy will map to existing tables
- Keep all JSONB fields
- pgvector works the same

### **Authentication**

- Same JWT tokens from Supabase
- Same verification logic
- Just different implementation language

---

## 💡 **Pro Tips**

1. **Start Small:** Get one endpoint working end-to-end first
2. **Use Type Hints:** FastAPI relies on them for validation
3. **Test Early:** Write tests as you build
4. **Copy Logic:** Port business logic directly from PHP
5. **Use Async:** FastAPI supports async/await for better performance
6. **Document:** FastAPI auto-generates OpenAPI docs

---

## 🆘 **Common Pitfalls**

### **1. Async vs Sync**
```python
# ❌ Don't mix sync and async
async def get_user():
    user = db.query(User).first()  # Sync call in async function

# ✅ Use async properly
async def get_user(db: AsyncSession):
    result = await db.execute(select(User))
    user = result.scalar_one_or_none()
```

### **2. JSONB Handling**
```python
# ✅ SQLAlchemy handles JSONB automatically
from sqlalchemy.dialects.postgresql import JSONB

class User(Base):
    contact_info = Column(JSONB)  # Works like Laravel's cast
```

### **3. Relationships**
```python
# ✅ Define both sides of relationship
class User(Base):
    strings = relationship("String", back_populates="user")

class String(Base):
    user = relationship("User", back_populates="strings")
```

---

## 📊 **Success Metrics**

### **Week 1 Goals**
- [ ] FastAPI server running
- [ ] Database connected
- [ ] Auth working
- [ ] 5+ endpoints migrated

### **Week 2 Goals**
- [ ] All CRUD endpoints working
- [ ] Chat system functional
- [ ] OpenAI integration working
- [ ] 50%+ test coverage

### **Week 3 Goals**
- [ ] AI chat feature complete
- [ ] All endpoints migrated
- [ ] 80%+ test coverage
- [ ] Deployed to staging

### **Week 4 Goals**
- [ ] Production deployment
- [ ] Frontend integrated
- [ ] Documentation complete
- [ ] Ready for mobile app work

---

## 🎯 **Next Steps**

1. **Review this plan with Christian**
   - Confirm 4-week timeline is realistic
   - Discuss if 6 weeks is possible
   - Clarify mobile app priority

2. **Set up development environment**
   - Install Python 3.11+
   - Set up IDE (VS Code recommended)
   - Install dependencies

3. **Start conversion**
   - Follow day-by-day checklist
   - Commit code daily
   - Test continuously

---

**Ready to start? Let me know and I'll generate the starter code!** 🚀

