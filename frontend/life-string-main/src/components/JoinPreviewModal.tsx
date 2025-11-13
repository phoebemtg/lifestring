import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star, MessageCircle } from 'lucide-react';

interface JoinData {
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
    id: string;
    name?: string;
    avatar?: string;
    email?: string;
  };
}

interface JoinPreviewModalProps {
  join: JoinData | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageCreator: (join: JoinData) => void;
  onJoin?: (joinId: string) => void;
}

const JoinPreviewModal: React.FC<JoinPreviewModalProps> = ({
  join,
  isOpen,
  onClose,
  onMessageCreator,
  onJoin
}) => {
  if (!join) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const participantsText = join.max_participants
    ? `${join.current_participants || 1}/${join.max_participants}`
    : `${join.current_participants || 1} joined`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {join.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Creator info */}
          {join.user && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                {join.user.avatar ? (
                  <img src={join.user.avatar} alt={join.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
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

          {/* Description */}
          {join.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About this Join</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {join.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              {join.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{join.location}</span>
                </div>
              )}

              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{participantsText}</span>
              </div>
              
              {join.match_score && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-gray-600">{join.match_score}% match</span>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty and Tags */}
          <div className="flex flex-wrap gap-2">
            {join.difficulty && (
              <Badge className={`${getDifficultyColor(join.difficulty)} border-0`}>
                {join.difficulty}
              </Badge>
            )}
            {join.tags && join.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onMessageCreator(join)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Creator
            </Button>
            
            {onJoin && !join.is_joined && (
              <Button
                onClick={() => onJoin(join.id)}
                variant="outline"
                className="flex-1"
              >
                Join Activity
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinPreviewModal;
