
import { supabase } from '@/integrations/supabase/client';

export interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  orderDetails: {
    total: number;
    items: any[];
  };
  status?: string;
  emailType: 'confirmation' | 'status_update';
  shippingAddress?: any;
}

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        status: 'confirmed',
        orderItems: orderData.orderDetails.items,
        totalAmount: orderData.orderDetails.total,
        shippingAddress: orderData.shippingAddress,
        businessEmail: 'b3f.prints.pages.dev@gmail.com' // Added business email
      }
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
    
   return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderStatusUpdateEmail = async (orderData: OrderEmailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        status: orderData.status || 'processing',
        orderItems: orderData.orderDetails.items,
        totalAmount: orderData.orderDetails.total,
        shippingAddress: orderData.shippingAddress,
        businessEmail: 'b3f.prints.pages.dev@gmail.com' // Added business email
      }
    });

    if (error) {
      console.error('Error sending order status update email:', error);
      throw error;
    }
    
     return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send order status update email:', error);
    return { success: false, error: error.message };
  }
};

export const handleOrderStatusChange = async (
  orderId: string,
  newStatus: string,
  customerEmail: string,
  customerName: string,
  orderItems: any[],
  totalAmount: number,
  shippingAddress?: any
) => {
  const emailData: OrderEmailData = {
    orderNumber: orderId,
    customerEmail,
    customerName,
    status: newStatus,
    orderDetails: {
      total: totalAmount,
      items: orderItems
    },
    emailType: 'status_update',
    shippingAddress
  };

  return await sendOrderStatusUpdateEmail(emailData);
};
