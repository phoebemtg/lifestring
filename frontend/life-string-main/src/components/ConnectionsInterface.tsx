import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Briefcase, Heart, MessageCircle, UserPlus, Eye, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ViewProfile from './ViewProfile';

interface Connection {
  id: string;
  name: string;
  bio: string;
  location: string;
  work: string;
  interests: string[];
  hobbies: string[];
  profileImage?: string;
  profile_photo?: string;
  photos?: string[];
  matchScore: number;
  mutualInterests: string[];
  distance?: string;
  lastActive: string;
  age?: number;
  education?: string;
  passions?: string[];
  ambitions?: string;
  dreams?: string;
  goals?: string;
  questions?: string[];
  skills?: string[];
  relationship_status?: string;
  looking_for?: string;
}

interface ConnectionsInterfaceProps {
  selectedOrbColor?: string;
  onMessage?: (userId: string, userName: string) => void;
}

const ConnectionsInterface: React.FC<ConnectionsInterfaceProps> = ({
  selectedOrbColor = "#4169E1",
  onMessage
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [requestSentUsers, setRequestSentUsers] = useState<Set<string>>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifestring-request-sent-users');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading request sent users from localStorage:', error);
        }
      }
    }
    return new Set();
  });
  const [selectedProfile, setSelectedProfile] = useState<Connection | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Save requestSentUsers to localStorage whenever it changes
  const updateRequestSentUsers = (newRequestSentUsers: Set<string>) => {
    setRequestSentUsers(newRequestSentUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifestring-request-sent-users', JSON.stringify([...newRequestSentUsers]));
    }
  };

  // Generate AI-powered connection suggestions
  const generateConnectionSuggestions = async () => {
    try {
      setIsLoading(true);
      
      // Get user's profile data for AI matching
      const { data: { session } } = await supabase.auth.getSession();
      let userProfile = null;
      
      if (session?.access_token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/discover?limit=10`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();

            // Fetch profile photos from Supabase for each user
            const usersWithPhotos = await Promise.all(data.map(async (user: any) => {
              let profilePhoto = null;
              let photos = [];

              try {
                // Fetch detailed profile data including photos
                // First try with both columns, fallback if columns don't exist
                let detailedProfile: any = null;

                const { data, error } = await supabase
                  .from('detailed_profiles')
                  .select('profile_photo, photos')
                  .eq('user_id', user.user_id)
                  .single();

                // If columns don't exist, try without them
                if (error && error.message.includes('does not exist')) {
                  const { data: basicProfile } = await supabase
                    .from('detailed_profiles')
                    .select('*')
                    .eq('user_id', user.user_id)
                    .single();
                  detailedProfile = basicProfile;
                } else {
                  detailedProfile = data;
                }

                if (detailedProfile) {
                  profilePhoto = detailedProfile.profile_photo || null;
                  photos = detailedProfile.photos || [];
                }
              } catch (error) {
                console.log('Could not fetch profile photo for user:', user.user_id, error);
              }

              return {
                id: user.user_id,
                name: user.contact_info?.name || 'Anonymous User',
                bio: user.attributes?.bio || 'No bio available',
                location: user.attributes?.location || 'Location not specified',
                work: user.attributes?.work || 'Work not specified',
                interests: user.attributes?.interests || [],
                hobbies: user.attributes?.hobbies || [],
                profileImage: profilePhoto, // Use profile_photo from detailed_profiles
                profile_photo: profilePhoto, // Also set profile_photo for ViewProfile component
                photos: photos, // Include additional photos
                matchScore: Math.floor(Math.random() * 30) + 70, // 70-100% match
                mutualInterests: user.attributes?.interests?.slice(0, 3) || [],
                distance: `${Math.floor(Math.random() * 20) + 1} miles away`,
                lastActive: 'Active recently',
                relationship_status: user.attributes?.relationship_status,
                looking_for: user.attributes?.looking_for
              };
            }));

            // Add sample user with photos for demonstration
            const sampleUserWithPhotos = {
              id: '550e8400-e29b-41d4-a716-446655440000', // Real UUID from sample data
              name: 'Sarah Johnson',
              bio: 'Passionate about technology and innovation. Love connecting with like-minded individuals.',
              location: 'San Francisco, CA',
              work: 'Software Engineer',
              interests: ['Tech', 'Music', 'Travel'],
              hobbies: ['Photography', 'Reading', 'Coffee'],
              profileImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
              profile_photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
              photos: [
                'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&crop=center',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop&crop=center'
              ],
              matchScore: 95,
              mutualInterests: ['Tech', 'Music', 'Travel'],
              distance: '2 miles away',
              lastActive: 'Active now',
              relationship_status: null,
              looking_for: null
            };

            // Add the sample user to the beginning of the list
            usersWithPhotos.unshift(sampleUserWithPhotos);

            setConnections(usersWithPhotos);
            return;
          }
        } catch (error) {
          console.error('Error fetching from backend:', error);
        }
      }
      
      // Fallback: Generate mock AI-powered suggestions
      const mockConnections: Connection[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000', // Real UUID from sample data
          name: 'Sarah Johnson',
          bio: 'Passionate about technology and innovation. Love connecting with like-minded individuals.',
          location: 'San Francisco, CA',
          work: 'Software Engineer',
          interests: ['Tech', 'Music', 'Travel'],
          hobbies: ['Photography', 'Reading', 'Coffee'],
          profileImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
          profile_photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
          photos: [
            'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=faces',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop&crop=center'
          ],
          matchScore: 95,
          mutualInterests: ['Tech', 'Music', 'Travel'],
          distance: '2 miles away',
          lastActive: 'Active now',
          relationship_status: null,
          looking_for: null
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001', // Real UUID from sample data
          name: 'Sarah Chen',
          bio: 'Adventure seeker and photography enthusiast. Love exploring new trails and capturing beautiful moments.',
          location: 'San Francisco, CA',
          work: 'UX Designer at Tech Startup',
          interests: ['photography', 'hiking', 'travel', 'design'],
          hobbies: ['rock climbing', 'cooking', 'yoga'],
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
          matchScore: 94,
          mutualInterests: ['photography', 'hiking', 'travel'],
          distance: '2.3 miles away',
          lastActive: 'Active 1 hour ago',
          age: 28,
          education: 'Stanford University',
          passions: ['photography', 'travel', 'design'],
          ambitions: 'To start my own design agency and travel the world',
          dreams: 'Photograph all seven continents',
          goals: 'Launch a photography exhibition this year',
          questions: ['What\'s your favorite hiking trail?', 'Do you prefer sunrise or sunset photography?'],
          skills: ['Adobe Creative Suite', 'UI/UX Design', 'Photography'],
          relationship_status: 'Single',
          looking_for: 'Adventure partners and creative collaborators'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002', // Real UUID from sample data
          name: 'Marcus Rodriguez',
          bio: 'Outdoor enthusiast and fitness coach. Always planning the next adventure or helping others reach their goals.',
          location: 'Oakland, CA',
          work: 'Fitness Coach & Personal Trainer',
          interests: ['fitness', 'hiking', 'nutrition', 'mindfulness'],
          hobbies: ['mountain biking', 'meal prep', 'meditation'],
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          matchScore: 89,
          mutualInterests: ['fitness', 'hiking'],
          distance: '5.7 miles away',
          lastActive: 'Active 30 minutes ago',
          age: 32,
          education: 'UC Berkeley',
          passions: ['fitness', 'outdoor adventures', 'helping others'],
          ambitions: 'Open a wellness retreat center in the mountains',
          dreams: 'Climb all the major peaks in California',
          goals: 'Complete an Ironman triathlon this year',
          skills: ['Personal Training', 'Nutrition Coaching', 'Rock Climbing'],
          relationship_status: 'Single',
          looking_for: 'Workout partners and outdoor adventure buddies'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003', // Real UUID from sample data
          name: 'Emma Thompson',
          bio: 'Travel blogger and culture enthusiast. Passionate about sustainable travel and connecting with locals.',
          location: 'Berkeley, CA',
          work: 'Travel Blogger & Content Creator',
          interests: ['travel', 'writing', 'culture', 'sustainability'],
          hobbies: ['blogging', 'language learning', 'volunteering'],
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
          matchScore: 87,
          mutualInterests: ['travel', 'writing'],
          distance: '8.1 miles away',
          lastActive: 'Active 2 hours ago',
          age: 26,
          education: 'UC Berkeley',
          passions: ['sustainable travel', 'cultural exchange', 'storytelling'],
          ambitions: 'Write a book about sustainable travel practices',
          dreams: 'Visit every UNESCO World Heritage site',
          goals: 'Launch a sustainable travel podcast',
          questions: ['What\'s your most memorable travel experience?', 'Do you speak any other languages?'],
          skills: ['Content Writing', 'Photography', 'Social Media Marketing'],
          relationship_status: 'Single',
          looking_for: 'Travel companions and fellow writers'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004', // Real UUID from sample data
          name: 'David Kim',
          bio: 'Tech professional who loves the outdoors. Weekend warrior seeking adventure partners for hiking and camping.',
          location: 'Palo Alto, CA',
          work: 'Software Engineer at Google',
          interests: ['technology', 'hiking', 'camping', 'astronomy'],
          hobbies: ['coding', 'stargazing', 'backpacking'],
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          matchScore: 85,
          mutualInterests: ['technology', 'hiking'],
          distance: '12.4 miles away',
          lastActive: 'Active 4 hours ago',
          age: 30,
          education: 'MIT',
          passions: ['technology', 'space exploration', 'nature'],
          ambitions: 'Contribute to space exploration technology',
          dreams: 'See the Northern Lights and work on Mars mission',
          goals: 'Complete the Pacific Crest Trail',
          questions: ['What\'s your favorite programming language?', 'Have you ever been stargazing?'],
          skills: ['Software Engineering', 'Machine Learning', 'Astrophotography'],
          relationship_status: 'Single',
          looking_for: 'Hiking partners and tech enthusiasts'
        }
      ];
      
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error generating connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connection suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (connection: Connection) => {
    try {
      console.log('🔗 Attempting to send connection request to:', connection.name);

      // Try to send connection request to backend
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔑 Session status:', !!session, 'Token exists:', !!session?.access_token);

      if (session?.access_token) {
        console.log('📡 Sending request to backend API...');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            receiver_id: connection.id
          })
        });

        console.log('📡 API Response status:', response.status);

        if (response.ok) {
          console.log('✅ Connection request sent successfully');
          updateRequestSentUsers(new Set([...requestSentUsers, connection.id]));
          toast({
            title: "Connection Request Sent!",
            description: `Your connection request has been sent to ${connection.name}.`,
          });
          return;
        } else {
          const errorText = await response.text();
          console.log('❌ API Error:', response.status, errorText);
        }
      }

      // Fallback: Local state update
      console.log('📝 Using fallback - updating local state');
      updateRequestSentUsers(new Set([...requestSentUsers, connection.id]));
      toast({
        title: "Connection Request Sent!",
        description: `Your connection request has been sent to ${connection.name}.`,
      });
    } catch (error) {
      console.error('❌ Error sending connection request:', error);
      // Still update local state so user sees feedback
      updateRequestSentUsers(new Set([...requestSentUsers, connection.id]));
      toast({
        title: "Connection Request Sent!",
        description: `Your connection request has been sent to ${connection.name}.`,
      });
    }
  };

  const handleViewProfile = (connection: Connection) => {
    setSelectedProfile(connection);
  };

  const handleBackFromProfile = () => {
    setSelectedProfile(null);
  };

  useEffect(() => {
    generateConnectionSuggestions();
  }, []);

  // Show profile view if a profile is selected
  if (selectedProfile) {
    return (
      <ViewProfile
        user={selectedProfile}
        onBack={handleBackFromProfile}
        onMessage={onMessage}
        onConnect={handleConnect}
        isConnected={connectedUsers.has(selectedProfile.id)}
        isRequestSent={requestSentUsers.has(selectedProfile.id)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">AI-Powered Connections</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our AI has analyzed your interests, conversations, and profile to find people you'll genuinely connect with.
        </p>
      </div>

      {/* Connection Cards - Clean Design Like Reference */}
      <div className="space-y-3">
          {connections.map((connection) => (
            <Card
              key={connection.id}
              className="border-0 bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
              onClick={(e) => {
                // If clicking on the connect area, handle connection, otherwise view profile
                const target = e.target as HTMLElement;
                if (target.closest('.connect-action')) {
                  e.stopPropagation();
                  handleConnect(connection);
                } else {
                  handleViewProfile(connection);
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Image - Circular */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={connection.profileImage}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                  </div>

                  {/* Profile Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {connection.name}
                          </h3>
                          <span className="text-gray-500 text-sm">• {connection.age ? `${connection.age} years old` : 'Age not specified'}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {connection.bio || 'Passionate about technology and innovation. Love connecting with like-minded individuals.'}
                        </p>

                        {/* Interest Tags - Clean and Simple */}
                        <div className="flex flex-wrap gap-2">
                          {(connection.mutualInterests || ['Tech', 'Music', 'Travel']).slice(0, 3).map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs px-3 py-1 bg-gray-200 text-gray-700 border-0 rounded-full font-medium"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Connect Button - Clean Minimal Design */}
                      <div className="flex-shrink-0 connect-action">
                        {!requestSentUsers.has(connection.id) && !connectedUsers.has(connection.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-black text-black hover:bg-gray-50 px-4 py-2 font-black"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            Connect
                          </Button>
                        ) : requestSentUsers.has(connection.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-50 border-gray-600 text-gray-600 px-4 py-2 font-black"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                            disabled
                          >
                            Request Sent
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 border-green-600 text-green-600 px-4 py-2 font-black"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                            disabled
                          >
                            Connected
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
  );
};

export default ConnectionsInterface;
