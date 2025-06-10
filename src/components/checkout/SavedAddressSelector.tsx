
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_default: boolean;
}

interface SavedAddressSelectorProps {
  onAddressSelect: (address: Partial<SavedAddress>) => void;
}

const SavedAddressSelector: React.FC<SavedAddressSelectorProps> = ({ onAddressSelect }) => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchSavedAddresses();
  }, [currentUser]);

  const fetchSavedAddresses = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: SavedAddress) => {
    onAddressSelect({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country
    });
    toast.success('Address selected');
    setExpanded(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading saved addresses...</div>;
  }

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setExpanded(!expanded)}
        className="mb-3"
      >
        {expanded ? 'Hide' : 'Use'} Saved Address ({addresses.length})
      </Button>
      
      {expanded && (
        <div className="space-y-2">
          {addresses.map((address) => (
            <Card key={address.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-3" onClick={() => handleAddressSelect(address)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.state} - {address.zipcode}
                    </p>
                  </div>
                  {address.is_default && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedAddressSelector;
