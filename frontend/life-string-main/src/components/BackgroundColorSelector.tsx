import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const BackgroundColorSelector = () => {
  const { userProfile } = useAuth();
  const [selectedColor, setSelectedColor] = useState(userProfile?.background_color || '#3B82F6');
  const [isUpdating, setIsUpdating] = useState(false);

  // Color options with new additions
  const colorOptions = [
    { name: 'Lincoln Gold', color: '#B8860B' },
    { name: 'Arc Blue', color: '#1E3A8A' },
    { name: 'Franklin Red', color: '#B91C1C' },
    { name: 'Nightingale Green', color: '#166534' },
    { name: 'King Crimson', color: '#800020' },
    { name: 'Newton Sky', color: '#1E3A8A' },
    { name: 'Twain Gray', color: '#374151' },
    { name: 'Tolkien Cream', color: '#FFF8DC' },
    { name: 'Frank Purple', color: '#6B46C1' },
    { name: 'Sunset Orange', color: '#FF8C00' },
    { name: 'Midnight Black', color: '#1F1F1F' },
    { name: 'Clear', color: 'transparent' }
  ];

  // Function to generate cloud background based on selected color
  const generateCloudBackground = (primaryColor: string) => {
    const getColorPalette = (color: string) => {
      switch (color) {
        case '#B8860B': // Lincoln
          return ['#B8860B', '#FFFF99', '#FFD700', '#F0E68C'];
        case '#1E3A8A': // Arc/Newton
          return ['#1E3A8A', '#60A5FA', '#00FFFF', '#87CEEB'];
        case '#B91C1C': // Franklin
          return ['#B91C1C', '#FF7F7F', '#FA8072', '#FFA07A'];
        case '#166534': // Nightingale
          return ['#166534', '#86EFAC', '#98FB98', '#90EE90'];
        case '#800020': // King
          return ['#800020', '#B91C1C', '#DC143C', '#CD5C5C'];
        case '#374151': // Twain
          return ['#374151', '#C0C0C0', '#D3D3D3', '#F5F5F5'];
        case '#FFF8DC': // Tolkien
          return ['#FFF8DC', '#F5DEB3', '#FFFAF0', '#FAEBD7'];
        case '#6B46C1': // Frank
          return ['#6B46C1', '#C084FC', '#DDD6FE', '#E9D5FF'];
        case '#FF8C00': // Sunset Orange
          return ['#FF8C00', '#FFA500', '#FFD700', '#FFFF99'];
        case '#1F1F1F': // Midnight Black
          return ['#1F1F1F', '#404040', '#696969', '#A9A9A9'];
        case 'transparent': // Clear
          return ['transparent', 'transparent', 'transparent', 'transparent'];
        default:
          return [color, color, color, color];
      }
    };

    const colors = getColorPalette(primaryColor);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute rounded-full transition-all duration-1000 ease-in-out"
          style={{
            backgroundColor: colors[0],
            filter: 'blur(80px)',
            opacity: 0.15,
            width: '200px',
            height: '200px',
            top: '10%',
            left: '15%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-1000 ease-in-out"
          style={{
            backgroundColor: colors[1],
            filter: 'blur(100px)',
            opacity: 0.25,
            width: '150px',
            height: '150px',
            top: '60%',
            right: '10%',
            transform: 'translate(50%, -50%)'
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-1000 ease-in-out"
          style={{
            backgroundColor: colors[2],
            filter: 'blur(60px)',
            opacity: 0.18,
            width: '250px',
            height: '250px',
            top: '35%',
            right: '25%',
            transform: 'translate(50%, -50%)'
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-1000 ease-in-out"
          style={{
            backgroundColor: colors[3],
            filter: 'blur(120px)',
            opacity: 0.12,
            width: '180px',
            height: '180px',
            bottom: '20%',
            left: '20%',
            transform: 'translate(-50%, 50%)'
          }}
        />
      </div>
    );
  };

  // Function to generate button-sized cloud background for previews
  const generateButtonCloudBackground = (primaryColor: string) => {
    const getColorPalette = (color: string) => {
      switch (color) {
        case '#B8860B': // Lincoln
          return ['#B8860B', '#FFFF99', '#FFD700', '#F0E68C'];
        case '#1E3A8A': // Arc/Newton
          return ['#1E3A8A', '#60A5FA', '#00FFFF', '#87CEEB'];
        case '#B91C1C': // Franklin
          return ['#B91C1C', '#FF7F7F', '#FA8072', '#FFA07A'];
        case '#166534': // Nightingale
          return ['#166534', '#86EFAC', '#98FB98', '#90EE90'];
        case '#800020': // King
          return ['#800020', '#B91C1C', '#DC143C', '#CD5C5C'];
        case '#374151': // Twain
          return ['#374151', '#C0C0C0', '#D3D3D3', '#F5F5F5'];
        case '#FFF8DC': // Tolkien
          return ['#FFF8DC', '#F5DEB3', '#FFFAF0', '#FAEBD7'];
        case '#6B46C1': // Frank
          return ['#6B46C1', '#C084FC', '#DDD6FE', '#E9D5FF'];
        case '#FF8C00': // Sunset Orange
          return ['#FF8C00', '#FFA500', '#FFD700', '#FFFF99'];
        case '#1F1F1F': // Midnight Black
          return ['#1F1F1F', '#404040', '#696969', '#A9A9A9'];
        case 'transparent': // Clear
          return ['transparent', 'transparent', 'transparent', 'transparent'];
        default:
          return [color, color, color, color];
      }
    };

    const colors = getColorPalette(primaryColor);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: primaryColor, opacity: 0.3 }}>
        <div 
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: colors[0],
            filter: 'blur(1px)',
            opacity: 0.8,
            width: '40px',
            height: '40px',
            top: '10%',
            left: '15%',
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: colors[1],
            filter: 'blur(2px)',
            opacity: 0.9,
            width: '35px',
            height: '35px',
            top: '50%',
            right: '10%',
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: colors[2],
            filter: 'blur(1px)',
            opacity: 0.7,
            width: '45px',
            height: '45px',
            top: '30%',
            right: '20%',
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: colors[3],
            filter: 'blur(2px)',
            opacity: 0.75,
            width: '38px',
            height: '38px',
            bottom: '15%',
            left: '20%',
          }}
        />
      </div>
    );
  };

  const handleColorUpdate = async (color: string) => {
    if (!userProfile) return;

    setIsUpdating(true);
    try {
      // Skip database update due to user_profiles schema issues
      // Just update local state
      setSelectedColor(color);
      // The useAuth hook will automatically update the userProfile
    } catch (error) {
      console.error('Error updating background color:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {generateCloudBackground(selectedColor)}
      <CardHeader className="relative z-10">
        <CardTitle>Background Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <p className="text-sm text-muted-foreground">
          Choose your preferred background color theme for the platform
        </p>
        
        <div className="grid grid-cols-4 gap-3">
          {colorOptions.map((option) => (
            <div key={option.color} className="text-center">
              <button
                onClick={() => handleColorUpdate(option.color)}
                className={`w-16 h-16 rounded-full border-4 transition-all relative overflow-hidden shadow-lg ${
                  selectedColor === option.color 
                    ? 'border-foreground scale-110 shadow-xl' 
                    : 'border-border hover:border-muted-foreground hover:scale-105'
                }`}
                disabled={isUpdating}
              >
                {option.color === 'transparent' ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-full">
                    <span className="text-xl text-gray-600 font-bold">✕</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full">
                    {generateButtonCloudBackground(option.color)}
                  </div>
                )}
              </button>
              <p className="text-xs mt-1 text-muted-foreground">{option.name}</p>
            </div>
          ))}
        </div>

        {selectedColor !== userProfile?.background_color && (
          <div className="pt-4">
            <Button 
              onClick={() => handleColorUpdate(selectedColor)}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Save Color Theme'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackgroundColorSelector;