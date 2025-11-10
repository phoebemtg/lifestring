import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Leaderboard from './Leaderboard';

interface Community {
  id: number;
  name: string;
  colors: [string, string];
}

interface PointsManagerProps {
  communities: Community[];
  onClose: () => void;
  onPointsUpdated: () => void;
}

const PointsManager = ({ communities, onClose, onPointsUpdated }: PointsManagerProps) => {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [pointsChange, setPointsChange] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCommunityId || !pointsChange) {
      toast({
        title: "Missing Information",
        description: "Please select a community and enter points change.",
        variant: "destructive",
      });
      return;
    }

    const points = parseInt(pointsChange);
    if (isNaN(points)) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid number for points.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Authentication error:', userError);
        toast({
          title: "Authentication Error",
          description: "Unable to verify user authentication. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        console.error('No authenticated user found');
        toast({
          title: "Authentication Required",
          description: "You must be logged in as an admin to update points. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Attempting to insert points transaction:', {
        house_id: parseInt(selectedCommunityId),
        points_change: points,
        reason: reason || null,
        admin_id: user.id,
        user_email: user.email
      });

      // Record the transaction
      const { data, error: transactionError } = await supabase
        .from('house_points_transactions')
        .insert({
          house_id: parseInt(selectedCommunityId),
          points_change: points,
          reason: reason || null,
          admin_id: user.id
        })
        .select();

      if (transactionError) {
        console.error('Database error:', transactionError);
        toast({
          title: "Database Error",
          description: `Failed to update points: ${transactionError.message}. Please check your admin permissions.`,
          variant: "destructive",
        });
        return;
      }

      console.log('Points transaction successful:', data);

      toast({
        title: "Points Updated",
        description: `Successfully ${points > 0 ? 'added' : 'removed'} ${Math.abs(points)} points ${points > 0 ? 'to' : 'from'} ${communities.find(h => h.id === parseInt(selectedCommunityId))?.name}.`,
      });

      // Reset form
      setSelectedCommunityId('');
      setPointsChange('');
      setReason('');
      
      // Force leaderboard refresh
      setLeaderboardKey(prev => prev + 1);
      
      // Trigger real-time update by creating a custom event
      window.dispatchEvent(new CustomEvent('housePointsUpdated', {
        detail: { houseId: parseInt(selectedCommunityId), pointsChange: points }
      }));
      
      onPointsUpdated();
    } catch (error) {
      console.error('Unexpected error updating points:', error);
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points Management Form */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Points</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="community">Select Community *</Label>
                  <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id.toString()}>
                          <span style={{ color: community.colors[0] }}>{community.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="points">Points Change *</Label>
                  <Input
                    id="points"
                    type="number"
                    value={pointsChange}
                    onChange={(e) => setPointsChange(e.target.value)}
                    placeholder="Enter positive number to add, negative to subtract"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use positive numbers to add points, negative to subtract
                  </p>
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why are you adjusting these points?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Updating...' : 'Update Points'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <div key={leaderboardKey}>
            <Leaderboard communities={communities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsManager;