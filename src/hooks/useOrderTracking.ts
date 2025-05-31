
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, TrackingInfo } from '@/lib/types';
import { toast } from 'sonner';

export const useOrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Transform the data to match our Order interface
        const transformedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          order_number: order.order_number,
          userId: order.user_id,
          user_id: order.user_id,
          userEmail: order.user_email || '',
          user_email: order.user_email || '',
          items: Array.isArray(order.items) ? order.items : [],
          total: Number(order.total),
          status: order.status as 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending',
          paymentMethod: order.payment_method,
          payment_method: order.payment_method,
          shippingAddress: typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address,
          shipping_address: order.shipping_address,
          deliveryFee: Number(order.delivery_fee || 0),
          delivery_fee: Number(order.delivery_fee || 0),
          createdAt: order.created_at,
          created_at: order.created_at,
          updatedAt: order.updated_at,
          updated_at: order.updated_at,
          date: order.date || order.created_at,
          cancellationReason: order.cancellation_reason || undefined,
          cancellation_reason: order.cancellation_reason || undefined,
        }));

        setOrders(transformedOrders);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus as 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending', 
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : order
      ));

      toast.success('Order status updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
      return false;
    }
  };

  // Use the correct property name from the database schema
  const getOrderWithCancellation = (order: any) => {
    return {
      ...order,
      cancellation_reason: order.cancellation_reason || undefined
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    getOrderWithCancellation
  };
};
