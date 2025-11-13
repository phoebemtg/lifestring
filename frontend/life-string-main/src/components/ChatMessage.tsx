import React from 'react';
import JoinCard from './JoinCard';

interface JoinData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  max_participants?: number;
  current_participants?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  is_joined?: boolean;
  match_score?: number;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
    email?: string;
  };
}

interface ChatMessageProps {
  type: 'user' | 'ai';
  content: string;
  joins?: JoinData[];
  selectedOrbColor?: string;
  onJoinActivity?: (joinId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  type, 
  content, 
  joins = [], 
  selectedOrbColor,
  onJoinActivity 
}) => {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${
        type === 'user'
          ? '!text-black rounded-2xl shadow-sm p-4'
          : '!text-black bg-transparent border-l-4 border-gray-200 pl-4 ml-2'
      }`}
      style={type === 'user' ? { backgroundColor: selectedOrbColor } : {}}
      >
        {/* Text content */}
        {content && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed !text-black mb-3">
            {content}
          </p>
        )}
        
        {/* Join cards */}
        {joins && joins.length > 0 && (
          <div className="space-y-2">
            {joins.map((join) => (
              <JoinCard
                key={join.id}
                join={join}
                compact={true}
                onViewDetails={onJoinActivity}
                className="mb-2"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
