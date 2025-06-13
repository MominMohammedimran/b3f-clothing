
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliverySettings {
  delivery_fee: number;
  min_order_amount: number;
}

interface DeliverySettingsData {
  delivery_fee: number;
  min_order_amount: number;
}

export const useDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettings>({
    delivery_fee: 80,
    min_order_amount: 100
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_delivery_settings');
      
      if (error) {
        console.error('Error fetching delivery settings:', error);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const settingsData = data[0] as unknown as DeliverySettingsData;
        setSettings({
          delivery_fee: settingsData.delivery_fee,
          min_order_amount: settingsData.min_order_amount
        });
      }
    } catch (error) {
      console.error('Error in useDeliverySettings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Return refetch function to allow manual refresh
  return { settings, loading, refetch: fetchSettings };
};
