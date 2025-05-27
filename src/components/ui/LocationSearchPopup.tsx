
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Location } from '../../lib/types';

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

interface LocationSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: Location;
  onSelect: (location: Location) => void;
}

const LocationSearchPopup = ({ isOpen, onClose, currentLocation, onSelect }: LocationSearchPopupProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm]);

  const handleLocationSelect = (location: Location) => {
    onSelect(location);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="text-gray-600 mb-2">Currently selected</div>
            <div className="px-4 py-2 bg-gray-100 rounded-md flex items-center justify-between">
              <span className="font-medium">{currentLocation.name}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{currentLocation.code}</span>
            </div>
          </div>
          
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="max-h-[40vh] overflow-y-auto">
            {filteredLocations.length > 0 ? (
              <div className="space-y-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.code}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full px-4 py-3 flex items-center justify-between rounded-md hover:bg-gray-100 transition-colors ${
                      currentLocation.code === location.code ? 'bg-green-50 border border-green-200' : ''
                    }`}
                  >
                    <span className="font-medium">{location.name}</span>
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold">{location.code}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No locations found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSearchPopup;
