
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum NotificationType {
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered'
}

interface OrderNotificationData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  orderItems: any[];
  totalAmount: number;
  shippingAddress?: any;
}

// Function to send order notification email via Cloudflare Function
export const sendOrderNotificationEmail = async (orderData: OrderNotificationData): Promise<boolean> => {
  try {
    console.log('Sending order notification email:', orderData);

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: orderData.customerEmail,
        subject: `Order ${orderData.status} - ${orderData.orderId}`,
        text: `Dear ${orderData.customerName},

Your order ${orderData.orderId} has been ${orderData.status}.

Order Details:
- Order ID: ${orderData.orderId}
- Total Amount: ₹${orderData.totalAmount}
- Status: ${orderData.status}

Thank you for shopping with B3F Prints & Men's Wear!

Best regards,
B3F Prints Team`
      })
    });

    if (!response.ok) {
      console.error('Error sending order notification email:', await response.text());
      return false;
    }

    console.log('Order notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error in sendOrderNotificationEmail:', error);
    return false;
  }
};

// Function to create Razorpay order
export const createRazorpayOrder = async (orderData: {
  amount: number;
  currency: string;
  receipt: string;
  cartItems: any[];
  shippingAddress: any;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
}): Promise<any> => {
  try {
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create Razorpay order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Function to send a notification through multiple channels
export const sendNotification = async (payload: any): Promise<boolean> => {
  try {
    // Send email notification for order updates
    if (payload.type === NotificationType.ORDER_CONFIRMED || 
        payload.type === NotificationType.ORDER_SHIPPED || 
        payload.type === NotificationType.ORDER_DELIVERED) {
      
      const orderNotificationData: OrderNotificationData = {
        orderId: payload.orderId,
        customerEmail: payload.email || '',
        customerName: payload.customerName || 'Customer',
        status: payload.type.replace('order_', ''),
        orderItems: payload.data?.orderItems || [],
        totalAmount: payload.data?.totalAmount || 0,
        shippingAddress: payload.data?.shippingAddress
      };

      return await sendOrderNotificationEmail(orderNotificationData);
    }

    return true;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return false;
  }
};

// Helper function to show notification to the user in the UI
export const notifyUser = (type: NotificationType, orderId: string): void => {
  let title = '';
  let message = '';

  switch (type) {
    case NotificationType.PAYMENT_CONFIRMED:
      title = 'Payment Confirmed';
      message = `Payment for order #${orderId} has been confirmed. Thank you!`;
      break;
    case NotificationType.ORDER_CONFIRMED:
      title = 'Order Confirmed';
      message = `Your order #${orderId} has been confirmed and is being processed.`;
      break;
    case NotificationType.ORDER_SHIPPED:
      title = 'Order Shipped';
      message = `Your order #${orderId} has been shipped and is on its way.`;
      break;
    case NotificationType.ORDER_DELIVERED:
      title = 'Order Delivered';
      message = `Your order #${orderId} has been delivered. Enjoy!`;
      break;
  }

  toast.success(message);
};