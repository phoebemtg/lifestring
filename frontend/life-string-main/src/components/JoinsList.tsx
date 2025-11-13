import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import JoinCard from './JoinCard';
import CreateJoinModal from './CreateJoinModal';
import { useToast } from "@/hooks/use-toast";

interface Join {
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
}

interface JoinsListProps {
  className?: string;
}

const JoinsList: React.FC<JoinsListProps> = ({ className = "" }) => {
  const { toast } = useToast();
  const [joins, setJoins] = useState<Join[]>([]);
  const [filteredJoins, setFilteredJoins] = useState<Join[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample joins data for demo
  const sampleJoins: Join[] = [
    {
      id: '1',
      title: 'Weekend Hiking Adventure - Mount Tamalpais',
      description: 'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers.',
      location: 'Mount Tamalpais State Park, CA',
      duration: '4 hours',
      max_participants: 8,
      current_participants: 3,
      difficulty: 'intermediate',
      tags: ['hiking', 'mountain', 'weekend', 'bay area', 'nature', 'outdoors'],
      is_joined: false,
      match_score: 85,
      created_at: '2024-11-13T10:00:00Z'
    },
    {
      id: '2',
      title: 'Italian Pasta Making Class',
      description: 'Learn to make authentic Italian pasta from scratch! We\'ll cover different pasta shapes, sauces, and techniques.',
      location: 'Community Kitchen, San Francisco',
      duration: '3 hours',
      max_participants: 12,
      current_participants: 7,
      difficulty: 'beginner',
      tags: ['cooking', 'italian', 'pasta', 'food', 'learning', 'hands-on'],
      is_joined: false,
      match_score: 92,
      created_at: '2024-11-12T15:30:00Z'
    },
    {
      id: '3',
      title: 'Golden Gate Bridge Photography Walk',
      description: 'Capture stunning photos of the Golden Gate Bridge from the best viewpoints! We\'ll explore different angles and lighting.',
      location: 'Crissy Field, San Francisco',
      duration: '2 hours',
      max_participants: 15,
      current_participants: 9,
      difficulty: 'beginner',
      tags: ['photography', 'golden gate', 'bridge', 'sunset', 'walking', 'sightseeing'],
      is_joined: true,
      match_score: 78,
      created_at: '2024-11-11T14:00:00Z'
    },
    {
      id: '4',
      title: 'Beach Volleyball Tournament',
      description: 'Friendly beach volleyball tournament at Ocean Beach! All skill levels welcome. We\'ll form teams and play multiple matches.',
      location: 'Ocean Beach, San Francisco',
      duration: '3 hours',
      max_participants: 20,
      current_participants: 14,
      difficulty: 'beginner',
      tags: ['volleyball', 'beach', 'sports', 'tournament', 'team', 'ocean beach'],
      is_joined: false,
      match_score: 67,
      created_at: '2024-11-10T12:00:00Z'
    },
    {
      id: '5',
      title: 'Indoor Rock Climbing Session',
      description: 'Try indoor rock climbing at the local climbing gym! Perfect for beginners - we\'ll teach you the basics and provide all equipment.',
      location: 'Mission Cliffs, San Francisco',
      duration: '2 hours',
      max_participants: 6,
      current_participants: 4,
      difficulty: 'beginner',
      tags: ['climbing', 'bouldering', 'fitness', 'indoor', 'beginner', 'workout'],
      is_joined: false,
      match_score: 73,
      created_at: '2024-11-09T18:30:00Z'
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setJoins(sampleJoins);
    setFilteredJoins(sampleJoins);
  }, []);

  useEffect(() => {
    // Filter joins based on search and filters
    let filtered = joins;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(join => 
        join.title.toLowerCase().includes(search) ||
        join.description?.toLowerCase().includes(search) ||
        join.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        join.location?.toLowerCase().includes(search)
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(join => join.difficulty === difficultyFilter);
    }

    if (locationFilter) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter(join => 
        join.location?.toLowerCase().includes(location)
      );
    }

    // Sort by match score (highest first) and then by creation date (newest first)
    filtered.sort((a, b) => {
      if (a.match_score !== b.match_score) {
        return (b.match_score || 0) - (a.match_score || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredJoins(filtered);
  }, [joins, searchTerm, difficultyFilter, locationFilter]);

  const handleJoin = (joinId: string) => {
    setJoins(prev => prev.map(join => 
      join.id === joinId 
        ? { 
            ...join, 
            is_joined: true, 
            current_participants: (join.current_participants || 1) + 1 
          }
        : join
    ));
    
    const join = joins.find(j => j.id === joinId);
    toast({
      title: "Joined!",
      description: `You've successfully joined "${join?.title}". Check your messages for details!`,
    });
  };

  const handleViewDetails = (joinId: string) => {
    const join = joins.find(j => j.id === joinId);
    toast({
      title: "Join Details",
      description: `Viewing details for "${join?.title}". Full details view coming soon!`,
    });
  };

  const handleJoinCreated = (newJoin: any) => {
    const join: Join = {
      id: Date.now().toString(),
      title: newJoin.title,
      description: newJoin.description,
      location: newJoin.location,
      duration: newJoin.duration,
      max_participants: newJoin.max_participants,
      current_participants: 1,
      difficulty: newJoin.difficulty,
      tags: newJoin.tags,
      is_joined: true,
      match_score: 100,
      created_at: new Date().toISOString()
    };
    
    setJoins(prev => [join, ...prev]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Joins</h1>
          <p className="text-gray-600 font-light">Discover activities and connect with like-minded people</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Join
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search joins by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full sm:w-[200px]"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {filteredJoins.length} {filteredJoins.length === 1 ? 'join' : 'joins'} found
      </div>

      {/* Joins Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading joins...</p>
        </div>
      ) : filteredJoins.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No joins found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || difficultyFilter !== 'all' || locationFilter
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a join and start connecting!'}
          </p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
          >
            Create the First Join
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJoins.map((join) => (
            <JoinCard
              key={join.id}
              join={join}
              onJoin={handleJoin}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create Join Modal */}
      <CreateJoinModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onJoinCreated={handleJoinCreated}
      />
    </div>
  );
};

export default JoinsList;
