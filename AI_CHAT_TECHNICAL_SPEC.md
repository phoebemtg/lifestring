# Lifestring AI Chat Feature - Technical Specification

**Version:** 1.0  
**Date:** September 30, 2025  
**Status:** Draft for Review

---

## 🎯 Overview

This document provides detailed technical specifications for implementing an LLM-powered chat feature in the Lifestring platform.

---

## 🏗️ Architecture

### **Approach: Extend Existing Room System**

We'll leverage the existing chat infrastructure (`rooms`, `messages`, `room_participants`) and add AI-specific functionality.

```
User → Frontend → Laravel API → OpenAI API
                       ↓
                  PostgreSQL (Supabase)
                       ↓
                  Vector Search (pgvector)
```

---

## 📊 Database Changes

### **1. Add AI Bot User**

```sql
-- Create AI assistant user
INSERT INTO user_profiles (
    id,
    user_id,
    contact_info,
    social_links,
    attributes,
    biography,
    is_admin,
    is_mod
) VALUES (
    'ai-assistant-uuid-here',
    'ai-assistant-uuid-here',
    '{"name": "Lifestring AI", "email": "ai@lifestring.ai"}',
    '{}',
    '{"passions": [], "hobbies": [], "interests": [], "skills": []}',
    '{"bio": "I am your AI assistant, here to help you with anything on Lifestring!"}',
    false,
    true
);
```

### **2. Extend Rooms Metadata**

No schema changes needed! Use existing `rooms.metadata` JSONB field:

```json
{
  "type": "ai_chat",
  "model": "gpt-4o-mini",
  "system_prompt": "You are a helpful assistant for Lifestring...",
  "temperature": 0.7,
  "max_tokens": 500,
  "context_enabled": true
}
```

### **3. Optional: Add AI Conversations Table**

If we want to track AI-specific metadata:

```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    context_strings UUID[], -- Array of string IDs used for context
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_id)
);

CREATE INDEX ai_conversations_user_id_idx ON ai_conversations(user_id);
```

---

## 🔌 API Endpoints

### **1. Create AI Chat Session**

```
POST /api/ai/chat
```

**Request:**
```json
{
  "initial_message": "Hello, I need help with...",
  "context_enabled": true
}
```

**Response:**
```json
{
  "room_id": "uuid",
  "message": {
    "id": "uuid",
    "content": "Hello! I'm here to help...",
    "created_at": "2025-09-30T12:00:00Z"
  }
}
```

**Implementation:**
```php
// app/Http/Controllers/AIChatController.php
public function createChat(Request $request)
{
    $user = $request->user();
    
    // 1. Create room
    $room = Room::create([
        'name' => 'AI Chat - ' . now()->format('M d, Y'),
        'metadata' => [
            'type' => 'ai_chat',
            'model' => 'gpt-4o-mini',
            'context_enabled' => $request->context_enabled ?? true
        ]
    ]);
    
    // 2. Add user and AI as participants
    $room->participants()->attach([$user->user_id, config('ai.bot_user_id')]);
    
    // 3. Send initial message if provided
    if ($request->initial_message) {
        return $this->sendMessage($room, $request);
    }
    
    return response()->json(['room_id' => $room->id]);
}
```

### **2. Send Message to AI**

```
POST /api/ai/chat/{room}/message
```

**Request:**
```json
{
  "content": "What are some good hobbies for me?"
}
```

**Response:**
```json
{
  "user_message": {
    "id": "uuid",
    "content": "What are some good hobbies for me?",
    "created_at": "2025-09-30T12:00:00Z"
  },
  "ai_message": {
    "id": "uuid",
    "content": "Based on your interests in...",
    "created_at": "2025-09-30T12:00:01Z"
  },
  "tokens_used": 150,
  "cost": 0.0002
}
```

### **3. Stream AI Response (SSE)**

```
POST /api/ai/chat/{room}/stream
```

**Response:** Server-Sent Events stream

```
data: {"type": "start"}

data: {"type": "token", "content": "Based"}

data: {"type": "token", "content": " on"}

data: {"type": "token", "content": " your"}

data: {"type": "done", "message_id": "uuid", "tokens": 150}
```

### **4. Get Chat History**

```
GET /api/ai/chat/{room}/history?limit=50
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "content": "Hello!",
      "created_at": "2025-09-30T12:00:00Z",
      "user": {
        "name": "John Doe"
      }
    },
    {
      "id": "uuid",
      "user_id": "ai-uuid",
      "content": "Hi! How can I help?",
      "created_at": "2025-09-30T12:00:01Z",
      "user": {
        "name": "Lifestring AI"
      }
    }
  ]
}
```

### **5. Delete Chat Session**

```
DELETE /api/ai/chat/{room}
```

**Response:**
```json
{
  "message": "Chat session deleted successfully"
}
```

---

## 💻 Backend Implementation

### **File Structure**

```
app/
├── Http/
│   └── Controllers/
│       └── AIChatController.php (NEW)
├── Services/
│   ├── OpenAIService.php (NEW)
│   ├── RAGService.php (NEW)
│   └── AIContextBuilder.php (NEW)
└── Models/
    └── AIConversation.php (NEW - optional)

config/
└── ai.php (NEW)

routes/
└── api.php (MODIFY)
```

### **1. AIChatController.php**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Message;
use App\Services\OpenAIService;
use App\Services\AIContextBuilder;
use Illuminate\Http\Request;

class AIChatController extends Controller
{
    protected $openAI;
    protected $contextBuilder;
    
    public function __construct(OpenAIService $openAI, AIContextBuilder $contextBuilder)
    {
        $this->openAI = $openAI;
        $this->contextBuilder = $contextBuilder;
    }
    
    public function createChat(Request $request)
    {
        // Implementation from above
    }
    
    public function sendMessage(Room $room, Request $request)
    {
        // 1. Validate room is AI chat
        if ($room->metadata['type'] !== 'ai_chat') {
            return response()->json(['error' => 'Not an AI chat room'], 400);
        }
        
        // 2. Validate user is participant
        if (!$room->hasParticipant($request->user()->user_id)) {
            return response()->json(['error' => 'Not authorized'], 403);
        }
        
        // 3. Store user message
        $userMessage = Message::create([
            'room_id' => $room->id,
            'user_id' => $request->user()->user_id,
            'content' => $request->content
        ]);
        
        // 4. Build context
        $context = $this->contextBuilder->build($room, $request->user());
        
        // 5. Get AI response
        $aiResponse = $this->openAI->chat([
            'model' => $room->metadata['model'] ?? 'gpt-4o-mini',
            'messages' => $context,
            'temperature' => $room->metadata['temperature'] ?? 0.7,
            'max_tokens' => $room->metadata['max_tokens'] ?? 500
        ]);
        
        // 6. Store AI message
        $aiMessage = Message::create([
            'room_id' => $room->id,
            'user_id' => config('ai.bot_user_id'),
            'content' => $aiResponse['content']
        ]);
        
        return response()->json([
            'user_message' => $userMessage,
            'ai_message' => $aiMessage,
            'tokens_used' => $aiResponse['tokens'],
            'cost' => $aiResponse['cost']
        ]);
    }
    
    public function streamMessage(Room $room, Request $request)
    {
        // SSE implementation
        return response()->stream(function () use ($room, $request) {
            // Similar to sendMessage but with streaming
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no'
        ]);
    }
}
```

### **2. OpenAIService.php**

```php
<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;

class OpenAIService
{
    public function chat(array $params)
    {
        $response = OpenAI::chat()->create($params);
        
        $content = $response->choices[0]->message->content;
        $tokens = $response->usage->totalTokens;
        
        // Calculate cost (GPT-4o-mini: $0.15/1M input, $0.60/1M output)
        $cost = ($tokens / 1000000) * 0.375; // Average
        
        return [
            'content' => $content,
            'tokens' => $tokens,
            'cost' => $cost
        ];
    }
    
    public function chatStream(array $params, callable $callback)
    {
        $stream = OpenAI::chat()->createStreamed($params);
        
        foreach ($stream as $response) {
            $delta = $response->choices[0]->delta->content ?? '';
            if ($delta) {
                $callback($delta);
            }
        }
    }
}
```

### **3. AIContextBuilder.php**

```php
<?php

namespace App\Services;

use App\Models\Room;
use App\Models\User;
use App\Models\Message;

class AIContextBuilder
{
    public function build(Room $room, User $user)
    {
        $messages = [];
        
        // 1. System prompt
        $messages[] = [
            'role' => 'system',
            'content' => $this->getSystemPrompt($user)
        ];
        
        // 2. User context (if enabled)
        if ($room->metadata['context_enabled'] ?? true) {
            $userContext = $this->getUserContext($user);
            if ($userContext) {
                $messages[] = [
                    'role' => 'system',
                    'content' => "User context: " . $userContext
                ];
            }
        }
        
        // 3. Conversation history (last 10 messages)
        $history = Message::where('room_id', $room->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse();
        
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg->user_id === config('ai.bot_user_id') ? 'assistant' : 'user',
                'content' => $msg->content
            ];
        }
        
        return $messages;
    }
    
    protected function getSystemPrompt(User $user)
    {
        return "You are Lifestring AI, a helpful assistant for the Lifestring social platform. " .
               "You help users with their profiles, content, connections, and general questions. " .
               "Be friendly, concise, and helpful. The user's name is " . 
               ($user->contact_info['name'] ?? 'there') . ".";
    }
    
    protected function getUserContext(User $user)
    {
        $context = [];
        
        // Add user interests
        if (!empty($user->attributes['interests'])) {
            $context[] = "Interests: " . implode(', ', $user->attributes['interests']);
        }
        
        // Add user passions
        if (!empty($user->attributes['passions'])) {
            $context[] = "Passions: " . implode(', ', $user->attributes['passions']);
        }
        
        // Add bio
        if (!empty($user->biography['bio'])) {
            $context[] = "Bio: " . $user->biography['bio'];
        }
        
        return implode('. ', $context);
    }
}
```

### **4. config/ai.php**

```php
<?php

return [
    'bot_user_id' => env('AI_BOT_USER_ID', 'ai-assistant-uuid'),
    
    'models' => [
        'chat' => env('AI_CHAT_MODEL', 'gpt-4o-mini'),
        'embedding' => env('EMBED_MODEL', 'text-embedding-3-small'),
    ],
    
    'defaults' => [
        'temperature' => 0.7,
        'max_tokens' => 500,
    ],
    
    'rate_limits' => [
        'messages_per_hour' => 100,
        'messages_per_day' => 500,
    ],
];
```

### **5. routes/api.php (Add these routes)**

```php
// AI Chat routes
Route::group(['middleware' => ['supabase.auth'], 'prefix' => 'ai'], function () {
    Route::post('/chat', [AIChatController::class, 'createChat']);
    Route::post('/chat/{room}/message', [AIChatController::class, 'sendMessage']);
    Route::post('/chat/{room}/stream', [AIChatController::class, 'streamMessage']);
    Route::get('/chat/{room}/history', [AIChatController::class, 'getHistory']);
    Route::delete('/chat/{room}', [AIChatController::class, 'deleteChat']);
});
```

---

## 🚀 Advanced Features (Phase 2)

### **1. RAG (Retrieval Augmented Generation)**

Use vector search to find relevant user strings:

```php
// app/Services/RAGService.php
public function getRelevantStrings(User $user, string $query, int $limit = 3)
{
    // 1. Generate embedding for query
    $queryEmbedding = $this->generateEmbedding($query);
    
    // 2. Vector search
    $strings = DB::select("
        SELECT s.*, se.embedding <=> ? as distance
        FROM strings s
        JOIN string_embeddings se ON s.id = se.string_id
        WHERE s.user_id = ?
        ORDER BY distance
        LIMIT ?
    ", [$queryEmbedding, $user->user_id, $limit]);
    
    return $strings;
}
```

### **2. Function Calling**

Allow AI to perform actions:

```php
$functions = [
    [
        'name' => 'create_string',
        'description' => 'Create a new string/post for the user',
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'content' => ['type' => 'string', 'description' => 'The content of the string']
            ]
        ]
    ],
    [
        'name' => 'search_users',
        'description' => 'Search for users by interests',
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'interests' => ['type' => 'array', 'items' => ['type' => 'string']]
            ]
        ]
    ]
];
```

---

## 🧪 Testing

### **Unit Tests**

```php
// tests/Feature/AIChatTest.php
public function test_can_create_ai_chat()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)
        ->postJson('/api/ai/chat', [
            'initial_message' => 'Hello'
        ]);
    
    $response->assertStatus(200)
        ->assertJsonStructure(['room_id', 'message']);
}
```

### **Manual Testing Checklist**

- [ ] Create AI chat session
- [ ] Send message and receive response
- [ ] Test streaming responses
- [ ] Verify context is included
- [ ] Test rate limiting
- [ ] Test error handling (invalid room, unauthorized access)
- [ ] Test with different models (GPT-4o-mini, GPT-4o)

---

## 📈 Monitoring & Analytics

### **Metrics to Track**

1. **Usage**
   - Total AI chats created
   - Messages per chat
   - Active users

2. **Performance**
   - Average response time
   - Token usage per request
   - Cost per conversation

3. **Quality**
   - User satisfaction (thumbs up/down)
   - Conversation length
   - Retry rate

### **Implementation**

```php
// Log AI interactions
Log::channel('ai')->info('AI Chat', [
    'user_id' => $user->user_id,
    'room_id' => $room->id,
    'model' => $model,
    'tokens' => $tokens,
    'cost' => $cost,
    'response_time' => $responseTime
]);
```

---

## 💰 Cost Estimation

### **GPT-4o-mini Pricing**
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

### **Example Calculation**

Average conversation:
- 10 messages
- 100 tokens per user message
- 200 tokens per AI response
- Total: 3,000 tokens

Cost per conversation: **$0.0011**

For 1,000 users with 10 conversations/month:
- 10,000 conversations
- **Total cost: ~$11/month**

---

## 🔒 Security Considerations

1. **Rate Limiting**
   - 100 messages/hour per user
   - 500 messages/day per user

2. **Content Filtering**
   - Use OpenAI's moderation API
   - Block inappropriate requests

3. **Data Privacy**
   - Don't send sensitive user data to OpenAI
   - Allow users to opt-out of context

4. **Cost Protection**
   - Set max_tokens limit
   - Monitor daily spending
   - Alert if costs exceed threshold

---

## 📝 Next Steps

1. Review this spec with Christian
2. Get approval on approach
3. Set up AI bot user in database
4. Implement basic chat endpoint
5. Test with frontend
6. Add streaming support
7. Implement RAG
8. Add function calling
9. Deploy to production

---

**Questions? Contact Phoebe**

