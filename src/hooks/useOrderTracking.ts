
import { useSupabaseClient } from './useSupabase';
import { TrackingInfo } from '../lib/types';
import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';

export const useOrderTracking = (orderId: string | undefined) => {
  const supabase = useSupabaseClient() as SupabaseClient;

  const fetchTracking = async (): Promise<TrackingInfo> => {
    if (!orderId) throw new Error('Order ID is missing');

    try {
      // First try to get tracking info from order_tracking table
      const { data: trackingData, error: trackingError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (!trackingError && trackingData) {
        console.log('Found tracking data:', trackingData);
        return trackingData as TrackingInfo;
      }

      // If no tracking data, get order data to generate tracking
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('status, created_at, updated_at')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw new Error('Could not find order information');
      }

      if (!orderData) {
        throw new Error('Order not found');
      }

      // Generate tracking info from order status
      const today = new Date();
      const createdAt = new Date(orderData.created_at);
      const updatedAt = new Date(orderData.updated_at || today);
      const orderStatus = orderData.status?.toLowerCase() || 'processing';

      // Create tracking history from order status
      const history = [];
      
      // Always add processing status
      history.push({
        status: 'processing',
        timestamp: createdAt.toISOString(),
        location: 'B3F Prints and Mens Wear Shop',
        description: 'Order is being processed'
      });

      if (['shipped', 'out_for_delivery', 'delivered'].includes(orderStatus)) {
        history.push({
          status: 'shipped',
          timestamp: new Date(updatedAt.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Distribution Center',
          description: 'Order has been shipped'
        });
      }

      if (['out_for_delivery', 'delivered'].includes(orderStatus)) {
        history.push({
          status: 'out_for_delivery',
          timestamp: new Date(updatedAt.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Local Delivery Hub',
          description: 'Order is out for delivery'
        });
      }

      if (orderStatus === 'delivered') {
        history.push({
          status: 'delivered',
          timestamp: updatedAt.toISOString(),
          location: 'Delivery Address',
          description: 'Order has been delivered'
        });
      }

      // Determine estimated delivery date (5 days from order creation)
      const estimatedDeliveryDate = new Date(createdAt);
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
      
      // Create tracking info from order data
      const trackingInfo: TrackingInfo = {
        id: `tracking-${orderId}`,
        order_id: orderId,
        status: orderStatus,
        timestamp: updatedAt.toISOString(),
        location: orderStatus === 'delivered' ? 'Delivered' : 
                orderStatus === 'shipped' || orderStatus === 'out_for_delivery' ? 'Out for delivery' : 
                'Processing Center',
        currentLocation: orderStatus === 'delivered' ? 'Delivered' : 
                        orderStatus === 'shipped' || orderStatus === 'out_for_delivery' ? 'Out for delivery' : 
                        'Processing Center',
        estimatedDelivery: estimatedDeliveryDate.toLocaleDateString(),
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString(),
        history
      };

      // Create entry in order_tracking table for future reference
      try {
        const { error } = await supabase
          .from('order_tracking')
          .insert([{
            order_id: orderId,
            status: orderStatus,
            current_location: trackingInfo.currentLocation,
            estimated_delivery: estimatedDeliveryDate.toISOString(),
            history: history,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('Error creating tracking record:', error);
        }
      } catch (err) {
        console.error('Failed to create tracking record:', err);
      }

      return trackingInfo;
    } catch (error) {
      console.error('Error fetching tracking:', error);
      throw error;
    }
  };

  const {
    data: tracking,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tracking', orderId],
    queryFn: fetchTracking,
    enabled: !!orderId,
    staleTime: 60000,
    retry: 1
  });

  return { tracking, loading: isLoading, error };
};
