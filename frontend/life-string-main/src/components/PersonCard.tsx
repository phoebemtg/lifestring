import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, MessageCircle, UserPlus, Star, Eye } from "lucide-react";

interface PersonCardProps {
  person: {
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
  };
  onConnect?: (personId: string) => void;
  onMessage?: (personId: string) => void;
  onViewProfile?: (personId: string) => void;
  className?: string;
  compact?: boolean;
  showJoinContext?: boolean; // Show "Created [Join Name]" context
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onConnect,
  onMessage,
  onViewProfile,
  className = "",
  compact = false,
  showJoinContext = false
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    console.log('🔗 Connect button clicked for person:', person.id);

    try {
      await onConnect?.(person.id);
      setIsConnected(true);
      setTimeout(() => setIsConnected(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (compact) {
    return (
      <Card className={`w-full bg-white border border-gray-200 hover:shadow-sm transition-all duration-200 hover:border-purple-300 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  person.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base mb-1">{person.name}</h3>
                {showJoinContext && person.created_join && (
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Created "{truncateText(person.created_join.title, 30)}"
                  </p>
                )}
                {person.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {person.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('👁️ View Profile button clicked for person:', person.id);
                  onViewProfile?.(person.id);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                className={`px-3 border-0 transition-all duration-200 ${
                  isConnected
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                }`}
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <Star className="w-4 h-4 mr-1" />
                    Connected!
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
            {person.avatar ? (
              <img src={person.avatar} alt={person.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              person.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
              {person.match_score && (
                <Badge className={`${getMatchScoreColor(person.match_score)} flex items-center`}>
                  <Star className="w-3 h-3 mr-1" />
                  {person.match_score}% match
                </Badge>
              )}
            </div>
            
            {showJoinContext && person.created_join && (
              <p className="text-sm text-purple-600 mb-2 font-medium">
                Created "{person.created_join.title}"
              </p>
            )}
            
            {person.bio && (
              <p className="text-sm text-gray-600 mb-3">
                {truncateText(person.bio, 100)}
              </p>
            )}
            
            <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
              {person.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {person.location}
                </div>
              )}
              {person.mutual_connections && person.mutual_connections > 0 && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {person.mutual_connections} mutual
                </div>
              )}
            </div>
            
            {(person.interests || person.skills) && (
              <div className="flex flex-wrap gap-1 mb-4">
                {person.interests?.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                    {interest}
                  </Badge>
                ))}
                {person.skills?.slice(0, 2).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              console.log('🔗 Connect button clicked for person:', person.id);
              onConnect?.(person.id);
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log('💬 Message button clicked for person:', person.id);
              onMessage?.(person.id);
            }}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              console.log('👤 View Profile button clicked for person:', person.id);
              onViewProfile?.(person.id);
            }}
            className="text-purple-700 hover:bg-purple-50"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonCard;
