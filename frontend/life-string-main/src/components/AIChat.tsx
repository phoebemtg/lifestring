import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { aiService, AIMessage } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      type: 'ai',
      content: "Hi! I'm your Lifestring AI assistant. I can help you with anything related to connecting with people, finding activities, or navigating the platform. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        } else {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found when fetching profile for AI chat');
          return;
        }

        console.log('Fetching profile data for AI chat, user:', user.id);

        // Fetch from detailed_profiles table
        const { data, error } = await supabase
          .from('detailed_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile for AI chat:', error);
          return;
        }

        if (data) {
          console.log('Profile data loaded for AI chat:', data);

          // Format profile data for the backend
          const formattedProfile = {
            bio: data.bio || '',
            interests: data.interests || [],
            passions: data.passions || [],
            hobbies: data.hobbies || [],
            skills: data.skills || [],
            location: data.location || '',
            work: data.work || '',
            education: data.education || '',
            goals: data.goals || '',
            dreams: data.dreams || '',
            ambitions: data.ambitions || '',
            relationship_status: data.relationship_status || '',
            looking_for: data.looking_for || '',
            contact_info: {
              name: data.name || data.email || 'User'
            }
          };

          setProfileData(formattedProfile);
          console.log('Formatted profile data for AI:', formattedProfile);
        } else {
          console.log('No profile data found in detailed_profiles');
        }
      } catch (error) {
        console.error('Error in fetchProfileData:', error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    // Add empty AI message that will be updated with streaming content
    const aiMessageIndex = messages.length + 1; // +1 because we just added user message
    setMessages(prev => [...prev, { type: 'ai', content: '' }]);

    try {
      // Pass profile data as context
      const context = profileData ? { profile_data: profileData } : {};
      console.log('Sending message with context:', context);

      await aiService.sendMessageStream(userMessage, context, (chunk: string) => {
        // Update the AI message with streaming content
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[aiMessageIndex]) {
            newMessages[aiMessageIndex] = { type: 'ai', content: chunk };
          }
          return newMessages;
        });
      });

    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[aiMessageIndex]) {
          newMessages[aiMessageIndex] = {
            type: 'ai',
            content: 'Sorry, I encountered an error. Please try again.'
          };
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b px-6 py-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-lg">AI Assistant</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="overflow-y-auto px-4 flex flex-col justify-start"
          style={{
            height: '380px',
            maxHeight: '380px',
            minHeight: '380px'
          }}
        >
          <div
            className="space-y-3 pt-4"
            style={{
              paddingBottom: '0px',
              marginBottom: '0px',
              minHeight: 'auto',
              height: 'fit-content'
            }}
          >
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'ai'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-green-100 text-green-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>
        </div>

        <div className="border-t px-4 py-2 bg-gray-50 flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about connecting with people or activities..."
              className="flex-1 bg-white"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              size="sm"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
