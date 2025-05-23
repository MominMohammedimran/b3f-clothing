
import { Order, CartItem, ShippingAddress } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/lib/types';

/**
 * Generate a unique order ID
 * @returns string A unique order ID
 */
export const generateOrderId = (): string => {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `order-${timestamp}-${randomPart}`;
};

/**
 * Format order date to a readable format
 * @param dateString ISO date string
 * @returns formatted date string
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate the subtotal from order items
 * @param items array of cart items
 * @returns subtotal value
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Format shipping address as a single string
 * @param address shipping address object
 * @returns formatted address string
 */
export const formatAddress = (address: ShippingAddress | undefined | null): string => {
  if (!address) return 'No shipping address';
  
  // Handle the case where address is stored as a JSON string
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      return 'Invalid address format';
    }
  }
  
  const parts = [
    address.name,
    address.street,
    address.city,
    address.state,
    address.zipcode || address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Check if an order can be cancelled
 * @param order the order object
 * @returns boolean indicating if order can be cancelled
 */
export const canCancelOrder = (order: Order): boolean => {
  const nonCancelableStatuses = ['delivered', 'shipped', 'cancelled'];
  return !nonCancelableStatuses.includes(order.status);
};

/**
 * Get appropriate message for order status
 * @param status order status
 * @returns message explaining the status
 */
export const getOrderStatusMessage = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'Your order is being processed.';
    case 'shipped':
      return 'Your order has been shipped.';
    case 'out_for_delivery':
    case 'out for delivery':
      return 'Your order is out for delivery.';
    case 'delivered':
      return 'Your order has been delivered.';
    case 'cancelled':
      return 'Your order has been cancelled.';
    case 'order_placed':
    case 'order placed':
      return 'Your order has been placed successfully.';
    default:
      return 'Order received.';
  }
};

/**
 * Normalize order data to ensure consistent properties
 * @param orderData raw order data that might have inconsistent property names
 * @returns normalized order object
 */
export const normalizeOrderData = (orderData: any): Order => {
  return {
    id: orderData.id || '',
    order_number: orderData.order_number || orderData.orderNumber || '',
    user_id: orderData.user_id || orderData.userId || '',
    user_email: orderData.user_email || orderData.userEmail || '',
    items: parseOrderItems(orderData.items) || [],
    total: parseFloat(orderData.total) || 0,
    status: orderData.status || 'processing',
    payment_method: orderData.payment_method || orderData.paymentMethod || 'razorpay',
    shipping_address: orderData.shipping_address || orderData.shippingAddress || null,
    delivery_fee: parseFloat(orderData.delivery_fee || orderData.deliveryFee || '0'),
    created_at: orderData.created_at || orderData.date || new Date().toISOString(),
    date: orderData.date || orderData.created_at || new Date().toISOString(),
    updated_at: orderData.updated_at || orderData.created_at || new Date().toISOString(),
    cancellation_reason: orderData.cancellation_reason || ''
  };
};

/**
 * Parse order items from various formats
 * @param items Items that could be in string, Json, or array format
 * @returns Array of cart items
 */
export const parseOrderItems = (items: any): CartItem[] => {
  // If items is already an array and looks like CartItem[], return it
  if (Array.isArray(items) && items.length > 0 && 
      'name' in items[0] && 'price' in items[0] && 'quantity' in items[0]) {
    return items as CartItem[];
  }
  
  // If items is a JSON string, parse it
  if (typeof items === 'string') {
    try {
      const parsedItems = JSON.parse(items);
      if (Array.isArray(parsedItems)) {
        return parsedItems.map(item => ({
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: item.name || 'Product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          image: item.image || '',
          size: item.size,
          color: item.color,
          options: item.options
        }));
      }
    } catch (e) {
      console.error('Failed to parse order items:', e);
    }
  }
  
  // For other cases (like Json type from Supabase)
  if (items && typeof items === 'object') {
    // Handle case where it's a Json object but not an array
    if (!Array.isArray(items)) {
      return Object.entries(items).map(([key, value]: [string, any]) => ({
        id: value.id || key,
        name: value.name || 'Product',
        price: parseFloat(value.price) || 0,
        quantity: parseInt(value.quantity) || 1,
        image: value.image || '',
        size: value.size,
        color: value.color,
        options: value.options
      }));
    }
    
    // Handle case where it's already an array-like Json
    return (items as any[]).map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || 'Product',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      image: item.image || '',
      size: item.size,
      color: item.color,
      options: item.options
    }));
  }
  
  return []; // Return empty array as fallback
};

/**
 * Create an order in the database
 * @param orderData Order data to save
 * @returns The created order or null if failed
 */
export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // Make sure we have the required fields
    if (!orderData.user_id || !orderData.items || !orderData.total) {
      console.error('Missing required order fields');
      return null;
    }
    
    // Generate an order number if none provided
    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;
    
    // Convert items to Json for storage
    const serializedItems = serializeCartItems(orderData.items);
    
    // Insert the order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        user_email: orderData.user_email || '',
        order_number: orderNumber,
        total: orderData.total,
        status: orderData.status || 'processing',
        payment_method: orderData.payment_method || 'razorpay',
        shipping_address: orderData.shipping_address || null,
        delivery_fee: orderData.delivery_fee || 0,
        items: serializedItems,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return null;
    }
    
    // Convert the returned data (with Json items) back to Order type
    const returnedOrder: any = data;
    returnedOrder.items = parseOrderItems(returnedOrder.items);
    
    return returnedOrder as Order;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
};

/**
 * Update payment details for an order
 * @param orderId The ID of the order to update
 * @param paymentDetails Payment details to save
 * @returns boolean indicating success
 */
export const updateOrderPaymentDetails = async (
  orderId: string,
  paymentDetails: any
): Promise<boolean> => {
  try {
    // Update the order with payment details
    const { error } = await supabase
      .from('orders')
      .update({
        payment_details: paymentDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order payment details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update order payment details:', error);
    return false;
  }
};

/**
 * Serialize cart items for storage in database
 * @param items Array of cart items
 * @returns JSON serializable object
 */
export const serializeCartItems = (items: CartItem[]): Json => {
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
  })) as Json;
};

/**
 * Calculate estimated delivery date
 * @param orderDate Base date for calculation
 * @param daysToAdd Number of days to add (default: 5)
 * @returns ISO date string for estimated delivery
 */
export const calculateEstimatedDelivery = (orderDate: Date, daysToAdd: number = 5): string => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  
  // Skip weekends (Saturday and Sunday)
  const dayOfWeek = deliveryDate.getDay();
  if (dayOfWeek === 0) { // Sunday
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  } else if (dayOfWeek === 6) { // Saturday
    deliveryDate.setDate(deliveryDate.getDate() + 2);
  }
  
  return deliveryDate.toISOString();
};

/**
 * Update inventory levels when an order is placed
 * @param items The ordered items
 * @returns Boolean indicating success
 */
export const updateInventoryLevels = async (items: CartItem[]): Promise<boolean> => {
  try {
    for (const item of items) {
      if (item.size && item.quantity) {
        const productType = item.productId?.split('-')[0] || 'tshirt';
        
        // Get current inventory level
        const { data, error } = await supabase
          .from('products')
          .select('stock')
          .eq('category', 'inventory')
          .eq('name', `${productType}_${item.size}`)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching inventory:', error);
          continue;
        }
        
        // If product exists, update the stock level
        if (data) {
          const newStock = Math.max(0, (data.stock || 0) - item.quantity);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('category', 'inventory')
            .eq('name', `${productType}_${item.size}`);
            
          if (updateError) {
            console.error('Error updating inventory:', updateError);
            continue;
          }
          
          console.log(`Updated inventory for ${productType}_${item.size} to ${newStock}`);
        } else {
          console.warn(`Product inventory record not found: ${productType}_${item.size}`);
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return false;
  }
};
