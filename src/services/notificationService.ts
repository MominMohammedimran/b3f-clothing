
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

// Function to send order notification email
export const sendOrderNotificationEmail = async (orderData: OrderNotificationData): Promise<boolean> => {
  try {
   const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: orderData
    });

    if (error) {
      console.error('Error sending order notification email:', error);
      return false;
    }

   return true;
  } catch (error) {
    console.error('Error in sendOrderNotificationEmail:', error);
    return false;
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