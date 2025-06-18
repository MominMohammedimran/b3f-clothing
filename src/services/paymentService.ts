
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/lib/types';

export interface OrderData {
  items: CartItem[];
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  userId: string;
  userEmail: string;
}

export const createOrder = async (orderData: OrderData) => {
  try {
    // Calculate total quantity from all items
    const totalQuantity = orderData.items.reduce((sum, item) => 
      sum + item.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0), 0
    );

    // Transform items for database storage
    const transformedItems = orderData.items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      sizes: item.sizes,
      image: item.image || '',
      color: item.color || '',
      metadata: item.metadata || null,
    }));

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: orderData.userId,
        user_email: orderData.userEmail,
        items: transformedItems as any,
        total: orderData.total,
        status: 'processing',
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
