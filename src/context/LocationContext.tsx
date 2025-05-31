
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocationService } from '../services/locationService';
import { Location } from '../lib/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from '../integrations/supabase/client';

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  setCurrentLocation: (location: Location) => void;
  isLoading: boolean;
  isLocationSelectorOpen: boolean;
  openLocationSelector: () => void;
  closeLocationSelector: () => void;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  locations: [],
  setCurrentLocation: () => {},
  isLoading: true,
  isLocationSelectorOpen: false,
  openLocationSelector: () => {},
  closeLocationSelector: () => {}
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const locationService = useLocationService();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        // Get saved location from local storage
        const savedLocation = localStorage.getItem('currentLocation');
        
        // Fetch locations from Supabase
        let fetchedLocations = await locationService.fetchAllLocations();
        
        setLocations(fetchedLocations);

        // If user is logged in, try to get their preferred location from database
        if (currentUser && supabase) {
          try {
            const { data } = await supabase
              .from('user_location_preferences')
              .select('location_id')
              .eq('user_id', currentUser.id)
              .maybeSingle();
            
            if (data && data.location_id) {
              const locationData = await locationService.getLocationById(data.location_id);
              if (locationData) {
                setCurrentLocation(locationData);
                localStorage.setItem('currentLocation', JSON.stringify(locationData));
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching user location preference:', error);
          }
        }
        
        // Set current location from local storage or default
        if (savedLocation) {
          const parsedLocation = JSON.parse(savedLocation) as Location;
          setCurrentLocation(parsedLocation);
        } else if (fetchedLocations.length > 0) {
          setCurrentLocation(fetchedLocations[0]);
          localStorage.setItem('currentLocation', JSON.stringify(fetchedLocations[0]));
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
        // Set default location as fallback
        const defaultLocation = { id: '1', name: 'Andhra Pradesh', code: 'AP' };
        setCurrentLocation(defaultLocation);
        localStorage.setItem('currentLocation', JSON.stringify(defaultLocation));
        toast.error('Failed to load locations');
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, [currentUser]);

  const handleSetCurrentLocation = async (location: Location) => {
    setCurrentLocation(location);
    localStorage.setItem('currentLocation', JSON.stringify(location));
    
    // If user is logged in, save their preference to the database
    if (currentUser && supabase) {
      try {
        // Check if preference already exists
        const { data } = await supabase
          .from('user_location_preferences')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        if (data) {
          // Update existing preference
          await supabase
            .from('user_location_preferences')
            .update({ 
              location_id: location.id, 
              updated_at: new Date().toISOString() 
            })
            .eq('user_id', currentUser.id);
        } else {
          // Insert new preference
          await supabase
            .from('user_location_preferences')
            .insert({
              user_id: currentUser.id,
              location_id: location.id
            });
        }
      } catch (error) {
        console.error('Failed to save location preference:', error);
        // Don't show error to user, just log it
      }
    }
  };

  const openLocationSelector = () => setIsLocationSelectorOpen(true);
  const closeLocationSelector = () => setIsLocationSelectorOpen(false);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locations,
        setCurrentLocation: handleSetCurrentLocation,
        isLoading,
        isLocationSelectorOpen,
        openLocationSelector,
        closeLocationSelector
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
