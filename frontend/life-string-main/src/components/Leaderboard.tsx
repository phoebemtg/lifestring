import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: number;
  name: string;
  colors: [string, string];
}

interface CommunityPoints {
  house_id: number;
  house_name: string;
  total_points: number;
  position: number;
}

interface LeaderboardProps {
  communities: Community[];
  userCommunityId?: number;
}

const Leaderboard = ({ communities, userCommunityId }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<CommunityPoints[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      // Get all point transactions and calculate totals
      const { data: transactions, error } = await supabase
        .from('house_points_transactions')
        .select('house_id, points_change');

      if (error) throw error;

      // Calculate total points for each community
      const communityPointsMap = new Map<number, number>();
      
      // Initialize all communities with 0 points
      communities.forEach(community => {
        communityPointsMap.set(community.id, 0);
      });

      // Sum up points from transactions
      transactions?.forEach(transaction => {
        const currentPoints = communityPointsMap.get(transaction.house_id) || 0;
        communityPointsMap.set(transaction.house_id, currentPoints + transaction.points_change);
      });

      // Create leaderboard array
      const leaderboardData = communities.map(community => ({
        house_id: community.id,
        house_name: community.name,
        total_points: communityPointsMap.get(community.id) || 0,
        position: 0
      }));

      // Sort by points (descending) and assign positions
      leaderboardData.sort((a, b) => b.total_points - a.total_points);
      leaderboardData.forEach((community, index) => {
        community.position = index + 1;
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Listen for real-time updates
    const handlePointsUpdate = () => {
      fetchLeaderboard();
    };

    window.addEventListener('housePointsUpdated', handlePointsUpdate);

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('house_points_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'house_points_transactions'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('housePointsUpdated', handlePointsUpdate);
      supabase.removeChannel(channel);
    };
  }, [communities]);

  const getCommunityColors = (communityName: string) => {
    const community = communities.find(h => h.name === communityName);
    return community ? community.colors : ['#gray-500', '#gray-600'];
  };

  const getCommunityCrest = (communityName: string) => {
    const crestStyle = "w-6 h-6 object-contain";
    
    switch (communityName) {
      case "Arc":
        return (
          <img 
            src="/lovable-uploads/56b652af-eb00-49a3-a5c6-7df3e0b71eda.png" 
            alt="Arc crest"
            className={crestStyle}
          />
        );
      case "Nightingale":
        return (
          <img 
            src="/lovable-uploads/4a0629e9-2dde-4d8d-bb95-4bef08c2fd6e.png" 
            alt="Nightingale crest"
            className={crestStyle}
          />
        );
      case "Franklin":
        return (
          <img 
            src="/lovable-uploads/91f36da6-03c8-49a4-b6d1-639749057610.png" 
            alt="Franklin crest"
            className={crestStyle}
          />
        );
      case "Frank":
        return (
          <img 
            src="/lovable-uploads/19e047b2-b1a9-4e0d-a9fa-454b57062def.png" 
            alt="Frank crest"
            className={crestStyle}
          />
        );
      case "King":
        return (
          <img 
            src="/lovable-uploads/2e1c8044-bd36-4181-99f6-7e73c35d753f.png" 
            alt="King crest"
            className={crestStyle}
          />
        );
      case "Newton":
        return (
          <img 
            src="/lovable-uploads/37d5f54b-7829-400a-9b79-074f74c9c829.png" 
            alt="Newton crest"
            className={crestStyle}
          />
        );
      case "Twain":
        return (
          <img 
            src="/lovable-uploads/c349e814-7d9e-4400-bdc3-792427b6d5bc.png" 
            alt="Twain crest"
            className={crestStyle}
          />
        );
      case "Tolkien":
        return (
          <img 
            src="/lovable-uploads/1bf88aad-0588-4e4d-ab4d-1915cca3d28c.png" 
            alt="Tolkien crest"
            className={crestStyle}
          />
        );
      case "Lincoln":
        return (
          <img 
            src="/lovable-uploads/25eef36a-0601-4e5c-8264-e41537a27385.png" 
            alt="Lincoln crest"
            className={crestStyle}
          />
        );
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-300"></div>;
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPositionBadgeVariant = (position: number) => {
    switch (position) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  const isUserCommunity = (communityId: number) => {
    return userCommunityId === communityId;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Community</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((community) => {
              const colors = getCommunityColors(community.house_name);
              const isCurrentUserCommunity = isUserCommunity(community.house_id);
              
              return (
                <TableRow key={community.house_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPositionIcon(community.position)}
                      <Badge variant={getPositionBadgeVariant(community.position)}>
                        #{community.position}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6">
                          {getCommunityCrest(community.house_name)}
                        </div>
                        <div className="flex space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: colors[0] }}
                          ></div>
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: colors[1] }}
                          ></div>
                        </div>
                      </div>
                      {isCurrentUserCommunity ? (
                        <div 
                          className="px-3 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: colors[0] }}
                        >
                          {community.house_name}
                        </div>
                      ) : (
                        <span className="font-medium">{community.house_name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className={`font-bold ${community.total_points >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {community.total_points > 0 ? '+' : ''}{community.total_points}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;