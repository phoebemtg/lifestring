import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Star } from "lucide-react";

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

interface GroupChatCardProps {
  groupChat: GroupChatData;
  compact?: boolean;
  onJoinChat?: (chatId: string) => void;
  onViewDetails?: (chatId: string) => void;
  className?: string;
}

const GroupChatCard: React.FC<GroupChatCardProps> = ({
  groupChat,
  compact = false,
  onJoinChat,
  onViewDetails,
  className = ""
}) => {
  const getChatCategory = (tags: string[] = []) => {
    const tagString = tags.join(' ').toLowerCase();
    
    if (tagString.includes('hiking') || tagString.includes('outdoor') || tagString.includes('nature')) {
      return { name: 'Outdoor Adventures', color: 'bg-green-50 text-green-700' };
    }
    if (tagString.includes('cooking') || tagString.includes('food') || tagString.includes('recipe')) {
      return { name: 'Food & Cooking', color: 'bg-orange-50 text-orange-700' };
    }
    if (tagString.includes('photography') || tagString.includes('art') || tagString.includes('creative')) {
      return { name: 'Creative Arts', color: 'bg-purple-50 text-purple-700' };
    }
    if (tagString.includes('fitness') || tagString.includes('workout') || tagString.includes('sports')) {
      return { name: 'Fitness & Sports', color: 'bg-blue-50 text-blue-700' };
    }
    if (tagString.includes('book') || tagString.includes('reading') || tagString.includes('discussion')) {
      return { name: 'Book Club', color: 'bg-indigo-50 text-indigo-700' };
    }
    if (tagString.includes('tech') || tagString.includes('coding') || tagString.includes('startup')) {
      return { name: 'Tech & Innovation', color: 'bg-cyan-50 text-cyan-700' };
    }
    
    return { name: 'General Chat', color: 'bg-gray-50 text-gray-700' };
  };

  const category = getChatCategory(groupChat.tags);
  const memberText = groupChat.max_members 
    ? `${groupChat.member_count}/${groupChat.max_members} members`
    : `${groupChat.member_count} members`;

  // Compact version for chat messages
  if (compact) {
    return (
      <Card className={`w-full max-w-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
            onClick={() => onViewDetails?.(groupChat.id)}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {category && (
                <Badge className={`${category.color} border-0 text-xs font-medium mb-1`}>
                  {category.name}
                </Badge>
              )}
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {groupChat.name}
              </h4>
            </div>
            {groupChat.match_score && groupChat.match_score > 70 && (
              <Star className="h-3 w-3 text-yellow-500 ml-2 flex-shrink-0" />
            )}
          </div>

          {groupChat.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {groupChat.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{memberText}</span>
            </div>
            {groupChat.is_joined && (
              <Badge className="bg-green-50 text-green-700 border-0 text-xs">
                Joined
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {groupChat.tags && groupChat.tags.length > 0 && (
                <Badge variant="outline" className="text-xs bg-gray-50 px-1 py-0">
                  {groupChat.tags[0]}
                </Badge>
              )}
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onJoinChat?.(groupChat.id);
              }}
              size="sm"
              className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {groupChat.is_joined ? 'Open' : 'Join Chat'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version for dedicated group chat pages
  return (
    <Card className={`w-full hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {category && (
              <Badge className={`${category.color} border-0 text-sm font-medium mb-2`}>
                {category.name}
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {groupChat.name}
            </h3>
          </div>
          {groupChat.match_score && groupChat.match_score > 70 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{groupChat.match_score}% match</span>
            </div>
          )}
        </div>

        {/* Description */}
        {groupChat.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {groupChat.description}
          </p>
        )}

        {/* Member count */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{memberText}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {groupChat.tags?.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                {tag}
              </Badge>
            ))}
            {groupChat.tags && groupChat.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border-gray-200"
              >
                +{groupChat.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span>Group Chat</span>
          </div>
          
          <Button
            onClick={() => onJoinChat?.(groupChat.id)}
            className={`${
              groupChat.is_joined 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {groupChat.is_joined ? 'Open Chat' : 'Join Group'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChatCard;
