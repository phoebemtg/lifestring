import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AnnouncementCreatorProps {
  communityId: number;
  onClose: () => void;
  onAnnouncementCreated: () => void;
}

const AnnouncementCreator: React.FC<AnnouncementCreatorProps> = ({
  communityId,
  onClose,
  onAnnouncementCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcementType: 'general'
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
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('house_announcements')
        .insert({
          title: formData.title,
          content: formData.content,
          announcement_type: formData.announcementType,
          house_id: communityId,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Announcement Created",
        description: "Your announcement has been posted successfully!",
      });

      onAnnouncementCreated();
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create Announcement</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="announcementType">Announcement Type</Label>
            <Select 
              value={formData.announcementType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, announcementType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="important">Important</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Announcement Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your announcement here..."
              rows={6}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.content}
              className="flex-1"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              {loading ? 'Posting...' : 'Post Announcement'}
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
      </div>
    </div>
  );
};

export default AnnouncementCreator;