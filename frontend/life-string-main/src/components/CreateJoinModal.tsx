import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CreateJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCreated?: (join: any) => void;
}

interface JoinFormData {
  title: string;
  description: string;
  location: string;
  duration: string;
  maxParticipants: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const CreateJoinModal: React.FC<CreateJoinModalProps> = ({ isOpen, onClose, onJoinCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<JoinFormData>({
    title: '',
    description: '',
    location: '',
    duration: '',
    maxParticipants: '10',
    difficulty: 'beginner',
    tags: []
  });

  const handleInputChange = (field: keyof JoinFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and description.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate join creation for now (backend deployment in progress)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockJoin = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        duration: formData.duration,
        max_participants: parseInt(formData.maxParticipants) || 10,
        difficulty: formData.difficulty,
        tags: formData.tags,
        created_at: new Date().toISOString()
      };

      // Show success message
      toast({
        title: "Join Created!",
        description: `"${formData.title}" has been created successfully! (Demo mode - full functionality coming soon)`,
      });

      // Call the callback if provided
      if (onJoinCreated) {
        onJoinCreated(mockJoin);
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        location: '',
        duration: '',
        maxParticipants: '10',
        difficulty: 'beginner',
        tags: []
      });
      onClose();

    } catch (error) {
      console.error('Error creating join:', error);
      toast({
        title: "Error",
        description: "Failed to create join. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Create a Join</DialogTitle>
          <p className="text-gray-600 font-light">
            Create a trip, event, or activity to connect with like-minded people
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Boating Adventures, Weekend Hiking Trip"
              className="w-full"
            />
          </div>



          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what you want to do, who you're looking for, and what to expect..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., San Francisco Bay Area, Lake Tahoe"
            />
          </div>



          {/* Duration and Max Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2 hours, 3 days, 1 week"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="text-sm font-medium">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="100"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => handleInputChange('difficulty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tags (e.g., boating, sailing, outdoors)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Join'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJoinModal;
