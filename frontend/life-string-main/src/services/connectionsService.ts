import { supabase } from '@/integrations/supabase/client';

export interface ConnectionRequest {
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  work?: string;
  interests?: string[];
  profileImage?: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
}

class ConnectionsService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication session found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  }

  async sendConnectionRequest(receiverId: string): Promise<ConnectionRequest> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/connections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        receiver_id: receiverId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send connection request');
    }
    
    return response.json();
  }

  async getMyConnections(status?: 'pending' | 'accepted' | 'declined'): Promise<Connection[]> {
    const headers = await this.getAuthHeaders();

    const url = status
      ? `${import.meta.env.VITE_BACKEND_URL}/api/connections?status_filter=${status}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/connections`;

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }

    const data = await response.json();
    return data.connections || [];
  }

  async getPendingRequests(): Promise<Connection[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/connections/pending`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending requests');
    }
    
    return response.json();
  }

  async respondToConnection(requesterId: string, accept: boolean): Promise<ConnectionRequest> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/connections/${requesterId}/respond`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        accept
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to respond to connection request');
    }
    
    return response.json();
  }

  async removeConnection(userId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/connections/${userId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove connection');
    }
  }
}

export const connectionsService = new ConnectionsService();
