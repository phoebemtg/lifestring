
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Edit, 
  Save,
  X,
  Plus,

  Twitter,
  Linkedin,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileProps {
  onBack: () => void;
  userName: string;
  selectedOrbColor?: string;
}



const Profile = ({ onBack, userName, selectedOrbColor = '#4169E1' }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    bio: "",
    location: "",
    birthday: "",
    email: "",
    phone: "",
    website: "",

    twitter: "",
    linkedin: "",
    interests: [] as string[],

    education: "",
    work: "",
    relationshipStatus: "",
    lookingFor: ""
  });
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
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



  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };



  // Simple blended background like other pages
  const backgroundStyle = selectedOrbColor === 'CLEAN' ? '#ffffff' : 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)';

  return (
    <div className="min-h-screen" style={{ background: backgroundStyle }}>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-light tracking-wide text-gray-900">Profile</h1>
          </div>
          
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-light tracking-wide rounded-full px-6"
          >
            {isEditing ? (
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
      </header>

      <div className="max-w-4xl mx-auto p-8 pt-20">
        {/* Profile Header */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-8">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-gray-200">
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl font-light tracking-wide">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-3xl font-light mb-4 border-0 p-0 text-gray-900 tracking-wide"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="text-3xl font-light text-gray-900 mb-4 tracking-wide">{profileData.name}</h1>
                )}
                
                {isEditing ? (
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
                  {isEditing ? (
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
                  {isEditing ? (
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
                  {isEditing ? (
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
                  {isEditing ? (
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

          {/* Social Links */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-light tracking-wide text-gray-900">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                {isEditing ? (
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
                <Twitter className="h-5 w-5 text-gray-400" />
                {isEditing ? (
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
                <Linkedin className="h-5 w-5 text-gray-400" />
                {isEditing ? (
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
                    {isEditing && (
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
              {isEditing && (
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


        </div>

        {/* Additional Information */}
        <Card className="mt-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light tracking-wide text-gray-900">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Education</label>
              {isEditing ? (
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
              {isEditing ? (
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
              {isEditing ? (
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
      </div>
    </div>
  );
};

export default Profile;
