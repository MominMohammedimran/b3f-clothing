
import { Location } from '../lib/types';
import { supabase } from '../integrations/supabase/client';

export const createLocation = async (location: Location) => {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      name: location.name,
      code: location.code
      // Don't include fields that don't exist in the database
    })
    .select();

  if (error) throw error;
  return data?.[0] as Location;
};

export const addLocation = async (location: Location) => {
  return createLocation(location);
};

export const fetchAllLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, code');  // Only select columns that exist in the database

  if (error) throw error;
  return (data || []) as Location[];
};

export const getLocationById = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Location;
};

export const updateLocation = async (id: string, updates: Partial<Location>) => {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  // Only include fields that exist in the database
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.code !== undefined) updateData.code = updates.code;
  
  const { data, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0] as Location;
};

export const deleteLocation = async (id: string) => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

// Custom hook for location service
export const useLocationService = () => {
  return {
    fetchAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    addLocation
  };
};

const locationService = {
  createLocation,
  fetchAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addLocation,
};

export default locationService;
