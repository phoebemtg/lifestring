import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhotoGalleryProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these photos would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${maxPhotos} photos total.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload photos.",
          variant: "destructive"
        });
        return;
      }

      for (const file of files) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is too large. Please select images under 5MB.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive"
          });
          continue;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
        toast({
          title: "Photos uploaded",
          description: `Successfully uploaded ${newPhotos.length} photo(s).`,
        });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading photos.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract the file path from the URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && fileName) {
        const filePath = `${user.id}/gallery/${fileName}`;
        
        // Delete from Supabase Storage
        const { error } = await supabase.storage
          .from('profile-photos')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting photo:', error);
        }
      }

      // Remove from local state regardless of storage deletion result
      const updatedPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(updatedPhotos);

      toast({
        title: "Photo removed",
        description: "Photo has been removed from your gallery.",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Photo Gallery</span>
          <span className="text-sm font-normal text-gray-500">
            ({photos.length}/{maxPhotos})
          </span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add photos to showcase your interests and personality
        </p>
      </CardHeader>
      <CardContent>
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Gallery photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => handleRemovePhoto(photo, index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {/* Upload Button */}
          {photos.length < maxPhotos && (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                {uploading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-2"></div>
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photos</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No photos yet</p>
            <p className="text-sm">Add some photos to make your profile more engaging</p>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>• Upload up to {maxPhotos} photos</p>
          <p>• Supported formats: JPG, PNG, GIF</p>
          <p>• Maximum file size: 5MB per photo</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoGallery;
