
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
      
      console.log('Creating order with data:', {
        userId,
        userEmail,
        orderNumber,
        totalAmount,
        deliveryFee,
        itemCount: cartItems.length,
        paymentMethod
      });
      
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
      
      console.log('Inserting order into database...');
      
      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          total: totalAmount,
          status: 'order_placed',
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
      
      console.log('Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}
