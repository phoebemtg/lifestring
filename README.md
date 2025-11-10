# Lifestring

A personality-based community platform that helps you find your house and connect with like-minded individuals.

## 🚀 Project Overview

Lifestring is a social connection platform featuring:
- **Strings AI**: Conversational AI assistant for discovering activities and connections
- **Joins**: Events and activities users can create and participate in
- **Connections**: Personalized recommendations for meeting like-minded people
- **Profile System**: Comprehensive user profiles with interests, skills, and personality insights

## 🏗️ Architecture

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for modern UI components
- **Supabase** for authentication and real-time features

### Backend
- **Python FastAPI** for high-performance API
- **OpenAI GPT-4o-mini** for AI chat functionality
- **Supabase PostgreSQL** for database
- **Google Cloud Run** for serverless deployment

## 📁 Project Structure

```
lifestring/
├── frontend/life-string-main/     # React frontend application
├── python-backend/                # FastAPI backend application
├── frontend-react/                # Alternative React setup
└── docs/                         # Documentation and guides
```

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend/life-string-main
npm install
npm run dev
```

### Backend Development
```bash
cd python-backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🌐 Deployment

- **Frontend**: Deployed on Vercel at https://lifestring.ai
- **Backend**: Deployed on Google Cloud Run
- **Database**: Supabase PostgreSQL with real-time subscriptions

## 🤖 Strings AI

The core AI assistant that:
- Helps users discover relevant Joins (activities/events)
- Directs users to Connections for meeting people
- Provides natural conversational responses
- Integrates with real-time data (weather, news, current events)

## 🔧 Key Features

- **Real-time Chat**: WebSocket-based messaging system
- **Smart Recommendations**: AI-powered activity and people suggestions
- **Profile Matching**: Interest and location-based connections
- **Event Management**: Create and join activities
- **Mobile-Ready**: Responsive design for all devices

## 📱 Upcoming

- Mobile app development via Median
- Enhanced AI capabilities
- Expanded social features

