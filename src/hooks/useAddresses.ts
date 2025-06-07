
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const useAddresses = (userId?: string) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
        return;
      }

      setAddresses(data || []);
      setDefaultAddress(data?.find(addr => addr.is_default) || null);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const addAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...addressData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAddresses();
      toast.success('Address added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      throw error;
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchAddresses();
      toast.success('Address updated successfully');
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
      throw error;
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchAddresses();
      toast.success('Address deleted successfully');
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
      throw error;
    }
  };

  return {
    addresses,
    defaultAddress,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    refetch: fetchAddresses,
  };
};
