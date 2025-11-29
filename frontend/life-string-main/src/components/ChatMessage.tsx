import React from 'react';
import JoinCard from './JoinCard';
import GroupChatCard from './GroupChatCard';
import PersonCard from './PersonCard';

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
  url?: string;
  event_type?: string;
}

interface GroupChatData {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  max_members?: number;
  tags?: string[];
  is_joined?: boolean;
  match_score?: number;
  created_at: string;
}

interface PersonData {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
  interests?: string[];
  skills?: string[];
  match_score?: number;
  mutual_connections?: number;
  recent_activity?: string;
  created_join?: {
    id: string;
    title: string;
  };
}

interface ChatMessageProps {
  type: 'user' | 'ai';
  content: string;
  joins?: JoinData[];
  groupChats?: GroupChatData[];
  people?: PersonData[];
  selectedOrbColor?: string;
  onJoinActivity?: (joinId: string) => void;
  onJoinGroupChat?: (chatId: string) => void;
  onConnectPerson?: (personId: string) => void;
  onMessagePerson?: (personId: string) => void;
  onViewProfile?: (personId: string) => void;
  onMessageCreator?: (join: JoinData) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  joins = [],
  groupChats = [],
  people = [],
  selectedOrbColor,
  onJoinActivity,
  onJoinGroupChat,
  onConnectPerson,
  onMessagePerson,
  onViewProfile,
  onMessageCreator
}) => {
  // Debug logging (reduced)
  if (people && people.length > 0) {
    console.log('ChatMessage received people:', people.length);
  }
  if (type === 'ai' && joins && joins.length > 0) {
    console.log('ChatMessage received joins:', joins.length);
  }
  // Function to parse markdown links and convert them to clickable links
  const parseMarkdownLinks = (text: string) => {
    // Regex to match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the clickable link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {match[1]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${
        type === 'user'
          ? '!text-black rounded-2xl shadow-sm px-3 py-2'
          : '!text-black bg-transparent border-l-4 border-gray-200 pl-4 ml-2'
      }`}
      style={type === 'user' ? { backgroundColor: selectedOrbColor } : {}}
      >
        {/* Text content with clickable links */}
        {content && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed !text-black">
            {parseMarkdownLinks(content)}
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
                onMessageCreator={onMessageCreator}
                className="mb-2"
              />
            ))}
          </div>
        )}

        {/* Group chat cards */}
        {groupChats && groupChats.length > 0 && (
          <div className="space-y-2 mt-2">
            {groupChats.map((chat) => (
              <GroupChatCard
                key={chat.id}
                groupChat={chat}
                compact={true}
                onJoinChat={onJoinGroupChat}
                className="mb-2"
              />
            ))}
          </div>
        )}

        {/* People cards */}
        {people && people.length > 0 && (
          <div className="space-y-2 mt-2">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                compact={true}
                showJoinContext={!!person.created_join}
                onConnect={onConnectPerson}
                onMessage={onMessagePerson}
                onViewProfile={onViewProfile}
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
