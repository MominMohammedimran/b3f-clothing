import { Location } from '../lib/types';
import { supabase } from '../integrations/supabase/client';

// Create a new location
export const createLocation = async (location: Location): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      name: location.name,
      code: location.code ?? null
    })
    .select()
    .single(); // single() ensures only one row is returned

  if (error) throw error;
  return data;
};

// Add location alias
export const addLocation = createLocation;

// Get all locations
export const fetchAllLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*');

  if (error) throw error;
  return data ?? [];
};

// Get a single location by ID
export const getLocationById = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Update an existing location
export const updateLocation = async (
  id: string,
  updates: Partial<Location>
): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .update({
      name: updates.name,
      code: updates.code ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a location
export const deleteLocation = async (id: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

// Hook-style wrapper
export const useLocationService = () => ({
  fetchAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  addLocation
});

// Default export for flexibility
const locationService = {
  createLocation,
  addLocation,
  fetchAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation
};

export default locationService;
