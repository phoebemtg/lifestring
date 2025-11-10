"""
Main FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import logging
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import users, strings, rooms, messages, events, ai_chat, connections, auth, joins

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Lifestring API - Social networking with AI-powered features",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables (in production, use Alembic migrations)
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("Starting up Lifestring API...")
    # Uncomment to create tables (use Alembic in production)
    # Base.metadata.create_all(bind=engine)
    logger.info("Application started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("Shutting down Lifestring API...")


# Health check endpoint
@app.get("/up", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Lifestring API",
        "version": "1.0.0",
        "docs": "/docs",
        "demo": "/demo"
    }


# Demo endpoint
@app.get("/demo", response_class=HTMLResponse, tags=["Demo"])
async def demo():
    """Serve the AI chat demo."""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lifestring AI Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .container {
            background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%; max-width: 800px; height: 600px; display: flex; flex-direction: column; overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 20px; text-align: center;
        }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .chat-container { flex: 1; display: flex; flex-direction: column; padding: 20px; }
        .messages {
            flex: 1; overflow-y: auto; margin-bottom: 20px; padding: 10px;
            background: #f8f9fa; border-radius: 10px; max-height: 400px;
            scroll-behavior: smooth;
        }
        .message {
            margin-bottom: 15px; padding: 12px 16px; border-radius: 18px;
            max-width: 80%; word-wrap: break-word;
        }
        .message.user { background: #007bff; color: white; margin-left: auto; }
        .message.ai { background: #e9ecef; color: #333; }
        .message.system {
            background: #28a745; color: white; text-align: center; max-width: 100%;
            font-size: 12px; padding: 8px 12px;
        }
        .input-container { display: flex; gap: 10px; }
        .input-container input {
            flex: 1; padding: 12px 16px; border: 2px solid #e9ecef; border-radius: 25px;
            font-size: 14px; outline: none; transition: border-color 0.3s;
        }
        .input-container input:focus { border-color: #667eea; }
        .input-container button {
            padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border: none; border-radius: 25px; cursor: pointer;
            font-weight: 600; transition: transform 0.2s;
        }
        .input-container button:hover { transform: translateY(-2px); }
        .input-container button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .actions { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
        .action-btn {
            padding: 6px 12px; background: #17a2b8; color: white; border: none;
            border-radius: 15px; font-size: 12px; cursor: pointer; transition: background 0.3s;
        }
        .action-btn:hover { background: #138496; }
        .loading { display: none; text-align: center; padding: 10px; color: #666; }
        .error {
            background: #dc3545; color: white; padding: 10px; border-radius: 5px;
            margin: 10px 0; display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Lifestring AI</h1>
            <p>Your intelligent social networking assistant</p>
        </div>
        <div class="chat-container">
            <div class="messages" id="messages">
                <div class="message system">
                    Welcome! I'm your Lifestring AI assistant. I can help you create strings, find connections, and discover activities. Try saying something like "I want to find people who like hiking" or "Help me plan a trip to Japan"!
                </div>
            </div>
            <div class="error" id="error"></div>
            <div class="loading" id="loading">AI is thinking...</div>
            <div class="input-container">
                <input type="text" id="messageInput" placeholder="Ask me anything about connecting with people or activities..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()" id="sendBtn">Send</button>
            </div>
            <div class="actions" id="actions"></div>
        </div>
    </div>
    <script>
        const API_BASE = window.location.origin;
        let isLoading = false;
        function addMessage(content, type = 'user') {
            const messages = document.getElementById('messages');
            const message = document.createElement('div');
            message.className = `message ${type}`;
            message.textContent = content;
            messages.appendChild(message);

            // Force scroll to bottom
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 10);
        }
        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
        }
        function setLoading(loading) {
            isLoading = loading;
            document.getElementById('loading').style.display = loading ? 'block' : 'none';
            document.getElementById('sendBtn').disabled = loading;
        }
        function showActions(actions) {
            const actionsDiv = document.getElementById('actions');
            actionsDiv.innerHTML = '';
            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = action.description;
                btn.onclick = () => executeAction(action);
                actionsDiv.appendChild(btn);
            });
        }
        async function executeAction(action) {
            try {
                setLoading(true);
                addMessage(`Executing: ${action.description}...`, 'system');

                // Call the real API
                const response = await fetch(`${API_BASE}/api/ai/execute-action?action_type=${action.type}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer demo-token' // Demo token
                    },
                    body: JSON.stringify(action.data)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        addMessage(`Success: ${result.message || 'Action completed successfully!'}`, 'system');

                        // Show results if available
                        if (result.users && result.users.length > 0) {
                            addMessage(`Found ${result.users.length} users: ${result.users.map(u => u.name).join(', ')}`, 'ai');
                        }
                        if (result.joins && result.joins.length > 0) {
                            addMessage(`Found ${result.joins.length} activities: ${result.joins.map(j => j.title).join(', ')}`, 'ai');
                        }
                        if (result.string_id) {
                            addMessage(`Created string with ID: ${result.string_id}`, 'ai');
                        }
                    } else {
                        addMessage(`Error: ${result.error || 'Action failed'}`, 'system');
                    }
                } else {
                    // Fallback for demo - simulate results
                    await simulateActionResult(action);
                }
            } catch (error) {
                // Fallback for demo - simulate results
                await simulateActionResult(action);
            } finally {
                setLoading(false);
            }
        }

        async function simulateActionResult(action) {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (action.type === 'search_users') {
                const interests = action.data.interests || ['general'];
                addMessage(`Found 5 users interested in ${interests.join(', ')}: Alex, Sarah, Mike, Emma, and David`, 'ai');
            } else if (action.type === 'create_string') {
                addMessage(`Created string: "${action.data.title}" - Ready to connect with people!`, 'ai');
            } else if (action.type === 'create_join') {
                addMessage(`Created ${action.data.type}: "${action.data.title}" - Others can now join!`, 'ai');
            } else {
                addMessage(`${action.description} completed successfully!`, 'system');
            }
        }
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message || isLoading) return;
            addMessage(message, 'user');
            input.value = '';
            setLoading(true);
            try {
                const mockResponse = await simulateAIResponse(message);
                addMessage(mockResponse.message, 'ai');
                if (mockResponse.actions && mockResponse.actions.length > 0) {
                    showActions(mockResponse.actions);
                }
            } catch (error) {
                showError('Failed to send message: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
        async function simulateAIResponse(message) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('hiking') || lowerMessage.includes('hike')) {
                return {
                    message: "I'd love to help you find hiking enthusiasts! Let me search for people with similar interests and suggest some hiking groups.",
                    intent: "find_connections",
                    actions: [
                        { type: "search_users", data: { interests: ["hiking"], location: "nearby" }, description: "Find hiking enthusiasts" },
                        { type: "create_string", data: { title: "Looking for hiking buddies", content: "Anyone interested in hiking this weekend?", tags: ["hiking", "outdoors", "weekend"] }, description: "Create hiking string" }
                    ]
                };
            } else if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('japan')) {
                return {
                    message: "That sounds exciting! I can help you plan your trip and find travel companions. Where are you thinking of going?",
                    intent: "suggest_joins",
                    actions: [
                        { type: "create_join", data: { type: "trip", title: "Japan Travel Planning", description: "Planning an amazing trip to Japan!" }, description: "Create Japan trip event" },
                        { type: "search_users", data: { interests: ["travel", "japan"] }, description: "Find travel companions" }
                    ]
                };
            } else if (lowerMessage.includes('workout') || lowerMessage.includes('gym') || lowerMessage.includes('fitness')) {
                return {
                    message: "Great! I can help you find workout partners and fitness groups in your area.",
                    intent: "find_connections",
                    actions: [
                        { type: "search_users", data: { interests: ["fitness", "workout"] }, description: "Find workout buddies" },
                        { type: "create_string", data: { title: "Looking for gym partner", content: "Anyone want to be workout accountability partners?", tags: ["fitness", "gym", "workout"] }, description: "Create fitness string" }
                    ]
                };
            } else if (lowerMessage.includes('food') || lowerMessage.includes('cooking') || lowerMessage.includes('restaurant')) {
                return {
                    message: "I love helping food enthusiasts connect! Let me find people who share your culinary interests.",
                    intent: "find_connections",
                    actions: [
                        { type: "search_users", data: { interests: ["cooking", "food"] }, description: "Find food lovers" },
                        { type: "create_join", data: { type: "event", title: "Cooking Meetup", description: "Let's cook together!" }, description: "Create cooking event" }
                    ]
                };
            } else {
                return {
                    message: "I'm here to help you connect with people and discover activities! Try asking me to find people with specific interests like 'hiking', 'cooking', 'travel', or 'fitness'. I can also help you plan trips or create posts to connect with others.",
                    intent: "general_chat",
                    actions: [
                        { type: "search_users", data: { interests: ["general"] }, description: "Find people nearby" },
                        { type: "create_string", data: { title: "Hello Lifestring!", content: "New to the platform and excited to connect!" }, description: "Create welcome string" }
                    ]
                };
            }
        }
        function handleKeyPress(event) {
            if (event.key === 'Enter') { sendMessage(); }
        }
        document.getElementById('messageInput').focus();
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX, tags=["Authentication"])
app.include_router(users.router, prefix=settings.API_V1_PREFIX, tags=["Users"])
app.include_router(strings.router, prefix=settings.API_V1_PREFIX, tags=["Strings"])
app.include_router(rooms.router, prefix=settings.API_V1_PREFIX, tags=["Rooms"])
app.include_router(messages.router, prefix=settings.API_V1_PREFIX, tags=["Messages"])
app.include_router(events.router, prefix=settings.API_V1_PREFIX, tags=["Events"])
app.include_router(joins.router, prefix=f"{settings.API_V1_PREFIX}/joins", tags=["Joins"])
app.include_router(connections.router, prefix=settings.API_V1_PREFIX, tags=["Connections"])
app.include_router(ai_chat.router, prefix=settings.API_V1_PREFIX, tags=["AI Chat"])

# Mount static files for demo
# Get the project root directory (where python-backend folder is)
current_dir = os.path.dirname(os.path.abspath(__file__))  # app/
parent_dir = os.path.dirname(current_dir)  # python-backend/
static_path = os.path.join(parent_dir, "static")

if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")
    logger.info(f"Static files mounted from: {static_path}")
else:
    logger.warning(f"Static directory not found: {static_path}")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "success": False
        }
    )


# 404 handler
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            "message": "Not Found. If you are looking for an API endpoint, please check the documentation.",
            "success": False
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

