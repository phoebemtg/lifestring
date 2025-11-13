import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Star } from "lucide-react";

interface JoinCardProps {
  join: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    duration?: string;
    max_participants?: number;
    current_participants?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    is_joined?: boolean;
    match_score?: number;
    created_at: string;
    user?: {
      name?: string;
      avatar?: string;
    };
  };
  onJoin?: (joinId: string) => void;
  onViewDetails?: (joinId: string) => void;
  className?: string;
  compact?: boolean; // New prop for compact chat display
}

const JoinCard: React.FC<JoinCardProps> = ({
  join,
  onJoin,
  onViewDetails,
  className = "",
  compact = false
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityCategory = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    const tagString = tags.join(' ').toLowerCase();
    
    if (tagString.includes('hiking') || tagString.includes('camping') || tagString.includes('outdoor')) {
      return { name: 'Outdoor Adventure', color: 'bg-green-50 text-green-700' };
    }
    if (tagString.includes('cooking') || tagString.includes('food') || tagString.includes('wine')) {
      return { name: 'Culinary Experience', color: 'bg-orange-50 text-orange-700' };
    }
    if (tagString.includes('photography') || tagString.includes('art') || tagString.includes('creative')) {
      return { name: 'Creative Activity', color: 'bg-purple-50 text-purple-700' };
    }
    if (tagString.includes('volleyball') || tagString.includes('sports') || tagString.includes('tennis')) {
      return { name: 'Active Sports', color: 'bg-blue-50 text-blue-700' };
    }
    if (tagString.includes('book') || tagString.includes('discussion') || tagString.includes('intellectual')) {
      return { name: 'Intellectual Pursuit', color: 'bg-indigo-50 text-indigo-700' };
    }
    if (tagString.includes('yoga') || tagString.includes('meditation') || tagString.includes('wellness')) {
      return { name: 'Wellness & Mindfulness', color: 'bg-teal-50 text-teal-700' };
    }
    if (tagString.includes('climbing') || tagString.includes('fitness') || tagString.includes('workout')) {
      return { name: 'Fitness Challenge', color: 'bg-red-50 text-red-700' };
    }
    
    return { name: 'Social Experience', color: 'bg-pink-50 text-pink-700' };
  };

  const category = getActivityCategory(join.tags);
  const participantsText = join.max_participants
    ? `${join.current_participants || 1}/${join.max_participants}`
    : `${join.current_participants || 1} joined`;

  // Compact version for chat messages
  if (compact) {
    return (
      <Card className={`w-full max-w-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
            onClick={() => onViewDetails?.(join.id)}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {category && (
                <Badge className={`${category.color} border-0 text-xs font-medium mb-1`}>
                  {category.name}
                </Badge>
              )}
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {join.title}
              </h4>
            </div>
            {join.match_score && join.match_score > 70 && (
              <Star className="h-3 w-3 text-yellow-500 ml-2 flex-shrink-0" />
            )}
          </div>

          {join.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {join.description}
            </p>
          )}

          {/* Creator info */}
          {join.user && (
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden">
                {join.user.avatar ? (
                  <img src={join.user.avatar} alt={join.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {join.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">Created by {join.user.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-2">
              {join.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[80px]">{join.location}</span>
                </div>
              )}
              {join.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{join.duration}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{participantsText}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {join.difficulty && (
                <Badge className={`${getDifficultyColor(join.difficulty)} border-0 text-xs`}>
                  {join.difficulty}
                </Badge>
              )}
              {join.tags && join.tags.length > 0 && (
                <Badge variant="outline" className="text-xs bg-gray-50 px-1 py-0">
                  {join.tags[0]}
                </Badge>
              )}
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(join.id);
              }}
              size="sm"
              className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white"
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
      onClick={() => onViewDetails?.(join.id)}
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
            
            {join.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{join.duration}</span>
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

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-400">
              Created {new Date(join.created_at).toLocaleDateString()}
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.(join.id);
              }}
              size="sm"
              className={`${
                join.is_joined 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium transition-colors`}
              disabled={join.is_joined}
            >
              {join.is_joined ? 'Joined' : 'Join'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinCard;
