import React, { useState } from 'react';
import './App.css';

// Simple API client for Python backend
const API_BASE = 'https://lifestring-api-6946562411.us-central1.run.app/api';

interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  actions?: Array<{
    type: string;
    description: string;
    data: any;
  }>;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: "Welcome to Lifestring! I'm your AI assistant. I can help you create strings, find connections, and discover activities. Try saying something like 'I want to find people who like hiking' or 'Help me plan a trip to Japan'!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${API_BASE}/ai/lifestring-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          type: 'ai',
          content: data.message,
          actions: data.actions
        }]);
      } else {
        // Fallback to demo response
        const demoResponse = getDemoResponse(userMessage);
        setMessages(prev => [...prev, demoResponse]);
      }
    } catch (error) {
      // Fallback to demo response
      const demoResponse = getDemoResponse(userMessage);
      setMessages(prev => [...prev, demoResponse]);
    } finally {
      setLoading(false);
    }
  };

  const getDemoResponse = (message: string): Message => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hiking') || lowerMessage.includes('hike')) {
      return {
        type: 'ai',
        content: "I'd love to help you find hiking enthusiasts! Let me search for people with similar interests and suggest some hiking groups.",
        actions: [
          {
            type: "search_users",
            description: "Find hiking enthusiasts",
            data: { interests: ["hiking"] }
          },
          {
            type: "create_string",
            description: "Create hiking string",
            data: {
              title: "Looking for hiking buddies",
              content: "Anyone interested in hiking this weekend?",
              tags: ["hiking", "outdoors", "weekend"]
            }
          }
        ]
      };
    }

    if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('japan')) {
      return {
        type: 'ai',
        content: "That sounds amazing! I'll help you create a trip and find travel companions.",
        actions: [
          {
            type: "create_join",
            description: "Create Japan trip",
            data: {
              title: "Japan Travel Planning",
              type: "trip",
              location: "Japan"
            }
          },
          {
            type: "search_users",
            description: "Find travel buddies",
            data: { interests: ["travel", "japan"] }
          }
        ]
      };
    }

    return {
      type: 'ai',
      content: "I can help you with creating strings, finding connections, and discovering activities. What would you like to do?",
      actions: [
        {
          type: "search_users",
          description: "Find people with similar interests",
          data: { interests: ["general"] }
        }
      ]
    };
  };

  const executeAction = async (action: any) => {
    setMessages(prev => [...prev, {
      type: 'system',
      content: `Executing: ${action.description}...`
    }]);

    // Simulate action execution
    setTimeout(() => {
      let resultMessage = '';
      if (action.type === 'search_users') {
        const interests = action.data.interests || ['general'];
        resultMessage = `Found 5 users interested in ${interests.join(', ')}: Alex, Sarah, Mike, Emma, and David`;
      } else if (action.type === 'create_string') {
        resultMessage = `Created string: "${action.data.title}" - Ready to connect with people!`;
      } else if (action.type === 'create_join') {
        resultMessage = `Created ${action.data.type}: "${action.data.title}" - Others can now join!`;
      } else {
        resultMessage = `${action.description} completed successfully!`;
      }

      setMessages(prev => [...prev, {
        type: 'system',
        content: resultMessage
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Lifestring AI</h1>
            <p className="text-gray-600">Your intelligent social networking assistant</p>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'ai'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-green-100 text-green-800'
                }`}>
                  <p>{message.content}</p>
                  {message.actions && (
                    <div className="mt-2 space-y-1">
                      {message.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => executeAction(action)}
                          className="block w-full text-left px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          {action.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything about connecting with people or activities..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
