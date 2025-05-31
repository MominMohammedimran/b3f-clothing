
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check, Radius } from 'lucide-react';
import { Location } from '../../lib/types';
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
interface LocationPopoverProps {
  locations;
  currentLocation: Location ;
  onSelectLocation: (location: Location) => void;
  triggerClassName?: string;
}

const LocationPopover: React.FC<LocationPopoverProps> = ({
  currentLocation,
  onSelectLocation,
  triggerClassName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  const handleSelectLocation = (location: Location) => {
    onSelectLocation(location);
    setSearchQuery('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`flex items-center space-x-1 cursor-pointer ${triggerClassName || ''}`}
          aria-label="Location"
        >
          <div className="flex items-center ">
             <span className="ml-1 text-s bg-blue-200 text-black-900 rounded px-1">{currentLocation?.code || 'Select'}</span>
            <MapPin size={14} className="ml-1 text-pink-500" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium mb-2">Location</h3>
          
          {currentLocation && (
            <div className="mb-3 p-2 bg-green-50 rounded-md border border-green-100">
              <p className="text-xs text-gray-600">Currently selected</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-medium text-sm">{currentLocation.name}</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">{currentLocation.code}</span>
              </div>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto py-2">
          {filteredLocations.length > 0 ? (
            <div className="space-y-1">
              {filteredLocations.map((location) => (
                <button
                  key={location.id || location.code}
                  onClick={() => handleSelectLocation(location)}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-50 ${
                    currentLocation?.code === location.code ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{location.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mr-1">{location.code}</span>
                    {currentLocation?.code === location.code && (
                      <Check size={14} className="text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No locations found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationPopover;
