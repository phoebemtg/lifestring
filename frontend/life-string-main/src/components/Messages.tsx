import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

interface MessagesProps {
  onBack: () => void;
  userName: string;
}

const Messages = ({ onBack, userName }: MessagesProps) => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "James",
      avatar: "/lovable-uploads/9e1988fd-9efd-41ac-a1c8-c72b1de2ca43.png",
      lastMessage: "Thank you! That was very helpful!",
      timestamp: "2 min ago",
      unread: true
    },
    {
      id: 2,
      name: "Will Kenny",
      lastMessage: "I know... I'm trying to get the funds.",
      timestamp: "1 hour ago"
    },
    {
      id: 3,
      name: "Beth Williams",
      lastMessage: "I'm looking for tips around capturing the milky way. I have a 6D with a 24-100mm...",
      timestamp: "3 hours ago"
    },
    {
      id: 4,
      name: "Rev Shawn",
      lastMessage: "Wanted to ask if you're available for a portrait shoot next week.",
      timestamp: "1 day ago"
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation !== null) {
      // Find the selected conversation
      const selectedConv = conversations.find(conv => conv.id === selectedConversation);

      if (selectedConv) {
        // TODO: Send message to backend/database
        // This would typically involve an API call to save the message

        toast({
          title: "Message sent!",
          description: `Message sent to ${selectedConv.name}`,
        });

        // For now, just show success feedback
        // In a real app, this would update the conversation in the database
        // and the UI would reflect the new message
      }

      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img 
              src="/lifestring-header-logo.png" 
              alt="LifeString Logo"
              className="h-[280px] w-auto object-contain"
            />
            <h1 className="text-xl font-light tracking-wide text-gray-900">Messages</h1>
          </div>
          
          <Avatar className="ring-2 ring-gray-200">
            <AvatarFallback className="bg-gray-100 text-gray-600 font-light tracking-wide">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Conversations List and Message Thread */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)] pt-40">
        {/* Conversations List */}
        <div className="w-96 bg-white/80 backdrop-blur-sm border-r border-gray-200">
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50/80 border-gray-200 rounded-full font-light tracking-wide"
              />
            </div>
            
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={`border-0 cursor-pointer transition-all hover:shadow-md ${
                    selectedConversation === conversation.id ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50/80'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        {conversation.avatar ? (
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        ) : (
                          <AvatarFallback className="bg-gray-200 text-gray-600 font-light">
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 tracking-wide truncate">
                            {conversation.name}
                          </h3>
                          <span className="text-xs text-gray-500 font-light">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-light leading-relaxed line-clamp-2">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-200 text-gray-600 font-light">
                      {conversations.find(c => c.id === selectedConversation)?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-medium text-gray-900 tracking-wide">
                    {conversations.find(c => c.id === selectedConversation)?.name}
                  </h2>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center py-16">
                  <p className="text-gray-500 font-light text-lg">Message thread will appear here</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6">
                <div className="flex space-x-4">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 font-light tracking-wide"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-light tracking-wide"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-wide">Select a conversation</h3>
                <p className="text-gray-500 font-light">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
