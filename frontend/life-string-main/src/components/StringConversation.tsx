import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";

interface StringConversationProps {
  stringId: string;
  initialMessage: string;
  onBack: () => void;
  selectedOrbColor?: string;
}

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const StringConversation: React.FC<StringConversationProps> = ({
  stringId,
  initialMessage,
  onBack,
  selectedOrbColor = '#3B82F6'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with the initial message
  useEffect(() => {
    if (initialMessage) {
      setChatMessages([{
        type: 'user',
        content: initialMessage,
        timestamp: new Date()
      }]);
      
      // Get AI response to initial message
      handleAIResponse(initialMessage);
    }
  }, [initialMessage]);

  const handleAIResponse = async (message: string) => {
    try {
      setIsLoading(true);
      const response = await aiService.sendMessage(message);
      
      const aiMessage: ChatMessage = {
        type: 'ai',
        content: response.message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        type: 'user',
        content: newMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Clear input immediately
      const messageToSend = newMessage;
      setNewMessage('');
      
      // Get AI response
      await handleAIResponse(messageToSend);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Back button only */}
      <div className="max-w-4xl mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Strings</span>
        </Button>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                        <span className="text-sm">...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Input */}
              <div className="space-y-4">
                <Textarea
                  placeholder="Continue the conversation..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    borderColor: `${selectedOrbColor}60`,
                    '--tw-ring-color': selectedOrbColor
                  } as React.CSSProperties & {
                    '--tw-ring-color': string;
                  }}
                />

                {/* Submit button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={!newMessage.trim() || isLoading}
                    className="w-10 h-10 rounded-full hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: selectedOrbColor
                    }}
                  >
                    <ArrowUp size={16} className="text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StringConversation;
