import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderTrackingHistoryItem {
  status: string;
  location: string;
  timestamp: string;
  description?: string;
}

interface OrderTrackingData {
  id: string;
  order_id: string;
  status: string;
  current_location?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  timestamp: string;
  history: OrderTrackingHistoryItem[];
}

export const useOrderTracking = (orderId: string) => {
  const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchTrackingData = async () => {
      try {
        setLoading(true);

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) {
          throw orderError;
        }

        if (!orderData) {
          throw new Error('Order not found');
        }

        const { data: trackingRows, error: trackingError } = await supabase
          .from('order_tracking')
          .select('*')
          .eq('order_id', orderId);

        if (trackingError && trackingError.code !== 'PGRST116') {
          throw trackingError;
        }

        // Combine tracking rows into a single history array
        const history = trackingRows?.map((row) => ({
          status: row.status,
          location: row.current_location || 'Unknown',
          timestamp: row.timestamp,
          description: row.description || '',
        })) || [];

        // Use latest tracking status from last row or fallback to order status
        const latestTracking = trackingRows && trackingRows.length > 0
          ? trackingRows[trackingRows.length - 1]
          : null;

        const trackingInfo: OrderTrackingData = {
          id: latestTracking?.id || `order-${orderId}`,
          order_id: orderId,
          status: latestTracking?.status || orderData.status || 'processing',
          current_location: latestTracking?.current_location || 'Processing Center',
          timestamp: orderData.created_at,
          estimated_delivery: latestTracking?.estimated_delivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tracking_number: latestTracking?.tracking_number || orderData.order_number,
          history: history.length > 0 ? history : [
            {
              status: 'Order Placed',
              location: 'Online',
              timestamp: orderData.created_at,
              description: 'Your order has been placed successfully',
            },
            {
              status: orderData.status || 'processing',
              location: 'Processing Center',
              timestamp: orderData.updated_at || orderData.created_at,
              description: `Order status: ${orderData.status || 'processing'}`,
            },
          ],
        };

        setTracking(trackingInfo);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [orderId]);

  return { tracking, loading, error };
};
