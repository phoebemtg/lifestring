import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your location",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
        console.log('🗺️ Google Places API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

        // Load Google Maps script dynamically
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
          script.async = true;
          script.defer = true;

          // Create a promise that resolves when the script loads
          const scriptPromise = new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps script'));

            // Add a global callback function
            (window as any).initMap = () => {
              resolve();
            };
          });

          document.head.appendChild(script);
          await scriptPromise;
        }

        console.log('🗺️ Google Maps API loaded successfully');
        setIsLoaded(true);

        if (inputRef.current && !autocompleteRef.current && window.google) {
          console.log('🗺️ Initializing autocomplete...');
          // Initialize autocomplete
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['(cities)'],
              fields: ['formatted_address', 'geometry', 'name']
            }
          );

          // Add place changed listener
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            console.log('🗺️ Place selected:', place);
            if (place?.formatted_address) {
              onChange(place.formatted_address);
            }
          });
          console.log('🗺️ Autocomplete initialized successfully');
        }
      } catch (error) {
        console.error('❌ Error loading Google Maps:', error);
        // Fallback to regular input if Google Maps fails to load
        setIsLoaded(true);
      }
    };

    if (import.meta.env.VITE_GOOGLE_PLACES_API_KEY) {
      initializeAutocomplete();
    } else {
      console.warn('⚠️ Google Places API key not found');
      setIsLoaded(true);
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm text-gray-500">Loading location services...</span>
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default LocationAutocomplete;
