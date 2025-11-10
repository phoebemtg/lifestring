import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClubCreatorProps {
  communityId: number;
  onClose: () => void;
  onClubCreated: () => void;
}

const ClubCreator = ({ communityId, onClose, onClubCreated }: ClubCreatorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    location: '',
    meetingTime: '',
    maxMembers: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a club name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
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
          description: "You must be logged in to create a club. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('house_clubs')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          location: formData.location.trim() || null,
          meeting_time: formData.meetingTime.trim() || null,
          max_members: formData.maxMembers ? parseInt(formData.maxMembers) : null,
          house_id: communityId,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Club Created",
        description: "Your club has been created successfully!",
      });

      onClubCreated();
      onClose();
    } catch (error) {
      console.error('Error creating club:', error);
      toast({
        title: "Error",
        description: "Failed to create club. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Club
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Club Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter club name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your club is about..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="arts">Arts & Culture</SelectItem>
                  <SelectItem value="hobby">Hobby</SelectItem>
                  <SelectItem value="service">Community Service</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Meeting Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Where will the club meet?"
              />
            </div>

            <div>
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input
                id="meetingTime"
                name="meetingTime"
                value={formData.meetingTime}
                onChange={handleInputChange}
                placeholder="When will the club meet? (e.g., Every Tuesday 7PM)"
              />
            </div>

            <div>
              <Label htmlFor="maxMembers">Maximum Members (Optional)</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={handleInputChange}
                placeholder="Leave blank for unlimited"
                min="2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading || !formData.name.trim()}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Club'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubCreator;