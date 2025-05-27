
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum NotificationType {
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered'
}

interface NotificationPayload {
  userId: string;
  orderId: string;
  type: NotificationType;
  email?: string;
  phone?: string;
  data?: Record<string, any>;
}

// Function to send a notification through multiple channels
export const sendNotification = async (payload: NotificationPayload): Promise<boolean> => {
  try {
    // Get user details if not provided
    if (!payload.email || !payload.phone) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('id', payload.userId)
        .single();

      if (userError) {
        console.error('Error fetching user data for notification:', userError);
        return false;
      }

      if (userData) {
        payload.email = payload.email || userData.email;
        payload.phone = payload.phone || userData.phone_number;
      }
    }

    // Send notification through available channels
    const results = await Promise.allSettled([
      sendEmailNotification(payload),
      sendWhatsAppNotification(payload)
    ]);

    // Check if at least one notification was sent successfully
    const atLeastOneSuccess = results.some(result => result.status === 'fulfilled' && result.value === true);
    
    return atLeastOneSuccess;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return false;
  }
};

// Function to send email notification
const sendEmailNotification = async (payload: NotificationPayload): Promise<boolean> => {
  try {
    if (!payload.email) {
      console.warn('No email provided for notification');
      return false;
    }

    // Call edge function to send email
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        channel: 'email',
        to: payload.email,
        type: payload.type,
        orderId: payload.orderId,
        data: payload.data
      }
    });

    if (error) {
      console.error('Error sending email notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendEmailNotification:', error);
    return false;
  }
};

// Function to send WhatsApp notification
const sendWhatsAppNotification = async (payload: NotificationPayload): Promise<boolean> => {
  try {
    if (!payload.phone) {
      console.warn('No phone number provided for WhatsApp notification');
      return false;
    }

    // Call edge function to send WhatsApp message
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        channel: 'whatsapp',
        to: payload.phone,
        type: payload.type,
        orderId: payload.orderId,
        data: payload.data
      }
    });

    if (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendWhatsAppNotification:', error);
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
