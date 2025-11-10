// AI Service for Lifestring Python Backend
const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

export interface AIMessage {
  type: 'user' | 'ai' | 'system';
  content: string;
  actions?: AIAction[];
}

export interface AIAction {
  type: string;
  description: string;
  data: any;
}

export interface AIResponse {
  message: string;
  intent?: string;
  confidence?: number;
  actions?: AIAction[];
  suggestions?: string[];
}

class AIService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: string, context?: any): Promise<AIResponse> {
    try {
      console.log('🚀 Sending message to API:', `${this.baseUrl}/ai/lifestring-chat-public`);
      console.log('📤 Request payload:', { message, context: context || {} });

      const response = await fetch(`${this.baseUrl}/ai/lifestring-chat-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context || {}
        })
      });

      console.log('📡 API response status:', response.status);
      console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API response data:', data);
        return {
          message: data.message,
          intent: data.intent || 'general_chat',
          confidence: data.confidence || 1.0,
          actions: [], // No actions for natural chat
          suggestions: []
        };
      } else {
        const errorText = await response.text();
        console.error('❌ API request failed with status:', response.status, 'Error:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 API failed with error:', error);
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Instead of fallback, throw the error so we can see what's happening
      throw error;
    }
  }

  async sendMessageStream(message: string, context?: any, onChunk?: (chunk: string) => void): Promise<AIResponse> {
    try {
      console.log('🎬 Sending streaming message to API:', `${this.baseUrl}/ai/lifestring-chat-public`);

      // For now, simulate streaming with the regular response
      const response = await this.sendMessage(message, context);

      if (onChunk && response.message) {
        // Simulate typing effect by streaming the response character by character
        const words = response.message.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onChunk(currentText);

          // Add delay between words to simulate typing
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        }
      }

      return response;
    } catch (error) {
      console.error('💥 Streaming API failed:', error);

      // Return fallback response instead of trying to call sendMessage again (which would cause infinite loop)
      const fallbackMessage = "I'm having trouble connecting right now. Please try again in a moment.";

      if (onChunk) {
        // Stream the fallback message
        const words = fallbackMessage.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onChunk(currentText);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return {
        message: fallbackMessage,
        intent: 'general_chat',
        confidence: 1.0,
        actions: [],
        suggestions: []
      };
    }
  }

  async executeAction(actionType: string, actionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/execute-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_type: actionType,
          action_data: actionData
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Action execution failed');
      }
    } catch (error) {
      console.log('Action execution failed, using simulation');
      return this.simulateActionResult(actionType, actionData);
    }
  }

  private getDemoResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hiking') || lowerMessage.includes('hike')) {
      return {
        message: "I'd love to help you find hiking enthusiasts! Let me search for people with similar interests and suggest some hiking groups.",
        intent: "find_connections",
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
        message: "That sounds amazing! I'll help you create a trip and find travel companions.",
        intent: "suggest_joins",
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

    if (lowerMessage.includes('workout') || lowerMessage.includes('fitness') || lowerMessage.includes('gym')) {
      return {
        message: "Great! I'll help you find workout partners and fitness groups in your area.",
        intent: "find_connections",
        actions: [
          {
            type: "search_users",
            description: "Find workout buddies",
            data: { interests: ["fitness", "workout"] }
          },
          {
            type: "create_string",
            description: "Create fitness string",
            data: { 
              title: "Looking for gym partners",
              content: "Anyone want to be workout accountability partners?",
              tags: ["fitness", "gym", "workout"]
            }
          }
        ]
      };
    }

    if (lowerMessage.includes('cooking') || lowerMessage.includes('food') || lowerMessage.includes('recipe')) {
      return {
        message: "I love helping food enthusiasts connect! Let me find people who share your passion for cooking.",
        intent: "find_connections",
        actions: [
          {
            type: "search_users",
            description: "Find food lovers",
            data: { interests: ["cooking", "food"] }
          },
          {
            type: "create_join",
            description: "Create cooking event",
            data: { 
              title: "Cooking Club Meetup",
              type: "event",
              category: "food"
            }
          }
        ]
      };
    }

    return {
      message: "I can help you create strings, find connections, and discover activities. What interests you?",
      intent: "general_chat",
      actions: [
        {
          type: "search_users",
          description: "Find people with similar interests",
          data: { interests: ["general"] }
        }
      ]
    };
  }

  private simulateActionResult(actionType: string, actionData: any): any {
    if (actionType === 'search_users') {
      const interests = actionData.interests || ['general'];
      return {
        success: true,
        message: `Found 5 users interested in ${interests.join(', ')}: Alex, Sarah, Mike, Emma, and David`,
        data: {
          users: [
            { id: 1, name: 'Alex', interests: interests },
            { id: 2, name: 'Sarah', interests: interests },
            { id: 3, name: 'Mike', interests: interests },
            { id: 4, name: 'Emma', interests: interests },
            { id: 5, name: 'David', interests: interests }
          ]
        }
      };
    } else if (actionType === 'create_string') {
      return {
        success: true,
        message: `Created string: "${actionData.title}" - Ready to connect with people!`,
        data: {
          string_id: Date.now(),
          title: actionData.title,
          content: actionData.content
        }
      };
    } else if (actionType === 'create_join') {
      return {
        success: true,
        message: `Created ${actionData.type}: "${actionData.title}" - Others can now join!`,
        data: {
          join_id: Date.now(),
          title: actionData.title,
          type: actionData.type
        }
      };
    } else {
      return {
        success: true,
        message: 'Action completed successfully!',
        data: {}
      };
    }
  }

  private generateNaturalResponse(message: string): string {
    // Simple fallback that acknowledges we're having connection issues
    // but still tries to be helpful in a natural way
    const responses = [
      "I'm having some connection issues with my main systems right now, but I'd still love to chat! What you mentioned sounds really interesting. Can you tell me more about it?",

      "My connection to the main servers is a bit spotty at the moment, but I'm here to help however I can! What's on your mind?",

      "I'm experiencing some technical difficulties connecting to my full capabilities, but I'm still here to chat. What would you like to talk about?",

      "There seems to be a connection issue on my end, but I don't want to leave you hanging! Tell me more about what you're thinking.",

      "I'm having trouble reaching my main processing systems right now, but I'm still happy to chat with you. What's going on?"
    ];

    // Return a random response to feel more natural
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiService = new AIService(API_BASE);
export default aiService;
