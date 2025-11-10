import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Lightbulb, Edit, Home, Users, MessageSquare, Camera, Plus, Search, Mail, Crown, UserPlus, Edit3, MessageCircle, X, Clock, UsersRound, Save, Phone, Globe, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Removed Community import - no longer needed
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Messages from "./Messages";
import Profile from "./Profile";
import EditableProfile from "./EditableProfile";
import MessagingSystem from "./MessagingSystem";
import AIChat from "./AIChat";
import { connectionsService, Connection } from '@/services/connectionsService';
import StringsInterface from "./StringsInterface";
import ConnectionsInterface from "./ConnectionsInterface";
import ViewProfile from "./ViewProfile";

import { aiService } from "@/services/aiService";
interface CommonRoomProps {
  onBack: () => void;
  onBackToLanding: () => void;
  userName: string;
}
interface Post {
  id: number;
  content: string;
  author: string;
  timestamp: Date;
  type: 'idea' | 'ask' | 'want';
  authorId?: string;
}
interface MerchandiseCategory {
  id: string;
  name: string;
  image: string;
  description: string;
}
interface Member {
  id: string;
  name: string;
  bio?: string;
  interests?: string[];
  location?: string;
  work?: string;
  age?: number;
}

// Function to generate multi-colored floating cloud background
const getCommunityBackground = (communityName: string, colors: string[], selectedOrbColor?: string) => {
  // Define community-specific color palettes
  const getCommunityColorPalette = (community: string) => {
    switch (community.toLowerCase()) {
      case 'lincoln':
        return ['#B8860B', '#FFFF99', '#FFD700', '#F0E68C'];
      // Dark yellow, light yellow, gold, khaki
      case 'arc':
        return ['#1E3A8A', '#60A5FA', '#00FFFF', '#87CEEB'];
      // Deep blue, light blue, cyan, sky blue
      case 'franklin':
        return ['#B91C1C', '#FF7F7F', '#FA8072', '#FFA07A'];
      // Dark red, coral, salmon, light salmon
      case 'nightingale':
        return ['#166534', '#86EFAC', '#98FB98', '#90EE90'];
      // Forest green, mint green, pale green, light green
      case 'king':
        return ['#800020', '#B91C1C', '#DC143C', '#CD5C5C'];
      // Burgundy, dark red, crimson, indian red
      case 'newton':
        return ['#1E3A8A', '#87CEEB', '#B0E0E6', '#AFEEEE'];
      // Navy blue, sky blue, powder blue, pale turquoise
      case 'twain':
        return ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'];
      // Deep pink, hot pink, light pink, pink
      case 'tolkien':
        return ['#FFF8DC', '#F5DEB3', '#FFFAF0', '#FAEBD7'];
      // Cream, wheat, floral white, antique white
      case 'frank':
        return ['#6B46C1', '#C084FC', '#DDD6FE', '#E9D5FF'];
      // Deep purple, lavender, light lavender, very light lavender
      default:
        return ['#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];
      // Default purple palette
    }
  };

  // Get color-specific orb layouts
  const getColorSpecificLayout = (color: string) => {
    switch (color) {
      case '#4169E1':
        // Arc Blue - Diagonal wave cascade
        return [{
          top: '5%',
          left: '5%',
          width: '200px',
          height: '200px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '0s'
        }, {
          top: '25%',
          left: '25%',
          width: '180px',
          height: '180px',
          blur: 'blur(65px)',
          opacity: 0.16,
          delay: '3s'
        }, {
          top: '45%',
          left: '45%',
          width: '220px',
          height: '220px',
          blur: 'blur(75px)',
          opacity: 0.20,
          delay: '6s'
        }, {
          top: '65%',
          right: '35%',
          width: '190px',
          height: '190px',
          blur: 'blur(68px)',
          opacity: 0.17,
          delay: '9s'
        }, {
          bottom: '10%',
          right: '10%',
          width: '210px',
          height: '210px',
          blur: 'blur(72px)',
          opacity: 0.19,
          delay: '12s'
        }];
      case '#FFD700':
        // Lincoln Gold - Horizontal stripe pattern
        return [{
          top: '10%',
          left: '10%',
          width: '350px',
          height: '150px',
          blur: 'blur(85px)',
          opacity: 0.18,
          delay: '0s'
        }, {
          top: '10%',
          right: '10%',
          width: '300px',
          height: '150px',
          blur: 'blur(80px)',
          opacity: 0.17,
          delay: '4s'
        }, {
          top: '35%',
          left: '15%',
          width: '320px',
          height: '140px',
          blur: 'blur(82px)',
          opacity: 0.16,
          delay: '8s'
        }, {
          top: '35%',
          right: '15%',
          width: '340px',
          height: '145px',
          blur: 'blur(84px)',
          opacity: 0.19,
          delay: '12s'
        }, {
          top: '60%',
          left: '20%',
          width: '310px',
          height: '150px',
          blur: 'blur(81px)',
          opacity: 0.17,
          delay: '16s'
        }, {
          top: '60%',
          right: '20%',
          width: '330px',
          height: '145px',
          blur: 'blur(83px)',
          opacity: 0.18,
          delay: '20s'
        }];
      case '#DC143C':
        // Franklin Red - Circular ring pattern
        return [{
          top: '40%',
          left: '48%',
          width: '120px',
          height: '120px',
          blur: 'blur(55px)',
          opacity: 0.25,
          delay: '0s'
        }, {
          top: '15%',
          left: '48%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '3s'
        }, {
          top: '28%',
          right: '15%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '6s'
        }, {
          bottom: '15%',
          left: '48%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '9s'
        }, {
          top: '28%',
          left: '15%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '12s'
        }];
      case '#228B22':
        // Nightingale Green - Vertical columns
        return [{
          top: '8%',
          left: '15%',
          width: '160px',
          height: '200px',
          blur: 'blur(68px)',
          opacity: 0.17,
          delay: '0s'
        }, {
          top: '35%',
          left: '15%',
          width: '170px',
          height: '210px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '5s'
        }, {
          bottom: '12%',
          left: '15%',
          width: '165px',
          height: '195px',
          blur: 'blur(69px)',
          opacity: 0.16,
          delay: '10s'
        }, {
          top: '15%',
          left: '48%',
          width: '180px',
          height: '220px',
          blur: 'blur(72px)',
          opacity: 0.19,
          delay: '15s'
        }, {
          bottom: '20%',
          left: '48%',
          width: '175px',
          height: '200px',
          blur: 'blur(71px)',
          opacity: 0.17,
          delay: '20s'
        }, {
          top: '10%',
          right: '15%',
          width: '170px',
          height: '215px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '25s'
        }, {
          top: '40%',
          right: '15%',
          width: '165px',
          height: '190px',
          blur: 'blur(68px)',
          opacity: 0.16,
          delay: '30s'
        }];
      case '#800020':
        // King Crimson - X crossing pattern
        return [{
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          blur: 'blur(75px)',
          opacity: 0.20,
          delay: '0s'
        }, {
          top: '30%',
          left: '30%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '4s'
        }, {
          top: '50%',
          left: '48%',
          width: '160px',
          height: '160px',
          blur: 'blur(65px)',
          opacity: 0.22,
          delay: '8s'
        }, {
          bottom: '30%',
          right: '30%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '12s'
        }, {
          bottom: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          blur: 'blur(75px)',
          opacity: 0.20,
          delay: '16s'
        }, {
          top: '10%',
          right: '10%',
          width: '190px',
          height: '190px',
          blur: 'blur(73px)',
          opacity: 0.19,
          delay: '20s'
        }, {
          top: '32%',
          right: '32%',
          width: '175px',
          height: '175px',
          blur: 'blur(68px)',
          opacity: 0.17,
          delay: '24s'
        }, {
          bottom: '28%',
          left: '28%',
          width: '185px',
          height: '185px',
          blur: 'blur(71px)',
          opacity: 0.19,
          delay: '28s'
        }, {
          bottom: '10%',
          left: '10%',
          width: '195px',
          height: '195px',
          blur: 'blur(74px)',
          opacity: 0.20,
          delay: '32s'
        }];
      case '#87CEEB':
        // Newton Sky Blue - Staggered zigzag
        return [{
          top: '8%',
          left: '12%',
          width: '160px',
          height: '160px',
          blur: 'blur(62px)',
          opacity: 0.15,
          delay: '0s'
        }, {
          top: '8%',
          right: '12%',
          width: '165px',
          height: '165px',
          blur: 'blur(63px)',
          opacity: 0.16,
          delay: '3s'
        }, {
          top: '28%',
          left: '28%',
          width: '155px',
          height: '155px',
          blur: 'blur(61px)',
          opacity: 0.14,
          delay: '6s'
        }, {
          top: '28%',
          right: '28%',
          width: '170px',
          height: '170px',
          blur: 'blur(64px)',
          opacity: 0.17,
          delay: '9s'
        }, {
          top: '48%',
          left: '18%',
          width: '160px',
          height: '160px',
          blur: 'blur(62px)',
          opacity: 0.15,
          delay: '12s'
        }, {
          top: '48%',
          right: '18%',
          width: '158px',
          height: '158px',
          blur: 'blur(61px)',
          opacity: 0.14,
          delay: '15s'
        }, {
          bottom: '15%',
          left: '35%',
          width: '165px',
          height: '165px',
          blur: 'blur(63px)',
          opacity: 0.16,
          delay: '18s'
        }, {
          bottom: '15%',
          right: '35%',
          width: '162px',
          height: '162px',
          blur: 'blur(62px)',
          opacity: 0.15,
          delay: '21s'
        }];
      case '#FF69B4':
        // Hot Pink - Scattered constellation
        return [{
          top: '12%',
          left: '18%',
          width: '140px',
          height: '140px',
          blur: 'blur(58px)',
          opacity: 0.14,
          delay: '0s'
        }, {
          top: '18%',
          left: '42%',
          width: '120px',
          height: '120px',
          blur: 'blur(54px)',
          opacity: 0.12,
          delay: '4s'
        }, {
          top: '15%',
          right: '22%',
          width: '130px',
          height: '130px',
          blur: 'blur(56px)',
          opacity: 0.13,
          delay: '8s'
        }, {
          top: '42%',
          left: '25%',
          width: '150px',
          height: '150px',
          blur: 'blur(60px)',
          opacity: 0.15,
          delay: '12s'
        }, {
          top: '38%',
          right: '15%',
          width: '125px',
          height: '125px',
          blur: 'blur(55px)',
          opacity: 0.13,
          delay: '16s'
        }, {
          bottom: '28%',
          left: '35%',
          width: '135px',
          height: '135px',
          blur: 'blur(57px)',
          opacity: 0.14,
          delay: '20s'
        }, {
          bottom: '20%',
          right: '28%',
          width: '145px',
          height: '145px',
          blur: 'blur(59px)',
          opacity: 0.15,
          delay: '24s'
        }, {
          bottom: '12%',
          left: '15%',
          width: '120px',
          height: '120px',
          blur: 'blur(54px)',
          opacity: 0.12,
          delay: '28s'
        }];
      case '#F5DEB3':
        // Tolkien Cream - Ascending steps
        return [{
          bottom: '8%',
          left: '8%',
          width: '220px',
          height: '160px',
          blur: 'blur(72px)',
          opacity: 0.16,
          delay: '0s'
        }, {
          bottom: '20%',
          left: '22%',
          width: '210px',
          height: '155px',
          blur: 'blur(70px)',
          opacity: 0.15,
          delay: '5s'
        }, {
          bottom: '32%',
          left: '36%',
          width: '215px',
          height: '158px',
          blur: 'blur(71px)',
          opacity: 0.17,
          delay: '10s'
        }, {
          top: '42%',
          left: '48%',
          width: '205px',
          height: '150px',
          blur: 'blur(69px)',
          opacity: 0.14,
          delay: '15s'
        }, {
          top: '28%',
          right: '38%',
          width: '218px',
          height: '162px',
          blur: 'blur(72px)',
          opacity: 0.16,
          delay: '20s'
        }, {
          top: '15%',
          right: '22%',
          width: '212px',
          height: '156px',
          blur: 'blur(70px)',
          opacity: 0.15,
          delay: '25s'
        }];
      case '#9370DB':
        // Purple - Flowing river
        return [{
          top: '10%',
          left: '40%',
          width: '250px',
          height: '120px',
          blur: 'blur(68px)',
          opacity: 0.15,
          delay: '0s'
        }, {
          top: '22%',
          left: '25%',
          width: '230px',
          height: '115px',
          blur: 'blur(66px)',
          opacity: 0.14,
          delay: '4s'
        }, {
          top: '35%',
          left: '35%',
          width: '260px',
          height: '125px',
          blur: 'blur(70px)',
          opacity: 0.16,
          delay: '8s'
        }, {
          top: '48%',
          left: '18%',
          width: '240px',
          height: '118px',
          blur: 'blur(67px)',
          opacity: 0.15,
          delay: '12s'
        }, {
          top: '62%',
          left: '32%',
          width: '235px',
          height: '120px',
          blur: 'blur(67px)',
          opacity: 0.14,
          delay: '16s'
        }, {
          bottom: '10%',
          left: '22%',
          width: '245px',
          height: '122px',
          blur: 'blur(68px)',
          opacity: 0.15,
          delay: '20s'
        }];
      case '#FF8C00':
        // Orange - Diamond formation
        return [{
          top: '40%',
          left: '48%',
          width: '180px',
          height: '180px',
          blur: 'blur(70px)',
          opacity: 0.18,
          delay: '0s'
        }, {
          top: '15%',
          left: '35%',
          width: '200px',
          height: '200px',
          blur: 'blur(75px)',
          opacity: 0.17,
          delay: '4s'
        }, {
          top: '15%',
          right: '35%',
          width: '195px',
          height: '195px',
          blur: 'blur(74px)',
          opacity: 0.16,
          delay: '8s'
        }, {
          top: '40%',
          left: '18%',
          width: '210px',
          height: '210px',
          blur: 'blur(76px)',
          opacity: 0.19,
          delay: '12s'
        }, {
          top: '40%',
          right: '18%',
          width: '205px',
          height: '205px',
          blur: 'blur(75px)',
          opacity: 0.18,
          delay: '16s'
        }, {
          bottom: '15%',
          left: '35%',
          width: '190px',
          height: '190px',
          blur: 'blur(73px)',
          opacity: 0.17,
          delay: '20s'
        }, {
          bottom: '15%',
          right: '35%',
          width: '198px',
          height: '198px',
          blur: 'blur(74px)',
          opacity: 0.16,
          delay: '24s'
        }];
      case '#1F1F1F':
        // Black - Layered curtain effect
        return [{
          top: '5%',
          left: '5%',
          width: '120px',
          height: '300px',
          blur: 'blur(110px)',
          opacity: 0.09,
          delay: '0s'
        }, {
          top: '5%',
          left: '25%',
          width: '130px',
          height: '320px',
          blur: 'blur(115px)',
          opacity: 0.08,
          delay: '6s'
        }, {
          top: '5%',
          left: '48%',
          width: '125px',
          height: '310px',
          blur: 'blur(112px)',
          opacity: 0.10,
          delay: '12s'
        }, {
          top: '5%',
          right: '25%',
          width: '135px',
          height: '315px',
          blur: 'blur(116px)',
          opacity: 0.07,
          delay: '18s'
        }, {
          top: '5%',
          right: '5%',
          width: '128px',
          height: '305px',
          blur: 'blur(113px)',
          opacity: 0.09,
          delay: '24s'
        }];
      case 'CLEAN':
        // Clean background - no orbs
        return [];
      default:
        // Default blue layout
        return [{
          top: '10%',
          left: '15%',
          width: '300px',
          height: '300px',
          blur: 'blur(80px)',
          opacity: 0.15,
          delay: '0s'
        }, {
          top: '60%',
          right: '10%',
          width: '250px',
          height: '250px',
          blur: 'blur(100px)',
          opacity: 0.25,
          delay: '5s'
        }, {
          top: '25%',
          right: '25%',
          width: '400px',
          height: '400px',
          blur: 'blur(60px)',
          opacity: 0.18,
          delay: '10s'
        }, {
          bottom: '20%',
          left: '20%',
          width: '350px',
          height: '350px',
          blur: 'blur(120px)',
          opacity: 0.12,
          delay: '15s'
        }, {
          top: '50%',
          left: '50%',
          width: '280px',
          height: '280px',
          blur: 'blur(90px)',
          opacity: 0.2,
          delay: '8s'
        }, {
          bottom: '10%',
          right: '40%',
          width: '320px',
          height: '320px',
          blur: 'blur(70px)',
          opacity: 0.16,
          delay: '12s'
        }];
    }
  };
  const communityColors = getCommunityColorPalette(communityName);
  const baseStyle = {
    position: 'relative' as const,
    minHeight: '100vh',
    background: selectedOrbColor === 'CLEAN' ? '#ffffff' : 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
    overflow: 'hidden'
  };

  // Get layout based on selected orb color
  const layout = getColorSpecificLayout(selectedOrbColor || '#4169E1');

  // Create floating cloud orbs with dynamic colors and layout
  const cloudOrbs = layout.map((orbConfig, index) => ({
    backgroundColor: selectedOrbColor || communityColors[index % communityColors.length],
    className: `animate-cloud-float-${index % 6 + 1}`,
    style: {
      position: 'absolute' as const,
      animationDelay: orbConfig.delay,
      filter: orbConfig.blur,
      opacity: orbConfig.opacity,
      width: orbConfig.width,
      height: orbConfig.height,
      ...(orbConfig.top && {
        top: orbConfig.top
      }),
      ...(orbConfig.bottom && {
        bottom: orbConfig.bottom
      }),
      ...(orbConfig.left && {
        left: orbConfig.left
      }),
      ...(orbConfig.right && {
        right: orbConfig.right
      })
    }
  }));
  return {
    baseStyle,
    cloudOrbs
  };
};
const CommonRoom = ({
  userName
}: CommonRoomProps) => {
  const [activeSection, setActiveSection] = useState('ideas');
  const [currentView, setCurrentView] = useState<'common-room' | 'messages' | 'profile' | 'edit-profile' | 'messaging-system'>('common-room');
  const [newPost, setNewPost] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const [selectedPostType, setSelectedPostType] = useState<'idea' | 'ask' | 'want' | null>(null);
  const [ideaPosts, setIdeaPosts] = useState<Post[]>([]);
  const [ideaPostCounter, setIdeaPostCounter] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [messagingRecipient, setMessagingRecipient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Database-connected state
  const [communityEvents, setCommunityEvents] = useState<any[]>([]);
  const [communityCompetitions, setCommunityCompetitions] = useState<any[]>([]);
  const [communityClubs, setCommunityClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  // Removed recommendations functionality as it was unused mock data

  // New state for strings functionality
  const [userStrings, setUserStrings] = useState([]);
  const [connectedStrings, setConnectedStrings] = useState([]);
  const [recentStrings, setRecentStrings] = useState<Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRefresh, setTimeRefresh] = useState(0);

  // State for loading conversations into StringsInterface
  const [loadConversation, setLoadConversation] = useState<{
    id: string;
    content: string;
    timestamp: Date;
  } | null>(null);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([
    {
      type: 'system',
      content: "Welcome! I'm your Lifestring AI assistant. I can help you create strings, find connections, and discover activities. Try saying something like 'I want to find people who like hiking' or 'Help me plan a trip to Japan'!"
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  // Club-related state
  const [clubSearchTerm, setClubSearchTerm] = useState('');
  const [clubLocationFilter, setClubLocationFilter] = useState('');
  const [clubJoinRequests, setClubJoinRequests] = useState<any[]>([]);

  // Customize state
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>('');
  const [selectedOrbColor, setSelectedOrbColor] = useState<string>('#4169E1');
  const [selectedFont, setSelectedFont] = useState<string>('sans');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Get current user
  const {
    user,
    userProfile,
    signOut
  } = useAuth();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // The auth state change will automatically redirect to landing page
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Profile state management
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    bio: "",
    location: "",
    birthday: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    interests: [] as string[],
    skills: [] as string[],
    passions: [] as string[],
    hobbies: [] as string[],
    education: "",
    work: "",
    relationshipStatus: "",
    lookingFor: ""
  });
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newPassion, setNewPassion] = useState("");
  const [newHobby, setNewHobby] = useState("");

  const handleProfileSave = () => {
    setIsEditingProfile(false);
    toast({
      title: "Profile updated!",
      description: "Your profile information has been saved successfully.",
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addPassion = () => {
    if (newPassion.trim() && !profileData.passions.includes(newPassion.trim())) {
      setProfileData(prev => ({
        ...prev,
        passions: [...prev.passions, newPassion.trim()]
      }));
      setNewPassion("");
    }
  };

  const removePassion = (passion: string) => {
    setProfileData(prev => ({
      ...prev,
      passions: prev.passions.filter(p => p !== passion)
    }));
  };

  const addHobby = () => {
    if (newHobby.trim() && !profileData.hobbies.includes(newHobby.trim())) {
      setProfileData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setProfileData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  // Fetch posts function
  const fetchPosts = async () => {
    if (!user?.id) return;
    try {
      // Fetch user's own strings from backend
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        // Fetch recent strings from backend
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/my/recent`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('DEBUG: Backend response for recent strings:', data);

          const backendStrings = data.strings?.map((string: any) => ({
            id: string.id,
            content: string.content_text || 'No content',
            timestamp: new Date(string.created_at),
            user_id: string.user_id // Add user_id for debugging
          })) || [];

          console.log('DEBUG: Processed backend strings:', backendStrings);
          console.log('DEBUG: Current user ID:', user.id);

          // Double-check that all strings belong to current user
          const userStrings = backendStrings.filter(string => string.user_id === user.id);
          console.log('DEBUG: Filtered user strings:', userStrings);

          setRecentStrings(userStrings);
        } else {
          console.error('Failed to fetch recent strings:', response.status, response.statusText);
        }
      }

      // For now, skip recommendations since the table doesn't exist
      const connectedData: any[] = [];
      setConnectedStrings(connectedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Load user's connections and pending requests
  const loadConnections = async () => {
    if (!user?.id) return;

    try {
      setConnectionsLoading(true);

      // Load accepted connections
      const acceptedConnections = await connectionsService.getMyConnections('accepted');
      setConnections(acceptedConnections);

      // Load pending requests (both sent and received)
      const pending = await connectionsService.getPendingRequests();
      setPendingRequests(pending);

    } catch (error) {
      console.error('Error loading connections:', error);
      // Removed error toast to prevent user-facing error messages
    } finally {
      setConnectionsLoading(false);
    }
  };

  // Handle accepting/declining connection requests
  const handleConnectionResponse = async (requesterId: string, accept: boolean, requesterName: string) => {
    try {
      await connectionsService.respondToConnection(requesterId, accept);

      toast({
        title: accept ? "Connection Accepted!" : "Connection Declined",
        description: accept
          ? `You are now connected with ${requesterName}.`
          : `Connection request from ${requesterName} has been declined.`,
      });

      // Reload connections to update the UI
      await loadConnections();

    } catch (error) {
      console.error('Error responding to connection:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch community data (events, competitions, clubs, things to do)
  useEffect(() => {
    fetchCommunityData();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  // Fetch members
  useEffect(() => {
    fetchMembers();
  }, []);

  // Load connections when user changes
  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  // Fetch posts when user changes
  useEffect(() => {
    if (user?.id) {
      // Clear localStorage strings when user changes to prevent cross-contamination
      console.log('DEBUG: User changed, clearing localStorage and fetching posts for:', user.id);
      localStorage.removeItem('recentStrings');
      setRecentStrings([]); // Clear current strings
      fetchPosts();
    }
  }, [user?.id]);

  // Fetch club join requests
  useEffect(() => {
    const fetchClubJoinRequests = async () => {
      if (!user?.id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('club_join_requests').select('*').eq('user_id', user.id);
        if (error) {
          // Only log error if it's not a table not found error
          if (error.code !== 'PGRST116' && !error.message.includes('relation') && !error.message.includes('404')) {
            console.error('Error fetching club join requests:', error);
          }
          return;
        }
        setClubJoinRequests(data || []);
      } catch (error) {
        console.error('Error fetching club join requests:', error);
      }
    };
    fetchClubJoinRequests();
  }, [user?.id]);

  // Filter members based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.bio?.toLowerCase().includes(searchQuery.toLowerCase()) || member.interests?.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase())) || member.location?.toLowerCase().includes(searchQuery.toLowerCase()) || member.work?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  // Filter clubs based on search and location
  const filteredClubs = communityClubs.filter(club => {
    const matchesSearch = !clubSearchTerm.trim() || club.name.toLowerCase().includes(clubSearchTerm.toLowerCase()) || club.description?.toLowerCase().includes(clubSearchTerm.toLowerCase()) || club.category?.toLowerCase().includes(clubSearchTerm.toLowerCase());
    const matchesLocation = !clubLocationFilter.trim() || club.location?.toLowerCase().includes(clubLocationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  // Load font preference from localStorage
  useEffect(() => {
    const savedFont = localStorage.getItem('commonroom-font');
    if (savedFont) {
      setSelectedFont(savedFont);
    }
  }, []);

  // Load recent strings from localStorage on app start
  useEffect(() => {
    try {
      const savedStrings = localStorage.getItem('recentStrings');
      if (savedStrings) {
        const parsedStrings = JSON.parse(savedStrings);
        // Convert timestamp strings back to Date objects
        const stringsWithDates = parsedStrings.map((str: any) => ({
          ...str,
          timestamp: new Date(str.timestamp)
        }));
        setRecentStrings(stringsWithDates);
      }
    } catch (error) {
      console.error('Error loading recent strings from localStorage:', error);
    }
  }, []);

  // Load conversations from database when user logs in
  useEffect(() => {
    const loadConversationsFromDatabase = async () => {
      if (!user) return;

      try {
        console.log('DEBUG: Loading conversations for user:', user.id);

        // TODO: Fix strings table schema in Supabase
        // const { data: conversations, error } = await supabase
        //   .from('strings')
        //   .select('id, content_text, created_at, updated_at, user_id')
        //   .eq('user_id', user.id)
        //   .eq('stringable_type', 'ai_conversation')
        //   .order('updated_at', { ascending: false })
        //   .limit(10);

        // For now, use empty data to prevent errors
        const conversations = null;
        const error = null;

        if (error) {
          // Only log error if it's not a table not found error (404)
          if (error.code !== 'PGRST116' && !error.message.includes('relation "public.strings" does not exist')) {
            console.error('Error loading conversations from database:', error);
          }
          return;
        }

        console.log('DEBUG: Supabase conversations response:', conversations);

        if (conversations && conversations.length > 0) {
          // Double-check that all conversations belong to current user
          const userConversations = conversations.filter(conv => conv.user_id === user.id);
          console.log('DEBUG: Filtered user conversations:', userConversations);

          const dbStrings = userConversations.map(conv => ({
            id: conv.id,
            content: conv.content_text,
            timestamp: new Date(conv.updated_at || conv.created_at)
          }));

          // Merge with localStorage strings, prioritizing database
          setRecentStrings(prev => {
            const localIds = prev.map(s => s.id);
            const newStrings = dbStrings.filter(s => !localIds.includes(s.id));
            return [...dbStrings, ...prev.filter(s => !s.id.startsWith('conversation-'))].slice(0, 10);
          });
        }
      } catch (error) {
        // Only log error if it's not a network/table error
        if (!error.message?.includes('404') && !error.message?.includes('relation')) {
          console.error('Error loading conversations from database:', error);
        }
      }
    };

    loadConversationsFromDatabase();
  }, [user]);

  // Save font preference to localStorage
  useEffect(() => {
    localStorage.setItem('commonroom-font', selectedFont);
  }, [selectedFont]);

  // Save recent strings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('recentStrings', JSON.stringify(recentStrings));
    } catch (error) {
      console.error('Error saving recent strings:', error);
    }
  }, [recentStrings]);

  // Refresh timestamps every minute to keep them current
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRefresh(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchMembers = async () => {
    try {
      // Skip user_profiles table due to schema issues
      // Use mock data for now
      const membersData = [
        {
          id: 'mock-user-1',
          name: 'Community Member',
          bio: 'Passionate about learning and connecting with others',
          interests: ['reading', 'adventure', 'learning'],
          location: 'Campus',
          work: 'Student'
        },
        {
          id: 'sarah-johnson-demo',
          name: 'Sarah Johnson',
          bio: 'Passionate about technology and innovation. Love connecting with like-minded individuals.',
          interests: ['Tech', 'Music', 'Travel'],
          hobbies: ['Photography', 'Reading', 'Coffee'],
          location: 'San Francisco, CA',
          work: 'Software Engineer',
          age: 28
        }
      ];
      setMembers(membersData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchCommunityData = async () => {
    try {
      setLoading(true);

      // Fetch community events
      const {
        data: eventsData,
        error: eventsError
      } = await supabase.from('house_events').select('*').order('date', {
        ascending: true
      });
      if (eventsError) {
        // Only log error if it's not a table not found error
        if (eventsError.code !== 'PGRST116' && !eventsError.message.includes('relation') && !eventsError.message.includes('404')) {
          console.error('Error fetching community events:', eventsError);
        }
      } else {
        setCommunityEvents(eventsData || []);
      }

      // Fetch community competitions
      const {
        data: competitionsData,
        error: competitionsError
      } = await supabase.from('house_competitions').select('*').order('competition_date', {
        ascending: true
      });
      if (competitionsError) {
        // Only log error if it's not a table not found error
        if (competitionsError.code !== 'PGRST116' && !competitionsError.message.includes('relation') && !competitionsError.message.includes('404')) {
          console.error('Error fetching community competitions:', competitionsError);
        }
      } else {
        setCommunityCompetitions(competitionsData || []);
      }

      // Fetch community clubs
      const {
        data: clubsData,
        error: clubsError
      } = await supabase.from('house_clubs').select('*').order('created_at', {
        ascending: false
      });
      if (clubsError) {
        // Only log error if it's not a table not found error
        if (clubsError.code !== 'PGRST116' && !clubsError.message.includes('relation') && !clubsError.message.includes('404')) {
          console.error('Error fetching community clubs:', clubsError);
        }
      } else {
        setCommunityClubs(clubsData || []);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };
  const setupRealtimeSubscriptions = () => {
    // Subscribe to community events changes
    const eventsChannel = supabase.channel('community-events-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'house_events'
    }, () => {
      fetchCommunityData(); // Refetch data when changes occur
    }).subscribe();

    // Subscribe to community competitions changes
    const competitionsChannel = supabase.channel('community-competitions-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'house_competitions'
    }, () => {
      fetchCommunityData(); // Refetch data when changes occur
    }).subscribe();

    // Subscribe to community clubs changes
    const clubsChannel = supabase.channel('community-clubs-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'house_clubs'
    }, () => {
      fetchCommunityData(); // Refetch data when changes occur
    }).subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(competitionsChannel);
      supabase.removeChannel(clubsChannel);
    };
  };

  // Add useEffect to listen for house points updates
  useEffect(() => {
    const handlePointsUpdate = () => {
      // Force re-render of house points in sidebar
      setActiveSection(prev => prev); // Trigger re-render
    };
    window.addEventListener('housePointsUpdated', handlePointsUpdate);
    return () => {
      window.removeEventListener('housePointsUpdated', handlePointsUpdate);
    };
  }, []);
  const handleIdeaPost = () => {
    if (newPost.trim() && selectedPostType) {
      const newIdeaPost: Post = {
        id: ideaPostCounter,
        content: newPost,
        author: userName,
        timestamp: new Date(),
        type: selectedPostType,
        authorId: 'current-user' // This would be the actual user ID in a real app
      };
      setIdeaPosts(prev => [newIdeaPost, ...prev]);
      setIdeaPostCounter(prev => prev + 1);
      setNewPost('');
      setSelectedPostType(null);
      toast({
        title: `${selectedPostType.charAt(0).toUpperCase() + selectedPostType.slice(1)} posted!`,
        description: `Your ${selectedPostType} has been shared with your community.`
      });
    }
  };
  const handleRequestToJoinClub = async (clubId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to request to join a club",
        variant: "destructive"
      });
      return;
    }
    try {
      // Check if user already has a pending request
      const existingRequest = clubJoinRequests.find(req => req.club_id === clubId && req.status === 'pending');
      if (existingRequest) {
        toast({
          title: "Request already sent",
          description: "You already have a pending request for this club"
        });
        return;
      }
      const {
        error
      } = await supabase.from('club_join_requests').insert({
        user_id: user.id,
        club_id: clubId,
        house_id: 3,
        // Remove house filtering
        status: 'pending'
      });
      if (error) {
        console.error('Error creating club join request:', error);
        toast({
          title: "Error",
          description: "Failed to send join request. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      const newRequest = {
        club_id: clubId,
        status: 'pending',
        user_id: user.id
      };
      setClubJoinRequests(prev => [...prev, newRequest]);
      toast({
        title: "Request sent!",
        description: "Your request to join the club has been sent to the house head."
      });
    } catch (error) {
      console.error('Error in handleRequestToJoinClub:', error);
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleMessageUser = (author: string, authorId?: string) => {
    if (authorId && authorId !== 'current-user') {
      setMessagingRecipient({
        id: authorId,
        name: author
      });
      setCurrentView('messaging-system');
    } else {
      toast({
        title: "Message sent!",
        description: `Starting conversation with ${author}.`
      });
    }
  };
  const handleMessageMember = (member: Member) => {
    setMessagingRecipient({
      id: member.id,
      name: member.name
    });
    setCurrentView('messaging-system');
  };

  const handleViewMemberProfile = async (member: Member) => {
    // If viewing current user's profile, fetch their detailed profile data
    const isCurrentUser = user && member.id === user.id;
    let detailedProfile: any = null;

    if (isCurrentUser && user) {
      try {
        // Fetch detailed profile data from Supabase
        const { data, error } = await supabase
          .from('detailed_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          detailedProfile = data;
        }
      } catch (error) {
        console.log('Could not fetch detailed profile:', error);
      }
    }

    // Convert Member to Connection format for ViewProfile component
    const connectionProfile = {
      id: member.id,
      name: member.name,
      bio: detailedProfile?.bio || member.bio || '',
      location: detailedProfile?.location || member.location || '',
      work: detailedProfile?.work || member.work || '',
      interests: detailedProfile?.interests || member.interests || [],
      hobbies: detailedProfile?.hobbies || [],
      profileImage: detailedProfile?.profile_photo || '',
      profile_photo: detailedProfile?.profile_photo || '', // Add profile_photo field for ViewProfile
      photos: detailedProfile?.photos || [], // Add photos array for ViewProfile
      matchScore: 100,
      mutualInterests: member.interests || [],
      distance: '',
      lastActive: 'Active now',
      age: detailedProfile?.age || member.age,
      education: detailedProfile?.education || '',
      passions: detailedProfile?.passions || [],
      ambitions: detailedProfile?.ambitions || '',
      dreams: detailedProfile?.dreams || '',
      goals: detailedProfile?.goals || '',
      questions: detailedProfile?.questions || [],
      skills: detailedProfile?.skills || [],
      relationship_status: detailedProfile?.relationship_status || '',
      looking_for: detailedProfile?.looking_for || ''
    };
    setSelectedProfile(connectionProfile);
  };
  const handleJoinEvent = (eventTitle: string) => {
    toast({
      title: "Joined event!",
      description: `You've successfully joined "${eventTitle}".`
    });
  };
  const handleConnectFriend = (friendName: string, friendId?: string) => {
    if (friendId) {
      setMessagingRecipient({
        id: friendId,
        name: friendName
      });
      setCurrentView('messaging-system');
    } else {
      toast({
        title: "Connection sent!",
        description: `Friend request sent to ${friendName}.`
      });
    }
  };
  const handleJoinActivity = (activityTitle: string) => {
    toast({
      title: "Joined activity!",
      description: `You've joined "${activityTitle}".`
    });
  };
  const handleStartChallenge = (challengeTitle: string) => {
    toast({
      title: "Challenge started!",
      description: `You've started the "${challengeTitle}" challenge.`
    });
  };
  // AI Chat handlers
  const handleStringCreated = (stringData: any) => {
    toast({
      title: "String created!",
      description: `Created: ${stringData.title}`,
    });
    // Refresh strings or add to local state
    fetchPosts();
  };

  const handleConnectionFound = (userData: any) => {
    toast({
      title: "Connections found!",
      description: `Found ${userData.users?.length || 0} potential connections`,
    });
  };

  const handleJoinCreated = (joinData: any) => {
    toast({
      title: "Event created!",
      description: `Created: ${joinData.title}`,
    });
    // Refresh events or add to local state
    fetchCommunityData();
  };

  const handleSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      setIsLoading(true);
      const messageToSend = newPost;

      // Generate a string ID
      const stringId = `string-${Date.now()}`;

      // Add to recent strings
      const newString = {
        id: stringId,
        content: messageToSend,
        timestamp: new Date()
      };
      setRecentStrings(prev => [newString, ...prev.slice(0, 9)]); // Keep only 10 most recent

      // Clear input
      setNewPost('');

      // Navigate to string conversation page with initial message
      navigate(`/string/${stringId}`, {
        state: {
          initialMessage: messageToSend,
          selectedOrbColor: selectedOrbColor || '#3B82F6'
        }
      });

    } catch (error) {
      console.error('Error creating string:', error);
      toast({
        title: "Error",
        description: "Failed to create string. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStringFromChat = async (content: string) => {
    if (!content.trim() || !user) return;
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-string-prompt', {
        body: {
          prompt: content,
          userId: user.id,
          houseId: 3
        }
      });
      if (error) {
        console.error('Error calling analyze-string-prompt:', error);
        toast({
          title: "Error",
          description: "Failed to create string. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Refresh the strings lists
      await fetchPosts();
      toast({
        title: "String created!",
        description: `Your string has been created and we found ${data.recommendationCount || 0} potential matches.`
      });
    } catch (error) {
      console.error('Error in handleCreateStringFromChat:', error);
      toast({
        title: "Error",
        description: "Failed to create string. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getWelcomeTextColor = (houseName: string) => {
    const lightColorHouses = ["Tolkien"];
    return lightColorHouses.includes(houseName) ? "text-gray-900" : "text-white";
  };

  const getTimeAgo = (timestamp: Date) => {
    // Force a fresh Date object to avoid caching issues
    const now = new Date(Date.now());
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    // Add cache-busting comment to force re-evaluation
    const cacheBuster = timeRefresh; // This forces re-render when timeRefresh changes

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };
  const sidebarItems = [{
    id: 'ideas',
    label: 'Strings',
    icon: Lightbulb
  }, {
    id: 'connections',
    label: 'Connections',
    icon: Users
  }, {
    id: 'connected-strings',
    label: 'Connected Strings',
    icon: MessageSquare
  }];
  const houseSidebarItems = [{
    id: 'about-house',
    label: 'Your Profile',
    icon: Home
  }, {
    id: 'customize',
    label: 'Customize',
    icon: Edit3
  }, {
    id: 'housemates',
    label: 'My Connections',
    icon: Users
  }];
  const getHouseCrest = (houseName: string) => {
    const crestStyle = "w-12 h-12 object-contain";
    switch (houseName) {
      case "Arc":
        return <img src="/lovable-uploads/56b652af-eb00-49a3-a5c6-7df3e0b71eda.png" alt="Arc house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Nightingale":
        return <img src="/lovable-uploads/4a0629e9-2dde-4d8d-bb95-4bef08c2fd6e.png" alt="Nightingale house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Franklin":
        return <img src="/lovable-uploads/91f36da6-03c8-49a4-b6d1-639749057610.png" alt="Franklin house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Frank":
        return <img src="/lovable-uploads/19e047b2-b1a9-4e0d-a9fa-454b57062def.png" alt="Frank house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "King":
        return <img src="/lovable-uploads/2e1c8044-bd36-4181-99f6-7e73c35d753f.png" alt="King house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Newton":
        return <img src="/lovable-uploads/37d5f54b-7829-400a-9b79-074f74c9c829.png" alt="Newton house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Twain":
        return <img src="/lovable-uploads/c349e814-7d9e-4400-bdc3-792427b6d5bc.png" alt="Twain house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Tolkien":
        return <img src="/lovable-uploads/1bf88aad-0588-4e4d-ab4d-1915cca3d28c.png" alt="Tolkien house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      case "Lincoln":
        return <img src="/lovable-uploads/25eef36a-0601-4e5c-8264-e41537a27385.png" alt="Lincoln house crest" className={crestStyle} style={{
          filter: 'drop-shadow(0 0 0 transparent)'
        }} />;
      default:
        return <span className="text-lg font-bold">🏠</span>;
    }
  };
  const renderHouseInformationContent = () => {
    switch (activeSection) {
      case 'about-house':
        return <div className="space-y-8">
            {/* Profile Header */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <Avatar className="h-32 w-32 ring-4 ring-gray-200">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl font-light tracking-wide">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingProfile && (
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      {isEditingProfile ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-3xl font-light border-0 p-0 text-gray-900 tracking-wide"
                          placeholder="Your name"
                        />
                      ) : (
                        <h1 className="text-3xl font-light text-gray-900 tracking-wide">{profileData.name}</h1>
                      )}
                      
                      <Button
                        onClick={isEditingProfile ? handleProfileSave : () => setIsEditingProfile(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-light tracking-wide rounded-full px-6"
                      >
                        {isEditingProfile ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Profile
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {isEditingProfile ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="font-light text-gray-600 border-0 p-0 resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-600 font-light leading-relaxed text-lg">
                        {profileData.bio || "Add a bio to tell others about yourself"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-wide text-gray-900">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      {isEditingProfile ? (
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Your location"
                          className="font-light"
                        />
                      ) : (
                        <span className="text-gray-600 font-light">{profileData.location || "Add location"}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      {isEditingProfile ? (
                        <Input
                          type="date"
                          value={profileData.birthday}
                          onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
                          className="font-light"
                        />
                      ) : (
                        <span className="text-gray-600 font-light">{profileData.birthday || "Add birthday"}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      {isEditingProfile ? (
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Your email"
                          className="font-light"
                        />
                      ) : (
                        <span className="text-gray-600 font-light">{profileData.email || "Add email"}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      {isEditingProfile ? (
                        <Input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Your phone"
                          className="font-light"
                        />
                      ) : (
                        <span className="text-gray-600 font-light">{profileData.phone || "Add phone"}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passions & Hobbies */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-wide text-gray-900">Passions & Hobbies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Passions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Passions</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(profileData.passions || []).map((passion, index) => (
                        <Badge key={index} variant="secondary" className="font-light bg-red-100 text-red-700">
                          {passion}
                          {isEditingProfile && (
                            <button
                              onClick={() => removePassion(passion)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditingProfile && (
                      <div className="flex space-x-2">
                        <Input
                          value={newPassion}
                          onChange={(e) => setNewPassion(e.target.value)}
                          placeholder="Add passion"
                          className="font-light"
                          onKeyPress={(e) => e.key === 'Enter' && addPassion()}
                        />
                        <Button onClick={addPassion} size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Hobbies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Hobbies</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(profileData.hobbies || []).map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="font-light bg-green-100 text-green-700">
                          {hobby}
                          {isEditingProfile && (
                            <button
                              onClick={() => removeHobby(hobby)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditingProfile && (
                      <div className="flex space-x-2">
                        <Input
                          value={newHobby}
                          onChange={(e) => setNewHobby(e.target.value)}
                          placeholder="Add hobby"
                          className="font-light"
                          onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                        />
                        <Button onClick={addHobby} size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-wide text-gray-900">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    {isEditingProfile ? (
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="Your website"
                        className="font-light"
                      />
                    ) : (
                      <span className="text-gray-600 font-light">{profileData.website || "Add website"}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 text-gray-400">📷</div>
                    {isEditingProfile ? (
                      <Input
                        value={profileData.instagram}
                        onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="Instagram username"
                        className="font-light"
                      />
                    ) : (
                      <span className="text-gray-600 font-light">{profileData.instagram || "Add Instagram"}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 text-gray-400">🐦</div>
                    {isEditingProfile ? (
                      <Input
                        value={profileData.twitter}
                        onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="Twitter username"
                        className="font-light"
                      />
                    ) : (
                      <span className="text-gray-600 font-light">{profileData.twitter || "Add Twitter"}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 text-gray-400">💼</div>
                    {isEditingProfile ? (
                      <Input
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="LinkedIn profile"
                        className="font-light"
                      />
                    ) : (
                      <span className="text-gray-600 font-light">{profileData.linkedin || "Add LinkedIn"}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-wide text-gray-900">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="font-light">
                        {interest}
                        {isEditingProfile && (
                          <button
                            onClick={() => removeInterest(interest)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditingProfile && (
                    <div className="flex space-x-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add interest"
                        className="font-light"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button onClick={addInterest} size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-wide text-gray-900">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="font-light">
                        {skill}
                        {isEditingProfile && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditingProfile && (
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill"
                        className="font-light"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-light tracking-wide text-gray-900">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Education</label>
                  {isEditingProfile ? (
                    <Textarea
                      value={profileData.education}
                      onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                      placeholder="Your educational background"
                      className="font-light"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600 font-light">{profileData.education || "Add education information"}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Work</label>
                  {isEditingProfile ? (
                    <Textarea
                      value={profileData.work}
                      onChange={(e) => setProfileData(prev => ({ ...prev, work: e.target.value }))}
                      placeholder="Your work experience"
                      className="font-light"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600 font-light">{profileData.work || "Add work information"}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Looking For</label>
                  {isEditingProfile ? (
                    <Textarea
                      value={profileData.lookingFor}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lookingFor: e.target.value }))}
                      placeholder="What are you looking for on LifeString?"
                      className="font-light"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600 font-light">{profileData.lookingFor || "What are you looking for on LifeString?"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>;
      case 'house-leaders':
        return <div>
            <h1 className="text-3xl font-light text-gray-900 mb-8 tracking-wide">House Leaders</h1>
            <div className="text-center py-16">
              <Crown className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-500 mb-3 font-light text-lg">No house leaders assigned yet</p>
              <p className="text-gray-400 font-light">House leaders will be selected by the community</p>
            </div>
          </div>;
      case 'housemates':
        return <div className="w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-gray-900 mb-2">My Connections</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                People you've connected with on Lifestring. Start conversations and build meaningful relationships.
              </p>
            </div>

            {connectionsLoading ? (
              <div className="text-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading connections...</p>
              </div>
            ) : (
              <>
                {/* Pending Connection Requests */}
                {pendingRequests.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">Pending Requests</h2>
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                        <Card
                          key={request.id}
                          className="border-0 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Profile Image - Match ConnectionsInterface style */}
                              <div className="relative flex-shrink-0">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                                    {request.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Online Status Indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                              </div>

                              {/* Profile Content - Match ConnectionsInterface exactly */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {request.name}
                                      </h3>
                                      <span className="text-gray-500 text-sm">• Wants to connect</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                      {request.bio || 'Wants to connect with you on Lifestring'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Requested {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex-shrink-0 flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-50 border-green-600 text-green-600 hover:bg-green-100 px-3 py-1 font-black"
                                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      onClick={() => handleConnectionResponse(request.id, true, request.name)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-red-50 border-red-600 text-red-600 hover:bg-red-100 px-3 py-1 font-black"
                                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      onClick={() => handleConnectionResponse(request.id, false, request.name)}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Connections */}
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    My Connections {connections.length > 0 && `(${connections.length})`}
                  </h2>

                  {connections.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                      <p className="text-gray-500 mb-3 font-light text-lg">No connections yet</p>
                      <p className="text-gray-400 font-light">Start connecting with people to build your network</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connections.map((connection) => (
                        <Card
                          key={connection.id}
                          className="border-0 bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                          onClick={(e) => {
                            // If clicking on the message area, handle message, otherwise view profile
                            const target = e.target as HTMLElement;
                            if (target.closest('.message-action')) {
                              e.stopPropagation();
                              // handleMessageMember(connection);
                            } else {
                              // View profile functionality - convert Connection to Member format
                              const memberProfile = {
                                id: connection.id,
                                name: connection.name,
                                bio: connection.bio || '',
                                location: connection.location || '',
                                work: connection.work || '',
                                interests: connection.interests || [],
                                profileImage: connection.profileImage || ''
                              };
                              handleViewMemberProfile(memberProfile);
                            }
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Profile Image - Circular */}
                              <div className="relative flex-shrink-0">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                                    {connection.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Online Status Indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>

                              {/* Profile Content - Match ConnectionsInterface exactly */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                        {connection.name}
                                      </h3>
                                      <span className="text-gray-500 text-sm">• Connected</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                      {connection.bio || 'Connected on Lifestring. Start a conversation!'}
                                    </p>

                                    {/* Interest Tags - Clean and Simple */}
                                    <div className="flex flex-wrap gap-2">
                                      {(connection.interests || []).slice(0, 3).map((interest, index) => (
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

                                  {/* Message Button - Clean Minimal Design */}
                                  <div className="flex-shrink-0 message-action">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white border-black text-black hover:bg-gray-50 px-4 py-2 font-black"
                                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Message
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>;
      case 'locations-map':
        return <div>
            <h1 className="text-3xl font-light text-gray-900 mb-8 tracking-wide">Franklin Locations</h1>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center">
              <MapPin className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-light text-gray-700 mb-4 tracking-wide">Interactive Map Coming Soon</h3>
              <p className="text-gray-500 mb-6 font-light">Explore special locations for Franklin members</p>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 font-light mb-3">This will show a map with:</p>
                <ul className="text-sm text-gray-600 space-y-2 font-light">
                  <li>• House meeting locations</li>
                  <li>• Recommended study spots</li>
                  <li>• Social gathering places</li>
                  <li>• House events venues</li>
                </ul>
              </div>
            </div>
          </div>;
      case 'customize':
        return <div>
            <h1 className="text-3xl font-light text-gray-900 mb-8 tracking-wide">Customize</h1>
            <p className="text-gray-600 mb-8 font-light text-lg">Personalize the look of your page</p>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Background Colors</h3>
                <p className="text-gray-600 mb-6 font-light">Choose from any of the eleven community colors</p>
                
                 <div className="grid grid-cols-4 gap-4">
                  {(() => {
                  const allHouseColors = [{
                    color: '#FFD700',
                    name: 'Lincoln',
                    house: 'Lincoln Gold'
                  }, {
                    color: '#4169E1',
                    name: 'Arc',
                    house: 'Arc Blue'
                  }, {
                    color: '#DC143C',
                    name: 'Franklin',
                    house: 'Franklin Red'
                  }, {
                    color: '#228B22',
                    name: 'Nightingale',
                    house: 'Nightingale Green'
                  }, {
                    color: '#800020',
                    name: 'King',
                    house: 'King Crimson'
                  }, {
                    color: '#87CEEB',
                    name: 'Newton',
                    house: 'Newton Sky'
                  }, {
                    color: '#FF69B4',
                    name: 'Twain',
                    house: 'Twain Pink'
                  }, {
                    color: '#F5DEB3',
                    name: 'Tolkien',
                    house: 'Tolkien Cream'
                  }, {
                    color: '#9370DB',
                    name: 'Frank',
                    house: 'Frank Purple'
                  }, {
                    color: '#FF8C00',
                    name: 'Ember',
                    house: 'Ember Orange'
                  }, {
                    color: '#1F1F1F',
                    name: 'Shadow',
                    house: 'Shadow Black'
                  }, {
                    color: 'CLEAN',
                    name: 'Clean',
                    house: 'Clean Background'
                  }];
                  const handleColorSelection = (colorOption: typeof allHouseColors[0]) => {
                    setSelectedBackgroundColor(colorOption.color);
                    setSelectedOrbColor(colorOption.color);
                  };
                  return allHouseColors.map((colorOption, index) => <button key={index} onClick={() => handleColorSelection(colorOption)} className={`w-16 h-16 rounded-full border-4 transition-all hover:scale-105 relative overflow-hidden bg-background/20 ${selectedBackgroundColor === colorOption.color ? 'border-foreground ring-2 ring-muted-foreground' : 'border-border hover:border-muted-foreground'}`}>
                       {/* Different rendering for clean vs colored options */}
                       {colorOption.color === 'CLEAN' ?
                    // Clean background preview - elegant gradient
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div> :
                    // Cloudy orb effect - multiple floating orbs
                    <div className="absolute inset-0 pointer-events-none">
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(2px)',
                        opacity: 0.8,
                        width: '16px',
                        height: '16px',
                        top: '8%',
                        left: '12%'
                      }} />
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(1px)',
                        opacity: 0.6,
                        width: '14px',
                        height: '14px',
                        top: '25%',
                        right: '15%'
                      }} />
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(3px)',
                        opacity: 0.7,
                        width: '18px',
                        height: '18px',
                        bottom: '20%',
                        left: '25%'
                      }} />
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(2px)',
                        opacity: 0.5,
                        width: '12px',
                        height: '12px',
                        top: '55%',
                        left: '50%'
                      }} />
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(1px)',
                        opacity: 0.4,
                        width: '10px',
                        height: '10px',
                        bottom: '10%',
                        right: '20%'
                      }} />
                           <div className="absolute rounded-full transition-all duration-300 ease-in-out" style={{
                        backgroundColor: colorOption.color,
                        filter: 'blur(2px)',
                        opacity: 0.6,
                        width: '15px',
                        height: '15px',
                        top: '40%',
                        right: '8%'
                      }} />
                         </div>}
                    </button>);
                })()}
                </div>
                
                {selectedBackgroundColor && <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-light">
                      Background color selected! Your personal background will now feature this color.
                    </p>
                  </div>}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
                <p className="text-gray-600 mb-6 font-light">Choose a font style for your page</p>
                
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 max-h-60">
                    <SelectItem value="sans" className="font-sans">Montserrat (Default)</SelectItem>
                    <SelectItem value="inter" className="font-inter">Inter</SelectItem>
                    <SelectItem value="poppins" className="font-poppins">Poppins</SelectItem>
                    <SelectItem value="roboto" className="font-roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans" className="font-open-sans">Open Sans</SelectItem>
                    <SelectItem value="lato" className="font-lato">Lato</SelectItem>
                    <SelectItem value="source-sans-pro" className="font-source-sans-pro">Source Sans Pro</SelectItem>
                    <SelectItem value="nunito" className="font-nunito">Nunito</SelectItem>
                    <SelectItem value="raleway" className="font-raleway">Raleway</SelectItem>
                    <SelectItem value="work-sans" className="font-work-sans">Work Sans</SelectItem>
                    <SelectItem value="dm-sans" className="font-dm-sans">DM Sans</SelectItem>
                    <SelectItem value="plus-jakarta-sans" className="font-plus-jakarta-sans">Plus Jakarta Sans</SelectItem>
                    <SelectItem value="playfair-display" className="font-playfair-display">Playfair Display</SelectItem>
                    <SelectItem value="merriweather" className="font-merriweather">Merriweather</SelectItem>
                    <SelectItem value="lora" className="font-lora">Lora</SelectItem>
                    <SelectItem value="source-serif-pro" className="font-source-serif-pro">Source Serif Pro</SelectItem>
                    <SelectItem value="crimson-text" className="font-crimson-text">Crimson Text</SelectItem>
                    <SelectItem value="libre-baskerville" className="font-libre-baskerville">Libre Baskerville</SelectItem>
                    <SelectItem value="serif" className="font-serif">Crimson Pro</SelectItem>
                    <SelectItem value="eb-garamond" className="font-eb-garamond">EB Garamond</SelectItem>
                    <SelectItem value="oswald" className="font-oswald">Oswald</SelectItem>
                    <SelectItem value="bebas-neue" className="font-bebas-neue">Bebas Neue</SelectItem>
                    <SelectItem value="righteous" className="font-righteous">Righteous</SelectItem>
                    <SelectItem value="fredoka-one" className="font-fredoka-one">Fredoka One</SelectItem>
                    <SelectItem value="lobster" className="font-lobster">Lobster</SelectItem>
                    <SelectItem value="dancing-script" className="font-dancing-script">Dancing Script</SelectItem>
                    <SelectItem value="jetbrains-mono" className="font-jetbrains-mono">JetBrains Mono</SelectItem>
                    <SelectItem value="source-code-pro" className="font-source-code-pro">Source Code Pro</SelectItem>
                    <SelectItem value="fira-code" className="font-fira-code">Fira Code</SelectItem>
                    <SelectItem value="space-mono" className="font-space-mono">Space Mono</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedFont !== 'sans' && <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-light">
                      Font selected! Your page typography will now use this font.
                    </p>
                  </div>}
              </CardContent>
            </Card>
          </div>;
      default:
        return null;
    }
  };

  // Show Messages component
  if (currentView === 'messages') {
    return <Messages onBack={() => setCurrentView('common-room')} userName={userName} />;
  }

  // Show Profile component
  if (currentView === 'profile') {
    return <Profile onBack={() => setCurrentView('common-room')} userName={userName} selectedOrbColor={selectedOrbColor} />;
  }

  // Show Edit Profile component
  if (currentView === 'edit-profile') {
    return <EditableProfile onBack={() => setCurrentView('common-room')} userName={userName} selectedOrbColor={selectedOrbColor} />;
  }

  // Show Messaging System component
  if (currentView === 'messaging-system') {
    return <MessagingSystem recipientId={messagingRecipient?.id} recipientName={messagingRecipient?.name} onBack={() => {
      setCurrentView('common-room');
      setMessagingRecipient(null);
    }} />;
  }

  // Merchandise categories
  const merchandiseCategories: MerchandiseCategory[] = [{
    id: 'tshirts',
    name: 'T-shirts',
    image: '/lovable-uploads/b631c76e-e2ed-4cc8-a75b-d96912f65349.png',
    description: `Franklin branded t-shirts`
  }, {
    id: 'polo',
    name: 'Polo Shirts',
    image: '/lovable-uploads/b631c76e-e2ed-4cc8-a75b-d96912f65349.png',
    description: `Professional Franklin polo shirts`
  }, {
    id: 'sweatshirts',
    name: 'Sweatshirts & Hoodies',
    image: '/lovable-uploads/b631c76e-e2ed-4cc8-a75b-d96912f65349.png',
    description: `Cozy Franklin sweatshirts and hoodies`
  }];
  const {
    baseStyle,
    cloudOrbs
  } = getCommunityBackground("Franklin", ["#dc2626", "#ef4444"], selectedOrbColor);

  // Generate dynamic color for UI elements
  const getDynamicColor = (baseColor: string) => {
    return selectedOrbColor || baseColor;
  };
  // Show profile view if a profile is selected
  if (selectedProfile) {
    return (
      <ViewProfile
        user={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        isConnected={true} // Assume connected since they're in "My Connections"
      />
    );
  }

  return <div style={baseStyle} className={`font-${selectedFont}`}>
      {/* Floating cloud orbs background */}
      {cloudOrbs.map((orb, index) => <div key={index} className={`absolute rounded-full ${orb.className}`} style={{
      backgroundColor: selectedOrbColor || orb.backgroundColor,
      borderRadius: '50%',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      ...orb.style
    }} />)}
      
      {/* Content wrapper with backdrop blur for readability */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-white/5">
      {/* Header */}
      <div className="w-full flex">
        {/* Left Sidebar */}
        <aside className="w-80 min-h-screen bg-white/80 backdrop-blur-sm border-r border-gray-200 p-8">
          {/* House Information */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">YOUR INFORMATION</h4>
            <div className="space-y-2">
              {houseSidebarItems.map(item => <button key={item.id} onClick={() => {
                  if (item.id === 'about-house') {
                    setCurrentView('edit-profile');
                  } else {
                    setActiveSection(item.id);
                  }
                }} className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all font-light tracking-wide ${activeSection === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50/80'}`}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>)}
            </div>
          </div>

          {/* Recent Strings Section */}
          <div className="-mx-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider px-6">RECENT STRINGS</h4>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {recentStrings.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-xs text-gray-500 font-light">No recent strings yet.</p>
                    <p className="text-xs text-gray-400 font-light mt-1">Start typing to create your first string!</p>
                  </div>
                ) : (
                  recentStrings.map((string) => (
                    <button
                      key={string.id}
                      onClick={() => {
                        // Load conversation into StringsInterface instead of navigating
                        setLoadConversation(string);
                        setActiveSection('ideas'); // Make sure we're on the Strings tab
                      }}
                      className="w-full flex items-start p-3 bg-gray-50/60 rounded-lg border border-gray-200/50 hover:bg-gray-100/60 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-light leading-relaxed">
                          {string.content.length > 60 ? `${string.content.substring(0, 60)}...` : string.content}
                        </p>
                        <span className="text-xs text-gray-400 font-light" key={`${string.id}-${timeRefresh}`}>
                          {getTimeAgo(string.timestamp)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Search Bar and Icons */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search for events, strings, or connections" className="pl-10 bg-gray-50/80 border-gray-200 rounded-full font-light tracking-wide" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" onClick={() => setCurrentView('messaging-system')}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" onClick={() => setCurrentView('edit-profile')}>
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 px-3 py-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Common Room Navigation - Always visible at top */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-3">
              {sidebarItems.map(item => <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-light tracking-wide transition-all text-gray-700 hover:bg-gray-100 ${activeSection === item.id ? 'ring-1 ring-offset-1' : ''}`} style={{
                '--tw-ring-color': activeSection === item.id ? `${selectedOrbColor || "#dc2626"}50` : 'transparent'
              } as React.CSSProperties}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>)}
            </div>
          </div>

          {['about-house', 'customize', 'housemates', 'locations-map'].includes(activeSection) ? renderHouseInformationContent() : <>

              {/* Section Content */}
              {activeSection === 'ideas' && <>
                  <StringsInterface
                    selectedOrbColor={selectedOrbColor}
                    onStringCreated={handleStringCreated}
                    recentStrings={recentStrings}
                    setRecentStrings={setRecentStrings}
                    loadConversation={loadConversation}
                    onConversationLoaded={() => setLoadConversation(null)}
                  />
                </>}

              {activeSection === 'connections' && <>
                  <ConnectionsInterface
                    selectedOrbColor={selectedOrbColor}
                    onMessage={(userId, userName) => {
                      setMessagingRecipient({ id: userId, name: userName });
                      setCurrentView('messaging-system');
                    }}
                  />
                </>}



              {activeSection === 'connected-strings' && <>
                  <div className="w-full">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Connected Strings</span>
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Connected Strings */}
                      <Card className="border border-gray-200 bg-gray-50">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">Connected Strings</p>
                            <p className="text-gray-400 text-sm">
                              Strings you've connected with other users will appear here
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      {connectedStrings.length > 0 ? (
                        <div className="space-y-3">
                          {connectedStrings.map((string) => (
                            <Card key={string.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-gray-800 text-sm leading-relaxed">{string.content}</p>
                                    <p className="text-gray-500 text-xs mt-2">
                                      Connected with {string.connectedUser} • {string.timestamp.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 text-sm">No connected strings yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>}





              {activeSection === 'clubs' && <>
                  <div className="mb-8">
                    <div>
                      <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-wide">Clubs</h1>
                      <p className="text-gray-600 font-light text-lg mb-6">Join clubs and special interest groups within your house</p>
                      
                      {/* Search and Filter Bars */}
                      <div className="space-y-4 mb-6">
                        <Input placeholder="Search clubs by name or description..." value={clubSearchTerm} onChange={e => setClubSearchTerm(e.target.value)} className="w-full" />
                        <Input placeholder="Filter by location (e.g., Salt Lake City, Palm Beach)..." value={clubLocationFilter} onChange={e => setClubLocationFilter(e.target.value)} className="w-full" />
                      </div>
                    </div>
                  </div>

                  {loading ? <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-500 font-light">Loading clubs...</p>
                    </div> : filteredClubs.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredClubs.map(club => <Card key={club.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-medium text-gray-900 mb-2">{club.name}</h3>
                                {club.description && <p className="text-gray-600 font-light mb-3">{club.description}</p>}
                                
                                <div className="space-y-2 mb-4">
                                  {club.category && <div className="flex items-center text-sm text-gray-500">
                                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                                        {club.category}
                                      </span>
                                    </div>}
                                  {club.meeting_time && <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 mr-2" />
                                      {club.meeting_time}
                                    </div>}
                                  {club.location && <div className="flex items-center text-sm text-gray-500">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {club.location}
                                    </div>}
                                  {club.max_members && <div className="flex items-center text-sm text-gray-500">
                                      <Users className="h-4 w-4 mr-2" />
                                      {club.current_members || 0}/{club.max_members} members
                                    </div>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <Button onClick={() => handleRequestToJoinClub(club.id)} style={{
                        backgroundColor: "#dc2626"
                      }} className="text-white font-light tracking-wide hover:opacity-90 transition-opacity" size="sm" disabled={clubJoinRequests.some(req => req.club_id === club.id && req.status === 'pending')}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                {clubJoinRequests.some(req => req.club_id === club.id && req.status === 'pending') ? 'Request Sent' : 'Request to Join'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div> : <div className="text-center py-16">
                      <UsersRound className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                      <p className="text-gray-500 mb-3 font-light text-lg">No clubs created yet</p>
                      <p className="text-gray-400 font-light">Be the first to start a club for your house community!</p>
                    </div>}
                </>}
            </>}
        </main>
      </div>


      </div>


    </div>;
};
export default CommonRoom;