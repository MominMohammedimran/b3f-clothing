
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Order, CartItem, ShippingAddress } from '@/lib/types';
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
        
          // Parse shipping_address if it's a string
          const parsedShippingAddress = data.shipping_address ? 
            (typeof data.shipping_address === 'string' ? 
              JSON.parse(data.shipping_address) : data.shipping_address) : null;
          
          // Create a properly typed order object
          const typedOrder: Order = {
            id: data.id,
            order_number: data.order_number,
            user_id: data.user_id,
            total: data.total,
            status: data.status,
            items: itemsWithIds,
            payment_method: data.payment_method,
            delivery_fee: data.delivery_fee || 0,
            shipping_address: parsedShippingAddress as ShippingAddress,
            created_at: data.created_at,
            updated_at: data.updated_at,
            date: data.date
          };
          
          setOrderData(typedOrder);
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
