// Improved AI Service with better error handling and retry logic
export interface AIResponse {
  message: string;
  intent: string;
  confidence: number;
  actions: any[];
  suggestions: any[];
}

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

class ImprovedAIService {
  private baseUrl: string;
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(
    endpoint: string, 
    options: RequestInit, 
    retryOptions: RetryOptions = this.defaultRetryOptions
  ): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
      try {
        console.log(`🚀 Attempt ${attempt + 1}/${retryOptions.maxRetries + 1}: ${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // If successful, return immediately
        if (response.ok) {
          console.log(`✅ Request successful on attempt ${attempt + 1}`);
          return response;
        }

        // If it's a client error (4xx), don't retry
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status} - ${response.statusText}`);
        }

        // For server errors (5xx), we'll retry
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Attempt ${attempt + 1} failed:`, lastError.message);

        // If this is the last attempt, don't wait
        if (attempt === retryOptions.maxRetries) {
          break;
        }

        // Wait before retrying with exponential backoff
        const delay = retryOptions.retryDelay * Math.pow(retryOptions.backoffMultiplier, attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  async sendMessage(message: string, context?: any, token?: string): Promise<AIResponse> {
    try {
      // Try authenticated endpoint first if token is provided
      if (token) {
        try {
          const response = await this.makeRequest('/ai/lifestring-chat', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, context })
          }, { maxRetries: 1, retryDelay: 500, backoffMultiplier: 1 }); // Less retries for auth endpoint

          const data = await response.json();
          
          // Check if it's a generic error response
          if (data.message === "I'm having trouble connecting right now. Please try again in a moment.") {
            throw new Error('Authenticated endpoint returned generic error');
          }

          console.log('✅ Authenticated API success');
          return {
            message: data.message,
            intent: data.intent || 'general_chat',
            confidence: data.confidence || 1.0,
            actions: data.actions || [],
            suggestions: data.suggestions || []
          };
        } catch (authError) {
          console.warn('🔄 Authenticated API failed, falling back to public API:', authError);
        }
      }

      // Fallback to public endpoint
      const response = await this.makeRequest('/ai/lifestring-chat-public', {
        method: 'POST',
        body: JSON.stringify({ message, context })
      });

      const data = await response.json();
      
      // Check if it's a generic error response
      if (data.message === "I'm having trouble connecting right now. Please try again in a moment.") {
        throw new Error('Public endpoint also returned generic error');
      }

      console.log('✅ Public API success');
      return {
        message: data.message,
        intent: data.intent || 'general_chat',
        confidence: data.confidence || 1.0,
        actions: data.actions || [],
        suggestions: data.suggestions || []
      };

    } catch (error) {
      console.error('💥 All API attempts failed:', error);
      
      // Return a helpful error message based on the error type
      let fallbackMessage = "I'm currently experiencing technical difficulties. ";
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        fallbackMessage += "Please check your internet connection and try again.";
      } else if (error.message.includes('500') || error.message.includes('Server error')) {
        fallbackMessage += "The AI service is temporarily unavailable. Please try again in a few minutes.";
      } else if (error.message.includes('403') || error.message.includes('401')) {
        fallbackMessage += "There's an authentication issue. Please try refreshing the page.";
      } else {
        fallbackMessage += "Please try again in a moment.";
      }

      return {
        message: fallbackMessage,
        intent: 'error',
        confidence: 1.0,
        actions: [],
        suggestions: []
      };
    }
  }

  async sendMessageStream(
    message: string, 
    context?: any, 
    token?: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      // Get the full response first
      const response = await this.sendMessage(message, context, token);

      // Simulate streaming if callback is provided
      if (onChunk && response.message) {
        const words = response.message.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onChunk(currentText);

          // Add realistic delay between words
          await this.delay(50 + Math.random() * 100);
        }
      }

      return response;
    } catch (error) {
      console.error('💥 Streaming failed:', error);
      
      const fallbackMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      
      if (onChunk) {
        // Stream the fallback message
        const words = fallbackMessage.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onChunk(currentText);
          await this.delay(100);
        }
      }

      return {
        message: fallbackMessage,
        intent: 'error',
        confidence: 1.0,
        actions: [],
        suggestions: []
      };
    }
  }
}

// Create and export the service instance
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://lifestring-api-6946562411.us-central1.run.app';
export const improvedAiService = new ImprovedAIService(`${backendUrl}/api`);
export default improvedAiService;
