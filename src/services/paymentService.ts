
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { CartItem } from '@/context/CartContext';

interface ShippingAddress {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  addressLine1?: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string;
  zipcode?: string;
  country: string;
  phone?: string;
  email?: string;
}

export const serializeCartItems = (items: CartItem[]) => {
  return items.map(item => ({
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || '',
    size: item.size || '',
    color: item.color || '',
    product_id: item.product_id,
  }));
};

export class PaymentService {
  private supabase: SupabaseClient | null = null;
  
  constructor(supabaseClient: SupabaseClient | null) {
    this.supabase = supabaseClient;
  }
  
  async createOrder(
    userId: string,
    userEmail: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string = 'razorpay'
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
   
      const serializedItems = serializeCartItems(cartItems);
      
      const normalizedAddress = {
        name: shippingAddress.fullName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || shippingAddress.name || '',
        street: shippingAddress.addressLine1 || shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipcode: shippingAddress.zipCode || shippingAddress.postalCode || shippingAddress.zipcode || '',
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone || '',
        email: shippingAddress.email || userEmail || ''
      };
      
      // Create order with separate payment and order status
      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          user_id: userId,
          user_email: userEmail,
          order_number: orderNumber,
          total: totalAmount,
          payment_status: 'pending',
          order_status: 'payment_pending',
          payment_method: paymentMethod,
          shipping_address: normalizedAddress,
          delivery_fee: deliveryFee,
          items: serializedItems,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Supabase error creating order:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: 'paid' | 'failed', orderStatus?: string) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      // Set order status based on payment status
      if (paymentStatus === 'paid') {
        updateData.order_status = orderStatus || 'pending';
      } else if (paymentStatus === 'failed') {
        updateData.order_status = 'payment_pending';
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        throw new Error(`Failed to update payment status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}
