
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Address {
  id: string;
  user_id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
  is_default: boolean;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

// Helper function to convert database model to Address model
const mapDbToAddress = (item: any): Address => {
  return {
    id: item.id,
    user_id: item.user_id,
    name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
    first_name: item.first_name || '',
    last_name: item.last_name || '',
    street: item.street,
    city: item.city,
    state: item.state,
    zipcode: item.zipcode,
    country: item.country,
    phone: item.phone || '',
    is_default: !!item.is_default,
    created_at: item.created_at
  };
};

export const useAddresses = (userId: string | undefined) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAddresses = async () => {
    if (!userId) {
      setAddresses([]);
      setDefaultAddress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedAddresses = data.map(item => mapDbToAddress(item));
        setAddresses(mappedAddresses);
        
        const defaultAddr = mappedAddresses.find(addr => addr.is_default);
        setDefaultAddress(defaultAddr || null);
      }
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) {
      toast.error("User must be logged in to add an address");
      return null;
    }

    try {
      setLoading(true);

      // If this is the first address, make it default
      const isDefault = addresses.length === 0 ? true : address.is_default;

      // If setting as default, update all other addresses to not be default
      if (isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Prepare the address for insertion
      const dbAddress = {
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        phone: address.phone || '',
        is_default: isDefault,
        user_id: userId,
        first_name: address.first_name || '',
        last_name: address.last_name || ''
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert(dbAddress)
        .select()
        .single();

      if (error) throw error;

      await loadAddresses();
      toast.success("Address added successfully");
      return data ? mapDbToAddress(data) : null;
    } catch (err: any) {
      console.error('Error adding address:', err);
      toast.error("Failed to add address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, address: Partial<Address>) => {
    if (!userId) {
      toast.error("User must be logged in to update an address");
      return false;
    }

    try {
      setLoading(true);

      // If setting as default, update all other addresses to not be default
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { error } = await supabase
        .from('addresses')
        .update(address)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      await loadAddresses();
      toast.success("Address updated successfully");
      return true;
    } catch (err: any) {
      console.error('Error updating address:', err);
      toast.error("Failed to update address");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!userId) {
      toast.error("User must be logged in to delete an address");
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      await loadAddresses();
      toast.success("Address deleted successfully");
      return true;
    } catch (err: any) {
      console.error('Error deleting address:', err);
      toast.error("Failed to delete address");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setAsDefaultAddress = async (id: string) => {
    if (!userId) {
      toast.error("User must be logged in to update default address");
      return false;
    }

    try {
      setLoading(true);
      
      // First, set all addresses to non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      await loadAddresses();
      toast.success("Default address updated");
      return true;
    } catch (err: any) {
      console.error('Error setting default address:', err);
      toast.error("Failed to set default address");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefaultAddress
  };
};
