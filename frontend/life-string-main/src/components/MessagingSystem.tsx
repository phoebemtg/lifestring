
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessagingSystemProps {
  recipientId?: string;
  recipientName?: string;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  sender_name?: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  messages: Message[];
}

const MessagingSystem = ({ recipientId, recipientName, onBack }: MessagingSystemProps) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (recipientId && currentUserId) {
      createOrFindConversation(recipientId);
    }
  }, [recipientId, currentUserId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const createOrFindConversation = async (otherUserId: string) => {
    if (!currentUserId) return;

    try {
      // For now, we'll create a mock conversation since the tables don't exist yet
      const mockConversation: Conversation = {
        id: `${currentUserId}-${otherUserId}`,
        participant_1: currentUserId,
        participant_2: otherUserId,
        last_message_at: new Date().toISOString(),
        messages: []
      };

      setConversations(prev => {
        const existing = prev.find(c => c.id === mockConversation.id);
        if (existing) {
          return prev;
        }
        return [mockConversation, ...prev];
      });

      setActiveConversation(mockConversation.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
    }
  };

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      // For now, we'll use mock data since the tables don't exist yet
      const mockConversations: Conversation[] = [];
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // For now, we'll use mock data since the tables don't exist yet
      const mockMessages: Message[] = [];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUserId) return;

    setLoading(true);
    try {
      // For now, we'll just add a mock message to the UI
      const mockMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: currentUserId,
        recipient_id: recipientId || 'unknown',
        created_at: new Date().toISOString(),
        sender_name: 'You'
      };

      setMessages(prev => [...prev, mockMessage]);
      setNewMessage('');

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${recipientName || 'the recipient'}.`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    fetchMessages(conversationId);
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (conversation.participant_1 === currentUserId) {
      return recipientName || `User ${conversation.participant_2.slice(0, 8)}`;
    } else {
      return recipientName || `User ${conversation.participant_1.slice(0, 8)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Common Room</span>
          </Button>
          <h1 className="text-xl font-medium text-gray-900">Messages</h1>
          <div></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <Search className="h-4 w-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        activeConversation === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {getOtherParticipantName(conversation).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {getOtherParticipantName(conversation)}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.messages.length > 0 
                              ? conversation.messages[conversation.messages.length - 1].content
                              : 'No messages yet'
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {recipientName ? `Start a conversation with ${recipientName}` : 'Messages will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {recipientName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{recipientName || 'Unknown User'}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === currentUserId
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Start the conversation by sending a message below
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;
