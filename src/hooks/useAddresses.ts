
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Address {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        // Don't show error toast for empty results
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load addresses');
        }
        setAddresses([]);
        setDefaultAddress(null);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Transform data to match Address interface
        const transformedAddresses: Address[] = data.map((addr: any) => ({
          id: addr.id,
          user_id: addr.user_id,
          first_name: addr.first_name || addr.name?.split(' ')[0] || '',
          last_name: addr.last_name || addr.name?.split(' ').slice(1).join(' ') || '',
          name: addr.name,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipcode: addr.zipcode,
          country: addr.country || 'India',
          phone: addr.phone,
          is_default: addr.is_default || false,
          created_at: addr.created_at,
          updated_at: addr.updated_at
        }));

        setAddresses(transformedAddresses);
        const defaultAddr = transformedAddresses.find(addr => addr.is_default);
        setDefaultAddress(defaultAddr || transformedAddresses[0] || null);
      } else {
        setAddresses([]);
        setDefaultAddress(null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
      setDefaultAddress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  return {
    addresses,
    defaultAddress,
    loading,
    refetch: fetchAddresses
  };
};