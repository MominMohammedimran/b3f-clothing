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

type NewAddressInput = Omit<Address, 'id' | 'user_id' | 'created_at'>;

const mapDbToAddress = (item: any): Address => ({
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
  created_at: item.created_at,
});

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
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data.map(mapDbToAddress);
      setAddresses(mapped);
      setDefaultAddress(mapped.find(addr => addr.is_default) || mapped[0] || null);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: NewAddressInput) => {
    if (!userId) {
      toast.error('User must be logged in to add an address');
      return null;
    }

    try {
      setLoading(true);

      const isDefault = addresses.length === 0 || address.is_default;

      if (isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: userId,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Address added');
      await loadAddresses();
      return mapDbToAddress(data);
    } catch (err: any) {
      console.error('Error adding address:', err);
      toast.error('Failed to add address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, address: Partial<NewAddressInput>) => {
    if (!userId) {
      toast.error('User must be logged in to update an address');
      return false;
    }

    try {
      setLoading(true);

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

      toast.success('Address updated');
      await loadAddresses();
      return true;
    } catch (err: any) {
      console.error('Error updating address:', err);
      toast.error('Failed to update address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!userId) {
      toast.error('User must be logged in to delete an address');
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

      toast.success('Address deleted');
      await loadAddresses();
      return true;
    } catch (err: any) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setAsDefaultAddress = async (id: string) => {
    if (!userId) {
      toast.error('User must be logged in to update default address');
      return false;
    }

    try {
      setLoading(true);

      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Default address updated');
      await loadAddresses();
      return true;
    } catch (err: any) {
      console.error('Error setting default address:', err);
      toast.error('Failed to set default address');
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
    setAsDefaultAddress,
  };
};
