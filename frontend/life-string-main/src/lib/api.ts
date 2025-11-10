// Python Backend API Client
const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

class LifestringAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      };
    }
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string, userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
  }

  // Strings methods
  async getStrings() {
    return this.request('/strings');
  }

  async createString(content: string, title?: string) {
    return this.request('/strings', {
      method: 'POST',
      body: JSON.stringify({ content_text: content, title }),
    });
  }

  async likeString(stringId: string) {
    return this.request(`/strings/${stringId}/like`, {
      method: 'POST',
    });
  }

  // AI Chat methods
  async sendAIMessage(message: string, context?: any) {
    return this.request('/ai/lifestring-chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // Strings methods
  async getMyRecentStrings(limit: number = 10) {
    return this.request(`/my/recent?limit=${limit}`);
  }

  async createString(content: string, images?: string[]) {
    return this.request('/strings', {
      method: 'POST',
      body: JSON.stringify({
        content_text: content,
        content_images: images || []
      }),
    });
  }

  // Connections methods
  async getMyConnections() {
    return this.request('/connections/accepted');
  }

  async getPendingConnections() {
    return this.request('/connections/pending');
  }

  async discoverUsers(interests?: string, location?: string, limit: number = 10) {
    const params = new URLSearchParams();
    if (interests) params.append('interests', interests);
    if (location) params.append('location', location);
    params.append('limit', limit.toString());

    return this.request(`/discover?${params.toString()}`);
  }

  async sendConnectionRequest(userId: string) {
    return this.request('/connections', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: userId }),
    });
  }

  // Events/Joins methods
  async getMyRecentEvents(limit: number = 10) {
    return this.request(`/my/recent-events?limit=${limit}`);
  }

  async discoverEvents(interests?: string, location?: string, limit: number = 10) {
    const params = new URLSearchParams();
    if (interests) params.append('interests', interests);
    if (location) params.append('location', location);
    params.append('limit', limit.toString());

    return this.request(`/discover?${params.toString()}`);
  }

  async createEvent(title: string, description: string, startTime: string, location?: string) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        start_time: startTime,
        location,
        custom_fields: {
          looking_for_participants: true,
          created_via: 'frontend'
        }
      }),
    });
  }

  async executeAIAction(actionType: string, actionData: any) {
    return this.request('/ai/execute-action', {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, action_data: actionData }),
    });
  }

  // Users methods
  async getUsers() {
    return this.request('/users');
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Events/Joins methods
  async getEvents() {
    return this.request('/events');
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
}

export const api = new LifestringAPI(API_BASE);
export default api;
