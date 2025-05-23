
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { CartItem } from '@/lib/types'; // Import the correct CartItem type

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

/**
 * Serialize cart items for storage in database
 * @param items Array of cart items
 * @returns JSON serializable object
 */
export const serializeCartItems = (items: CartItem[]) => {
  // Convert CartItem[] to a plain JSON object that can be stored in Supabase
  return items.map(item => ({
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || '',
    size: item.size || '',
    color: item.color || '',
    options: item.options || {},
    productId: item.productId || item.id,
    view: item.view || '',
    backImage: item.backImage || '',
  }));
};

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
      
      // Ensure all cart items have required id property
      const validatedCartItems: CartItem[] = cartItems.map(item => ({
        ...item,
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      // Serialize the cart items for storage
      const serializedItems = serializeCartItems(validatedCartItems);
      
      // Normalize shipping address to ensure consistent property names
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
      
      // Create the basic payment details object
      const paymentDetails = {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'processing',
        timestamp: new Date().toISOString()
      };
      
      console.log('Creating order with payment details:', paymentDetails);
      console.log('Shipping address:', normalizedAddress);
      
      // Create the order in the database with error handling
      try {
        const { data, error } = await this.supabase
          .from('orders')
          .insert({
            user_id: userId,
            user_email: userEmail || '',
            order_number: orderNumber,
            total: totalAmount,
            status: 'order_placed',
            payment_method: paymentMethod,
            shipping_address: normalizedAddress,
            delivery_fee: deliveryFee,
            items: serializedItems,
            payment_details: paymentDetails,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error creating order:', error);
          throw error;
        }
        
        console.log('Order created successfully:', data);
        return data;
      } catch (insertError) {
        console.error('Error during order insert:', insertError);
        throw new Error('Failed to insert order into database');
      }
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
      
      const { data, error } = await this.supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status: 'pending',
          current_location: 'Warehouse',
          estimated_delivery: estimatedDeliveryDate,
          history: [
            {
              status: 'order_placed',
              date: new Date().toISOString(),
              location: 'Online',
              description: 'Order has been placed successfully'
            }
          ]
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order tracking:', error);
      // Don't throw here, just return null so the main process can continue
      return null;
    }
  }
  
  /**
   * Process a complete payment
   */
  async processPayment(
    userId: string,
    userEmail: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    estimatedDeliveryDate: string,
    paymentMethod: string = 'razorpay',
    paymentDetails: any = {}
  ) {
    try {
      console.log('Processing payment with method:', paymentMethod);
      
      if (!userId || !userEmail) {
        console.error('Missing user info:', { userId, userEmail });
        return {
          success: false,
          error: 'User information is missing'
        };
      }
      
      if (!cartItems || cartItems.length === 0) {
        console.error('No items in cart');
        return {
          success: false, 
          error: 'No items in cart'
        };
      }
      
      // Log shippingAddress for debugging
      console.log('Shipping address received:', shippingAddress);
      
      // Validate address fields
      if (!shippingAddress.city || !shippingAddress.state || !shippingAddress.country) {
        console.error('Incomplete shipping address:', shippingAddress);
        return {
          success: false,
          error: 'Shipping address is incomplete'
        };
      }
      
      // Ensure all cart items have required id property
      const validatedCartItems: CartItem[] = cartItems.map(item => ({
        ...item,
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      // Create order with basic payment details
      let orderData;
      try {
        orderData = await this.createOrder(
          userId,
          userEmail,
          orderNumber,
          totalAmount,
          deliveryFee,
          validatedCartItems,
          shippingAddress,
          paymentMethod
        );
      } catch (orderError: any) {
        console.error('Failed to create order:', orderError);
        return {
          success: false,
          error: orderError.message || 'Failed to create order in database'
        };
      }
      
      if (!orderData) {
        console.error('No order data returned');
        return {
          success: false,
          error: 'Failed to create order'
        };
      }
      
      // If we have additional payment details (like from Razorpay), update them
      if (Object.keys(paymentDetails).length > 0 && paymentMethod === 'razorpay') {
        try {
          await this.updatePaymentDetails(orderData.id, paymentDetails);
        } catch (paymentError) {
          console.error('Error updating payment details:', paymentError);
          // Continue even if payment details update fails
        }
      }
      
      // Try to create order tracking
      try {
        await this.createOrderTracking(orderData.id, estimatedDeliveryDate);
      } catch (trackingError) {
        console.error('Warning: Could not create tracking info:', trackingError);
        // Continue even if tracking creation fails
      }
      
      console.log('Order processed successfully:', orderData.id);
      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderNumber
      };
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      toast.error('Payment processing failed. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Update payment details for an existing order
   */
  async updatePaymentDetails(
    orderId: string,
    paymentDetails: any
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Create the payment details object including timestamps
      const updatedDetails = {
        ...paymentDetails,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase
        .from('orders')
        .update({
          payment_details: updatedDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment details:', error);
      throw error;
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
      phone?: string;
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
            phone: addressData.phone || '',
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
            phone: addressData.phone || '',
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
