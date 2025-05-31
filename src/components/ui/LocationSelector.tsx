
import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Location } from '../../lib/types';
import { useSupabaseClient } from '../../hooks/useSupabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
const locations: Location[] = [
  { id: '1', name: 'Andhra Pradesh', code: 'AP' },
  { id: '2', name: 'Telangana', code: 'TG' },
  { id: '3', name: 'Karnataka', code: 'KA' },
  { id: '4', name: 'Tamil Nadu', code: 'TN' },
  { id: '5', name: 'Kerala', code: 'KL' },
  { id: '6', name: 'Maharashtra', code: 'MH' },
  { id: '7', name: 'Gujarat', code: 'GJ' },
  { id: '8', name: 'Rajasthan', code: 'RJ' },
  { id: '9', name: 'Punjab', code: 'PB' },
  { id: '10', name: 'New Delhi', code: 'DL' },
  { id: '11', name: 'Uttar Pradesh', code: 'UP' },
  { id: '12', name: 'Bihar', code: 'BR' },
  { id: '13', name: 'West Bengal', code: 'WB' },
  { id: '14', name: 'Assam', code: 'AS' },
  { id: '15', name: 'Newyork', code: 'NY' },
  { id: '16', name: 'California', code: 'CA' },
  { id: '17', name: 'Texas', code: 'TX' },
  { id: '18', name: 'Florida', code: 'FL' }
];
interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  currentLocation: Location | null;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  locations,
  onSelectLocation,
  currentLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const supabase = useSupabaseClient();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setFilteredLocations(
      locations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, locations]);

  const handleSelectLocation = async (location: Location) => {
    onSelectLocation(location);
    
    // If user is logged in, store preference in database
    if (currentUser && supabase) {
      try {
        // Check if preference already exists
        const { data: existingPref } = await supabase
          .from('user_location_preferences')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        if (existingPref) {
          // Update existing preference
          await supabase
            .from('user_location_preferences')
            .update({
              location_id: location.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPref.id);
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
        console.error('Error saving location preference:', error);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden animate-fade-in">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Location</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {currentLocation && (
            <div className="mb-4 p-2 border border-green-100 bg-green-50 rounded-md">
              <p className="text-sm text-gray-600">Currently selected</p>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="font-medium">{currentLocation.name}</p>
                </div>
                <div className="text-green-600 text-xs px-2 py-1 border border-green-600 rounded-md">
                  {currentLocation.code}
                </div>
              </div>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredLocations.length > 0 ? (
            <ul className="py-2">
              {filteredLocations.map((location) => (
                <li 
                  key={location.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-blue-600 text-xs px-2 py-1 border border-blue-600 rounded-md">
                      {location.code}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
