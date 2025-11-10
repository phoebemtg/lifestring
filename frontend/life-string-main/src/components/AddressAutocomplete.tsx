import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

interface PlaceResult {
  formatted_address: string;
  place_id: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your address",
  label = "Address",
  required = false,
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

      console.log('🔑 Google Places API Key check:', apiKey ? 'Present' : 'Missing');

      if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY_HERE') {
        console.error('❌ Google Places API key not configured');
        setError('Google Places API key not configured');
        return;
      }

      try {
        // Load Google Maps JavaScript API directly
        const loadGoogleMapsAPI = () => {
          return new Promise<void>((resolve, reject) => {
            // Check if already loaded
            if (window.google && window.google.maps && window.google.maps.places) {
              resolve();
              return;
            }

            // Check if script is already being loaded
            if (document.querySelector('script[src*="maps.googleapis.com"]')) {
              // Wait for existing script to load
              const checkLoaded = () => {
                if (window.google && window.google.maps && window.google.maps.places) {
                  resolve();
                } else {
                  setTimeout(checkLoaded, 100);
                }
              };
              checkLoaded();
              return;
            }

            // Create and load the script
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps API'));
            document.head.appendChild(script);
          });
        };

        await loadGoogleMapsAPI();
        setIsLoaded(true);

        if (inputRef.current) {
          // Initialize autocomplete
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: 'us' }, // Restrict to US addresses
              fields: ['formatted_address', 'place_id', 'geometry']
            }
          );

          // Listen for place selection
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace() as PlaceResult;
            
            if (place && place.formatted_address) {
              onChange(place.formatted_address);
              console.log('📍 Address selected:', place.formatted_address);
              
              // Optional: Log coordinates for future use
              if (place.geometry?.location) {
                console.log('📍 Coordinates:', {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ Error loading Google Places API:', error);
        setError('Failed to load address autocomplete');
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (error) {
    // Fallback to regular input if Google Places fails
    return (
      <div className={className}>
        {label && (
          <Label htmlFor="address-input" className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Input
          id="address-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Address autocomplete unavailable
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="address-autocomplete" className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        ref={inputRef}
        id="address-autocomplete"
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="mt-1"
        autoComplete="address-line1"
      />
      {isLoaded && (
        <p className="text-xs text-gray-500 mt-1">
          Start typing to see address suggestions
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
