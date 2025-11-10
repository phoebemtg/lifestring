import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, Share2, Code, Music, Plane, Camera, BookOpen, Coffee, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ViewProfileProps {
  user: {
    id: string;
    name: string;
    bio?: string;
    location?: string;
    age?: number;
    profileImage?: string;
    profile_photo?: string;
    photos?: string[];
    interests?: string[];
    hobbies?: string[];
    relationship_status?: string;
    looking_for?: string;
  };
  onBack: () => void;
  onMessage?: (userId: string, userName: string) => void;
  onConnect?: (user: any) => void;
  isConnected?: boolean;
  isRequestSent?: boolean;
}

const ViewProfile = ({ user, onBack, onMessage, onConnect, isConnected, isRequestSent }: ViewProfileProps) => {
  const { toast } = useToast();

  // Get the profile photo URL
  const profilePhotoUrl = user.profileImage || user.profile_photo;

  // Icon mapping for interests and hobbies
  const getInterestIcon = (interest: string) => {
    const lowerInterest = interest.toLowerCase();
    if (lowerInterest.includes('tech')) return <Code className="h-4 w-4" />;
    if (lowerInterest.includes('music')) return <Music className="h-4 w-4" />;
    if (lowerInterest.includes('travel')) return <Plane className="h-4 w-4" />;
    return <Code className="h-4 w-4" />; // default
  };

  const getHobbyIcon = (hobby: string) => {
    const lowerHobby = hobby.toLowerCase();
    if (lowerHobby.includes('photography')) return <Camera className="h-4 w-4" />;
    if (lowerHobby.includes('reading')) return <BookOpen className="h-4 w-4" />;
    if (lowerHobby.includes('coffee')) return <Coffee className="h-4 w-4" />;
    return <Camera className="h-4 w-4" />; // default
  };

  // Button handlers
  const handleMessage = () => {
    if (onMessage) {
      onMessage(user.id, user.name);
    } else {
      toast({
        title: "Opening Messages",
        description: `Starting conversation with ${user.name}...`,
      });
    }
  };

  const handleConnect = () => {
    if (onConnect) {
      onConnect(user);
    } else {
      toast({
        title: "Connection Request Sent",
        description: `Your connection request has been sent to ${user.name}.`,
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        text: `Check out ${user.name}'s profile on LifeString`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-gray-200">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
        <Button variant="ghost" size="sm" className="p-2">
          <MoreHorizontal className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Profile Content - Full Screen */}
      <div className="bg-background p-6 text-center max-w-3xl mx-auto">
        {/* Avatar */}
        <Avatar className="h-20 w-20 mx-auto mb-3">
          <AvatarImage
            src={profilePhotoUrl}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h2>

        {/* Age and Location */}
        <div className="text-sm text-gray-500 mb-3">
          {user.age && <span>{user.age} years old</span>}
          {user.age && user.location && <span className="mx-2">•</span>}
          {user.location && <span>{user.location}</span>}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Interests and Hobbies - Side by Side */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 text-left">INTERESTS</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <span key={index} className="rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs px-2 py-1 flex items-center gap-1">
                      {getInterestIcon(interest)}
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {user.hobbies && user.hobbies.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 text-left">HOBBIES</h3>
                <div className="flex flex-wrap gap-2">
                  {user.hobbies.slice(0, 3).map((hobby, index) => (
                    <span key={index} className="rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs px-2 py-1 flex items-center gap-1">
                      {getHobbyIcon(hobby)}
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-8">
          <Button
            variant="default"
            className="flex-1 py-4 rounded-lg flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white"
            onClick={handleMessage}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            variant="outline"
            className={`flex-1 py-4 rounded-lg flex items-center justify-center ${
              isConnected
                ? "bg-green-50 border-green-600 text-green-600"
                : isRequestSent
                ? "bg-yellow-50 border-yellow-600 text-yellow-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={handleConnect}
            disabled={isConnected || isRequestSent}
          >
            {isConnected ? "Connected" : isRequestSent ? "Request Sent" : "Connect"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-4 py-4 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Sample photos - replace with actual user photos when available */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
            {user.photos && user.photos[0] ? (
              <img
                src={user.photos[0]}
                alt="Photo 1"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            )}
          </div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500">
            {user.photos && user.photos[1] ? (
              <img
                src={user.photos[1]}
                alt="Photo 2"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
            )}
          </div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500">
            {user.photos && user.photos[2] ? (
              <img
                src={user.photos[2]}
                alt="Photo 3"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;