
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

/**
 * Service for handling payment-related operations
 */
export class PaymentService {
  private supabase: SupabaseClient | null = null;
  
  constructor(supabaseClient: SupabaseClient | null) {
    this.supabase = supabaseClient;
  }
  
  /**
   * Create a new order in the database
   */
  async createOrder(
    userId: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await this.supabase.rpc('create_order', {
        p_user_id: userId,
        p_order_number: orderNumber,
        p_total: totalAmount,
        p_status: 'processing',
        p_items: JSON.stringify(cartItems),
        p_payment_method: 'razorpay',
        p_delivery_fee: deliveryFee,
        p_shipping_address: JSON.stringify(shippingAddress)
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
  
  /**
   * Create order tracking information
   */
  async createOrderTracking(
    orderId: string,
    estimatedDeliveryDate: string
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await this.supabase.rpc('create_order_tracking', {
        p_order_id: orderId,
        p_status: 'pending',
        p_current_location: 'Warehouse',
        p_estimated_delivery: estimatedDeliveryDate,
        p_history: JSON.stringify([
          {
            status: 'order_placed',
            date: new Date().toISOString(),
            location: 'Online',
            description: 'Order has been placed successfully'
          }
        ])
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order tracking:', error);
      throw error;
    }
  }
  
  /**
   * Process a complete payment
   */
  async processPayment(
    userId: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    estimatedDeliveryDate: string
  ) {
    try {
      // Create order
      const orderData = await this.createOrder(
        userId,
        orderNumber,
        totalAmount,
        deliveryFee,
        cartItems,
        shippingAddress
      );
      
      if (!orderData) {
        throw new Error('Failed to create order');
      }
      
      // Create order tracking
      await this.createOrderTracking(orderData.id, estimatedDeliveryDate);
      
      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderNumber
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error('Payment processing failed. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Save shipping address for a user
   */
  async saveUserAddress(
    userId: string, 
    addressData: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }
  ) {
    try {
      if (!this.supabase) return null;
      
      // Check if address exists
      const { data: existingAddress } = await this.supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();
      
      const addressName = `${addressData.firstName} ${addressData.lastName}`;
      
      if (existingAddress) {
        // Update existing address
        const { data, error } = await this.supabase
          .from('addresses')
          .update({
            name: addressName,
            street: addressData.address,
            city: addressData.city,
            state: addressData.state,
            zipcode: addressData.zipCode,
            country: addressData.country,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAddress.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create new address
        const { data, error } = await this.supabase
          .from('addresses')
          .insert({
            user_id: userId,
            name: addressName,
            street: addressData.address,
            city: addressData.city,
            state: addressData.state,
            zipcode: addressData.zipCode,
            country: addressData.country,
            is_default: true
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }
}

export default PaymentService;
