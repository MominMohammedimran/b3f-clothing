import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Location } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Define locations with necessary properties
const staticLocations: Location[] = [
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

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  currentLocationId?: string;
}

const LocationPopup: React.FC<LocationPopupProps> = ({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  currentLocationId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch locations from supabase
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        // Query only the columns that actually exist in the locations table
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, code')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map the data to conform to our Location interface
          const formattedData: Location[] = data.map(loc => ({
            id: loc.id,
            name: loc.name,
            code: loc.code
            // Other properties are optional in our updated Location interface
          }));
          setLocations(formattedData);
          setFilteredLocations(formattedData);
        } else {
          // Fallback to static data if no data from API
          setLocations(staticLocations);
          setFilteredLocations(staticLocations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback to static data if API fails
        setLocations(staticLocations);
        setFilteredLocations(staticLocations);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen]);
  
  // Filter locations based on search term
  useEffect(() => {
    const filtered = locations.filter(loc => 
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (loc.code && loc.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);
  
  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Location</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a city"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="mt-4 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No locations found</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredLocations.map((location) => (
                <Button
                  key={location.id}
                  variant={currentLocationId === location.id ? "default" : "outline"}
                  className="justify-start h-auto py-2 px-4"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{location.name}</span>
                    <span className="text-xs text-gray-500">{location.code}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPopup;
