
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '../../components/admin/AdminLayout';
import { Location } from '../../lib/types';
import { supabase } from '@/integrations/supabase/client';

// Location service for Supabase
const useLocationService = () => {
  const fetchAllLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
    
    return data || [];
  };

  const addLocation = async (location: Omit<Location, 'id'>) => {
    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select()
      .single();
      
    if (error) {
      console.error('Error adding location:', error);
      throw error;
    }
    
    return data;
  };

  const updateLocation = async (id: string, location: Partial<Location>) => {
    const { data, error } = await supabase
      .from('locations')
      .update(location)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating location:', error);
      throw error;
    }
    
    return data;
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
    
    return true;
  };

  return {
    fetchAllLocations,
    addLocation,
    updateLocation,
    deleteLocation
  };
};

type EditableLocation = Location & { isEditing?: boolean, isNew?: boolean };

const AdminLocations = () => {
  const [locations, setLocations] = useState<EditableLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const locationService = useLocationService();
  
  useEffect(() => {
    loadLocations();
  }, []);
  
  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const fetchedLocations = await locationService.fetchAllLocations();
      setLocations(fetchedLocations as EditableLocation[]);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNewLocation = () => {
    const newLocation: EditableLocation = {
      id: `temp-${Date.now()}`,
      name: '',
      code: '',
      isEditing: true,
      isNew: true
    };
    
    setLocations([...locations, newLocation]);
  };
  
  const handleStartEditing = (id: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, isEditing: true } : loc
    ));
  };
  
  const handleCancelEditing = (id: string) => {
    setLocations(locations.filter(loc => 
      !(loc.id === id && loc.isNew)
    ).map(loc => 
      loc.id === id ? { ...loc, isEditing: false } : loc
    ));
  };
  
  const handleInputChange = (id: string, field: keyof Location, value: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };
  
  const handleSaveLocation = async (location: EditableLocation) => {
    try {
      if (location.isNew) {
        // Create new location
        const { id, isEditing, isNew, ...newLocation } = location;
        const result = await locationService.addLocation(newLocation);
        if (result) {
          setLocations(prev => [
            ...prev.filter(loc => loc.id !== location.id),
            { ...result, isEditing: false }
          ]);
          toast.success('Location added successfully');
        }
      } else {
        // Update existing location
        const { isEditing, isNew, ...updateData } = location;
        const result = await locationService.updateLocation(location.id!, updateData);
        if (result) {
          setLocations(prev => prev.map(loc => 
            loc.id === location.id ? { ...result, isEditing: false } : loc
          ));
          toast.success('Location updated successfully');
        }
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      toast.error('Failed to save location');
    }
  };
  
  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        const success = await locationService.deleteLocation(id);
        if (success) {
          setLocations(prev => prev.filter(loc => loc.id !== id));
          toast.success('Location deleted successfully');
        }
      } catch (error) {
        console.error('Failed to delete location:', error);
        toast.error('Failed to delete location');
      }
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Locations</h1>
          <Button onClick={handleAddNewLocation} className="flex items-center gap-2">
            <Plus size={16} /> Add Location
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map(location => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{location.isEditing ? 'Edit Location' : location.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {location.isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">Location Name</label>
                        <Input
                          value={location.name}
                          onChange={(e) => handleInputChange(location.id, 'name', e.target.value)}
                          placeholder="e.g. Karnataka"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Location Code</label>
                        <Input
                          value={location.code}
                          onChange={(e) => handleInputChange(location.id, 'code', e.target.value.toUpperCase())}
                          placeholder="e.g. KA"
                          maxLength={2}
                          className="uppercase"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelEditing(location.id)}
                        >
                          <X size={16} className="mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveLocation(location)}
                          disabled={!location.name || !location.code}
                        >
                          <Save size={16} className="mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium">Code:</div>
                        <div className="bg-gray-100 px-3 py-1 rounded font-mono">{location.code}</div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEditing(location.id)}
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLocation(location.id)}
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {locations.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No locations found. Add your first location!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLocations;
