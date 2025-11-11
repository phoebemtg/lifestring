
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Save, Plus, X, HelpCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileQuestions from './ProfileQuestions';
import LocationAutocomplete from './LocationAutocomplete';
import PhotoGallery from './PhotoGallery';

interface EditableProfileProps {
  onBack: () => void;
  userName: string;
  selectedOrbColor?: string;
}

interface DetailedProfile {
  name?: string;
  bio?: string;
  location?: string;
  birthday?: string;
  age?: string;
  email?: string;
  phone?: string;
  website?: string;

  twitter?: string;
  linkedin?: string;
  hobbies: string[];
  ambitions?: string;
  dreams?: string;
  goals?: string;
  questions: string[];
  interests: string[];
  education?: string;
  work?: string;
  relationship_status?: string;
  looking_for?: string;
  profile_photo?: string;
  photos: string[];
}



const EditableProfile = ({ onBack, userName, selectedOrbColor = '#4169E1' }: EditableProfileProps) => {
  console.log('EditableProfile component mounted');
  const { toast } = useToast();
  const [showProfileQuestions, setShowProfileQuestions] = useState(false);
  const [profile, setProfile] = useState<DetailedProfile>({
    name: userName,
    hobbies: [],
    questions: [],
    interests: [],
    photos: []
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPassion, setNewPassion] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newInterest, setNewInterest] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Show ProfileQuestions component if requested
  if (showProfileQuestions) {
    return (
      <ProfileQuestions
        onBack={() => setShowProfileQuestions(false)}
        userName={userName}
      />
    );
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found when fetching profile');
        return;
      }

      console.log('Fetching profile for user:', user.id);

      // First, get the user's name from user_profiles
      const { data: userProfileData } = await supabase
        .from('user_profiles')
        .select('contact_info')
        .eq('user_id', user.id)
        .single();

      const userNameFromProfile = userProfileData?.contact_info?.name || userName;

      const { data, error } = await supabase
        .from('detailed_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data fetched:', data);

      if (data) {
        const profileData = {
          name: data.name || userNameFromProfile,
          bio: data.bio || '',
          location: data.location || '',
          birthday: data.birthday || '',
          age: data.age || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          website: data.website || '',

          twitter: data.twitter || '',
          linkedin: data.linkedin || '',
          hobbies: data.hobbies || [],
          ambitions: data.ambitions || '',
          dreams: data.dreams || '',
          goals: data.goals || '',
          questions: data.questions || [],
          interests: data.interests || [],
          education: data.education || '',
          work: data.work || '',
          relationship_status: data.relationship_status || '',
          looking_for: data.looking_for || '',
          profile_photo: data.profile_photo || '',
          photos: data.photos || []
        };
        console.log('Setting profile state:', profileData);
        setProfile(profileData);
      } else {
        console.log('No profile data found, setting default');
        // Set default profile with user's email and name
        setProfile(prev => ({
          ...prev,
          name: userNameFromProfile,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save your profile.",
          variant: "destructive"
        });
        return;
      }

      // Separate name from other profile data (name is saved to user_profiles.contact_info)
      const { name, ...profileWithoutExcludedFields } = profile;

      const profileData = {
        user_id: user.id,
        ...profileWithoutExcludedFields,
        // Handle empty birthday field - set to null if empty
        birthday: profile.birthday && profile.birthday.trim() ? profile.birthday : null,
        updated_at: new Date().toISOString()
      };

      console.log('🔍 Fields excluded from database save:', { name });
      console.log('💾 Profile data being saved to database:', profileData);
      console.log('🔍 Age field value:', profile.age);
      console.log('🔍 Location field value:', profile.location);
      console.log('🔍 Birthday field value:', profile.birthday);
      console.log('🔍 Birthday processed value:', profileData.birthday);

      // Save name to user_profiles.contact_info if it has changed
      if (name) {
        const { data: currentUserProfile } = await supabase
          .from('user_profiles')
          .select('contact_info')
          .eq('user_id', user.id)
          .single();

        const currentName = currentUserProfile?.contact_info?.name;

        if (currentName !== name) {
          const updatedContactInfo = {
            ...currentUserProfile?.contact_info,
            name: name
          };

          const { error: nameError } = await supabase
            .from('user_profiles')
            .update({ contact_info: updatedContactInfo })
            .eq('user_id', user.id);

          if (nameError) {
            console.error('Error saving name:', nameError);
            toast({
              title: "Error",
              description: `Failed to save name: ${nameError.message}`,
              variant: "destructive"
            });
            return;
          }
        }
      }

      // Save to detailed_profiles table (without name)
      const { error: detailedError } = await supabase
        .from('detailed_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (detailedError) {
        console.error('Error saving detailed profile:', detailedError);
        console.error('Profile data that failed:', profileData);
        console.error('Error details:', {
          code: detailedError.code,
          message: detailedError.message,
          details: detailedError.details,
          hint: detailedError.hint
        });
        toast({
          title: "Error",
          description: `Failed to save profile: ${detailedError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Profile saved successfully:', profileData);
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'hobbies' | 'questions' | 'interests', value: string, setter: (value: string) => void) => {
    console.log(`Adding ${type}:`, value, 'Current profile:', profile);
    if (value.trim() && !profile[type].includes(value.trim())) {
      const newProfile = {
        ...profile,
        [type]: [...profile[type], value.trim()]
      };
      console.log(`Updated ${type}:`, newProfile[type]);
      setProfile(newProfile);
      setter('');
    } else {
      console.log(`Not adding ${type} - either empty or already exists`);
    }
  };

  const removeItem = (type: 'hobbies' | 'questions' | 'interests', item: string) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📸 Photo upload started:', file.name, file.size, file.type);

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No user found for photo upload');
        return;
      }

      console.log('👤 Uploading photo for user:', user.id);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      console.log('📁 Uploading to:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: `Failed to upload photo: ${uploadError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Photo uploaded successfully');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);

      // Update profile state
      setProfile(prev => ({
        ...prev,
        profile_photo: publicUrl
      }));

      toast({
        title: "Photo uploaded!",
        description: "Your profile photo has been updated.",
      });

    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
      // Clear the file input so the same file can be selected again
      const input = document.getElementById('photo-upload') as HTMLInputElement;
      if (input) input.value = '';
      const input2 = document.getElementById('profile-photo-input') as HTMLInputElement;
      if (input2) input2.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove([`${user.id}/profile.jpeg`, `${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.webp`]);

      if (deleteError) {
        console.error('Error deleting photo:', deleteError);
      }

      // Update profile state
      setProfile(prev => ({
        ...prev,
        profile_photo: ''
      }));

      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed.",
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

  // Colorful orbs background function (same as homepage)
  const getOrbsBackground = () => {
    // Improved golden spiral layout with better structure
    const orbConfigurations = [
    // Large center orb
    {
      color: "#FFD700",
      size: 250,
      opacity: 0.12,
      blur: 50,
      left: 45,
      top: 40,
      animation: 'cloud-float-1',
      delay: 0,
      duration: 30
    },
    // Golden ratio spiral - moving outward
    {
      color: "#FF69B4",
      size: 180,
      opacity: 0.08,
      blur: 60,
      left: 25,
      top: 25,
      animation: 'cloud-float-2',
      delay: 5,
      duration: 25
    }, {
      color: "#4169E1",
      size: 200,
      opacity: 0.10,
      blur: 55,
      left: 65,
      top: 20,
      animation: 'cloud-float-3',
      delay: 10,
      duration: 35
    }, {
      color: "#00CED1",
      size: 160,
      opacity: 0.09,
      blur: 65,
      left: 75,
      top: 55,
      animation: 'cloud-float-4',
      delay: 15,
      duration: 28
    }, {
      color: "#32CD32",
      size: 140,
      opacity: 0.07,
      blur: 70,
      left: 55,
      top: 70,
      animation: 'cloud-float-5',
      delay: 20,
      duration: 32
    }, {
      color: "#9370DB",
      size: 170,
      opacity: 0.08,
      blur: 58,
      left: 15,
      top: 60,
      animation: 'cloud-float-1',
      delay: 25,
      duration: 27
    },
    // Accent orbs for depth
    {
      color: "#87CEEB",
      size: 120,
      opacity: 0.06,
      blur: 75,
      left: 80,
      top: 30,
      animation: 'cloud-float-2',
      delay: 12,
      duration: 40
    }, {
      color: "#DDA0DD",
      size: 110,
      opacity: 0.05,
      blur: 80,
      left: 10,
      top: 15,
      animation: 'cloud-float-3',
      delay: 18,
      duration: 22
    }];
    const cloudOrbs = orbConfigurations.map((config, index) => <div key={index} className={`absolute rounded-full animate-${config.animation} will-change-transform transform-gpu`} style={{
      width: `${config.size}px`,
      height: `${config.size}px`,
      backgroundColor: config.color,
      opacity: config.opacity,
      filter: `blur(${config.blur}px)`,
      left: `${config.left}%`,
      top: `${config.top}%`,
      animationDelay: `${config.delay}s`,
      animationDuration: `${config.duration}s`,
      backfaceVisibility: 'hidden'
    }} />);
    return <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {cloudOrbs}
      </div>;
  };

  // Simple blended background like other pages
  const backgroundStyle = selectedOrbColor === 'CLEAN' ? '#ffffff' : 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)';

  // Questions moved to dedicated ProfileQuestions.tsx component
  return (
    <div className="min-h-screen relative" style={{ background: backgroundStyle }}>
      {/* Add the colorful orbs background */}
      {getOrbsBackground()}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Common Room</span>
          </Button>
          <h1 className="text-xl font-medium text-gray-900">Edit Profile</h1>
          <div className="flex items-center space-x-3">

            <Button
              onClick={saveProfile}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {profile.profile_photo ? (
                      <img
                        src={profile.profile_photo}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                        {(profile.name || userName).charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Photo Upload Button */}
                  <button
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-2 -right-2 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title={uploadingPhoto ? "Uploading..." : "Upload profile photo"}
                  >
                    {uploadingPhoto ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    ) : (
                      <Upload className="h-4 w-4 text-gray-600" />
                    )}
                  </button>

                  {/* Hidden file input */}
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-medium text-gray-900 mb-2">{profile.name || userName}</h2>
                  <p className="text-gray-600">Complete your profile to connect better with others</p>
                  {profile.profile_photo && (
                    <button
                      onClick={handleRemovePhoto}
                      className="text-sm text-red-600 hover:text-red-700 mt-2"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Section - Separate from Deeper Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <p className="text-sm text-gray-600">Essential details about you</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input
                    value={profile.name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    value={profile.email || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <LocationAutocomplete
                    value={profile.location || ''}
                    onChange={(value) => setProfile(prev => ({ ...prev, location: value }))}
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                  <Input
                    type="date"
                    value={profile.birthday || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <Input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Your age"
                    min="18"
                    max="100"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Profile Photo</CardTitle>
              <p className="text-sm text-gray-600">Add a photo to help others recognize you</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {profile.profile_photo ? (
                      <img src={profile.profile_photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                        {(profile.name || userName).charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1">
                  <Button
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                    variant="outline"
                    className="mb-2"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-sm text-gray-500">
                    Upload a clear photo of yourself. JPG, PNG up to 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Social Links</CardTitle>
              <p className="text-sm text-gray-600">Connect your social profiles</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <Input
                    value={profile.website || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <Input
                    value={profile.twitter || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <Input
                    value={profile.linkedin || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deeper Information Section - Separated as requested */}
          <div className="border-t-4 border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deeper Information</h2>
            <p className="text-gray-600 mb-8">Share more about your interests, hobbies, and what makes you unique</p>

          {/* Interests Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('interests', newInterest, setNewInterest)}
                  />
                  <Button onClick={() => addItem('interests', newInterest, setNewInterest)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{interest}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-gray-900"
                        onClick={() => removeItem('interests', interest)}
                      />
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hobbies Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Hobbies */}
            <Card>
              <CardHeader>
                <CardTitle>Hobbies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    placeholder="What do you like to do in your free time?"
                    onKeyPress={(e) => e.key === 'Enter' && addItem('hobbies', newHobby, setNewHobby)}
                  />
                  <Button onClick={() => addItem('hobbies', newHobby, setNewHobby)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{hobby}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-green-900"
                        onClick={() => removeItem('hobbies', hobby)}
                      />
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Life Aspirations */}
          <Card>
            <CardHeader>
              <CardTitle>Life Aspirations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ambitions</label>
                <Textarea
                  value={profile.ambitions || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, ambitions: e.target.value }))}
                  placeholder="What are your professional and personal ambitions?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dreams</label>
                <Textarea
                  value={profile.dreams || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, dreams: e.target.value }))}
                  placeholder="What are your biggest dreams?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                <Textarea
                  value={profile.goals || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="What goals are you working towards?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Questions - Embedded directly */}
          <ProfileQuestions
            onBack={() => {}}
            userName={userName}
            embedded={true}
          />



          {/* Photo Gallery Section */}
          <PhotoGallery
            photos={profile.photos}
            onPhotosChange={(photos) => setProfile(prev => ({ ...prev, photos }))}
            maxPhotos={6}
          />
          </div> {/* End of Deeper Information Section */}
        </div>
      </div>
    </div>
  );
};

export default EditableProfile;
