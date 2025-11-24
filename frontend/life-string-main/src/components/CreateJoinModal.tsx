import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Upload, MapPin, Users, Tag, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CreateJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCreated?: (join: any) => void;
}

interface JoinFormData {
  title: string;
  description: string;
  location: string;
  isGroupJoin: boolean;
  tags: string[];
  taggedPeople: string[];
  whoShouldJoin: string;
}

const CreateJoinModal: React.FC<CreateJoinModalProps> = ({ isOpen, onClose, onJoinCreated }) => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<JoinFormData>({
    title: '',
    description: '',
    location: '',
    isGroupJoin: false,
    tags: [],
    taggedPeople: [],
    whoShouldJoin: ''
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

  const toggleGroupJoin = () => {
    setFormData(prev => ({
      ...prev,
      isGroupJoin: !prev.isGroupJoin
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
        is_group_join: formData.isGroupJoin,
        tags: formData.tags,
        tagged_people: formData.taggedPeople,
        who_should_join: formData.whoShouldJoin,
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
        isGroupJoin: false,
        tags: [],
        taggedPeople: [],
        whoShouldJoin: ''
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

  // Get user display name and avatar
  const displayName = userProfile?.full_name || user?.user_metadata?.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl p-0 border-0 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-4 pb-3">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          <h2 className="text-lg font-semibold text-center text-gray-900 mb-4">
            Create new join
          </h2>

          {/* User Profile */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-amber-100 text-amber-800 text-base font-medium">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-medium text-gray-900">{displayName}</span>
          </div>

          {/* Add Photos Button */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Add photos</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
          {/* What's the join? */}
          <div>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's the join?"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm placeholder-gray-400 focus:border-gray-500 focus:ring-0"
            />
          </div>

          {/* Caption */}
          <div>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Write a caption..."
              className="border-0 resize-none min-h-[60px] px-0 py-0 text-sm placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Add Location */}
          <div className="flex items-center space-x-2 py-2 border-b border-gray-100">
            <MapPin className="h-4 w-4 text-gray-400" />
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Add location"
              className="border-0 px-0 py-0 text-sm placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Group Join Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Group join</span>
            </div>
            <button
              type="button"
              onClick={toggleGroupJoin}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                formData.isGroupJoin ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  formData.isGroupJoin ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Add Tags */}
          <div className="flex items-center space-x-2 py-2 border-b border-gray-100">
            <Tag className="h-4 w-4 text-gray-400" />
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tags..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="border-0 px-0 py-0 text-sm placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Tag People */}
          <div className="flex items-center space-x-2 py-2 border-b border-gray-100">
            <UserPlus className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tag people..."
              className="border-0 px-0 py-0 text-sm placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Who Should Join */}
          <div className="flex items-center space-x-2 py-2 border-b border-gray-100">
            <Users className="h-4 w-4 text-gray-400" />
            <Input
              value={formData.whoShouldJoin}
              onChange={(e) => handleInputChange('whoShouldJoin', e.target.value)}
              placeholder="Who should join..."
              className="border-0 px-0 py-0 text-sm placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 text-sm"
            >
              {isLoading ? 'Creating...' : 'Share'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJoinModal;
