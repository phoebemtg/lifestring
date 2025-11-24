import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Star, MessageCircle } from "lucide-react";

interface JoinCardProps {
  join: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    duration?: string;
    max_participants?: number;
    current_participants?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
    tags?: string[];
    is_joined?: boolean;
    match_score?: number;
    created_at: string;
    user?: {
      id?: string;
      name?: string;
      avatar?: string;
      email?: string;
      bio?: string;
    };
    url?: string;
    event_type?: string;
  };
  onJoin?: (joinId: string) => void;
  onViewDetails?: (joinId: string) => void;
  onMessageCreator?: (join: any) => void;
  className?: string;
  compact?: boolean; // New prop for compact chat display
}

const JoinCard: React.FC<JoinCardProps> = ({
  join,
  onJoin,
  onViewDetails,
  onMessageCreator,
  className = "",
  compact = false
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'intermediate': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'advanced': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'all_levels': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getActivityCategory = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;

    const tagString = tags.join(' ').toLowerCase();

    if (tagString.includes('hiking') || tagString.includes('camping') || tagString.includes('outdoor')) {
      return { name: 'Outdoor Adventure', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('cooking') || tagString.includes('food') || tagString.includes('wine')) {
      return { name: 'Culinary Experience', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('photography') || tagString.includes('art') || tagString.includes('creative')) {
      return { name: 'Creative Activity', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('volleyball') || tagString.includes('sports') || tagString.includes('tennis') || tagString.includes('boating') || tagString.includes('sailing')) {
      return { name: 'Active Sports', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('book') || tagString.includes('discussion') || tagString.includes('intellectual')) {
      return { name: 'Intellectual Pursuit', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('yoga') || tagString.includes('meditation') || tagString.includes('wellness')) {
      return { name: 'Wellness & Mindfulness', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
    if (tagString.includes('climbing') || tagString.includes('fitness') || tagString.includes('workout')) {
      return { name: 'Fitness Challenge', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }

    return { name: 'Social Experience', color: 'bg-gray-100 text-gray-700 border border-gray-200' };
  };

  const category = getActivityCategory(join.tags);
  const participantsText = join.max_participants
    ? `${join.current_participants || 1}/${join.max_participants}`
    : `${join.current_participants || 1} joined`;

  // Handle click for real-time events vs regular joins
  const handleCardClick = () => {
    if (join.event_type === 'real_time_event' && join.url) {
      // Open external URL for real-time events
      window.open(join.url, '_blank');
    } else {
      // Use regular view details for local joins
      onViewDetails?.(join.id);
    }
  };

  // Compact version for chat messages
  if (compact) {
    return (
      <Card className={`w-full max-w-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {category && (
                <Badge className={`${category.color} text-xs font-medium mb-2`}>
                  {category.name}
                </Badge>
              )}
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {join.title}
              </h4>
            </div>
            {join.match_score && join.match_score > 70 && (
              <Star className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />
            )}
          </div>

          {join.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {join.description}
            </p>
          )}

          {/* Creator info */}
          {join.user && (
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden">
                {join.user.avatar ? (
                  <img src={join.user.avatar} alt={join.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                    {join.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">Created by {join.user.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              {join.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{join.location.split(',')[0]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{participantsText}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {join.difficulty && (
              <Badge className={`${getDifficultyColor(join.difficulty)} text-xs`}>
                {join.difficulty}
              </Badge>
            )}
            {join.tags && join.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {join.user && onMessageCreator && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageCreator(join);
                }}
                size="sm"
                variant="outline"
                className="flex-1 text-xs px-2 py-1 h-7 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Message
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (join.event_type === 'real_time_event' && join.url) {
                  window.open(join.url, '_blank');
                } else {
                  onViewDetails?.(join.id);
                }
              }}
              size="sm"
              className="flex-1 text-xs px-2 py-1 h-7 bg-gray-800 hover:bg-gray-900 text-white"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version for regular display
  return (
    <Card
      className={`border-0 bg-white hover:shadow-md transition-all duration-200 cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Category and Match Score */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {category && (
                <Badge className={`${category.color} border-0 text-xs font-medium mb-2`}>
                  {category.name}
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {join.title}
              </h3>
            </div>
            {join.match_score && join.match_score > 70 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-medium">Great Match</span>
              </div>
            )}
          </div>

          {/* Description */}
          {join.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {join.description}
            </p>
          )}

          {/* Details Row */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {join.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-[120px]">{join.location}</span>
              </div>
            )}
            

            
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{participantsText}</span>
            </div>
          </div>

          {/* Tags and Difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {join.tags?.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                >
                  {tag}
                </Badge>
              ))}
              {join.tags && join.tags.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border-gray-200"
                >
                  +{join.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {join.difficulty && (
              <Badge className={`${getDifficultyColor(join.difficulty)} border-0 text-xs font-medium`}>
                {join.difficulty}
              </Badge>
            )}
          </div>

          {/* Creator info */}
          {join.user && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                {join.user.avatar ? (
                  <img src={join.user.avatar} alt={join.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white text-sm font-semibold">
                    {join.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{join.user.name}</p>
                <p className="text-sm text-gray-600">Join Creator</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {join.user && onMessageCreator && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageCreator(join);
                }}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Creator
              </Button>
            )}

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.(join.id);
              }}
              size="sm"
              className={`${
                join.is_joined
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-gray-800 hover:bg-gray-900'
              } text-white font-medium transition-colors ${join.user && onMessageCreator ? 'flex-1' : ''}`}
              disabled={join.is_joined}
            >
              {join.is_joined ? 'Joined' : 'Join Activity'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinCard;
