
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Order, CartItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';

export const useOrderData = () => {
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { orderId } = useParams();
  const { totalPrice } = useCart();

  // Load order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        setLoading(true);
        
        // Try to get from Supabase first
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert any items from string to object if needed
          const parsedItems = typeof data.items === 'string' 
            ? JSON.parse(data.items) 
            : data.items;
            
          // Ensure each item has an id
          const itemsWithIds = parsedItems.map((item: any) => ({
            id: item.id || item.productId || `item-${Math.random().toString(36).substr(2, 9)}`,
            productId: item.productId || '',
            name: item.name || 'Product',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || '',
            size: item.size,
            view: item.view,
            backImage: item.backImage,
            color: item.color,
            options: item.options
          }));
        
          // Transform to match Order interface
          const transformedOrder: Order = {
            id: data.id,
            userId: data.user_id,
            user_id: data.user_id,
            userEmail: '', // Not available in database
            user_email: '', // Not available in database
            orderNumber: data.order_number,
            order_number: data.order_number,
            total: data.total,
            deliveryFee: data.delivery_fee,
            delivery_fee: data.delivery_fee,
            items: itemsWithIds,
            status: data.status as 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending',
            date: data.date || data.created_at,
            createdAt: data.created_at,
            created_at: data.created_at,
            updatedAt: data.updated_at,
            updated_at: data.updated_at,
            paymentMethod: data.payment_method,
            payment_method: data.payment_method,
            shippingAddress: typeof data.shipping_address === 'string' 
              ? JSON.parse(data.shipping_address) 
              : data.shipping_address,
            shipping_address: data.shipping_address,
            paymentDetails: {},
            payment_details: {},
            cancellationReason: (data as any).cancellation_reason || undefined,
            cancellation_reason: (data as any).cancellation_reason || undefined
          };
          
          setOrderData(transformedOrder);
        } else {
          // Fallback to local storage
          const storedOrders = localStorage.getItem('orderHistory');
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders);
            const foundOrder = parsedOrders.find((o: Order) => o.id === orderId);
            
            if (foundOrder) {
              setOrderData(foundOrder);
            } else {
              setError('Order not found');
            }
          } else {
            setError('No orders found');
          }
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order');
        
        // Try fallback to local storage
        try {
          const storedOrders = localStorage.getItem('orderHistory');
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders);
            const foundOrder = parsedOrders.find((o: Order) => o.id === orderId);
            
            if (foundOrder) {
              // Ensure each item has an id
              const itemsWithIds = foundOrder.items.map((item: any) => ({
                id: item.id || item.productId || `item-${Math.random().toString(36).substr(2, 9)}`,
                productId: item.productId || '',
                name: item.name || 'Product',
                price: item.price || 0,
                quantity: item.quantity || 1,
                image: item.image || '',
                size: item.size,
                view: item.view,
                backImage: item.backImage,
                color: item.color,
                options: item.options
              }));
              
              setOrderData({
                ...foundOrder,
                items: itemsWithIds
              });
              setError(null);
            }
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { orderData, loading, error };
};

export default useOrderData;
