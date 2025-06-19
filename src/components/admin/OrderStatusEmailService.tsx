
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  orderItems: any[];
  totalAmount: number;
  shippingAddress?: any;
}

export const sendOrderStatusEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('🚀 Attempting to send order status email:', orderData);
    
    if (!orderData.customerEmail || orderData.customerEmail === 'N/A' || orderData.customerEmail.trim() === '') {
      console.warn('❌ No valid customer email provided:', orderData.customerEmail);
      toast.error('Cannot send email - no valid customer email address');
      return false;
    }

    const loadingToast = toast.loading('📧 Sending email notification...');

    console.log('📡 Invoking send-order-notification function...');
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail.trim(),
        customerName: orderData.customerName || 'Customer',
        status: orderData.status,
        orderItems: orderData.orderItems || [],
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        businessEmail: 'b3f.prints.pages.dev@gmail.com',
        emailType: 'status_update',
        orderDetails: {
          orderNumber: orderData.orderId,
          items: orderData.orderItems,
          total: orderData.totalAmount,
          status: orderData.status,
          shippingAddress: orderData.shippingAddress
        }
      }
    });

    toast.dismiss(loadingToast);

    if (error) {
      console.error('❌ Supabase function error:', error);
      toast.error(`Failed to send email: ${error.message}`);
      return false;
    }

    console.log('✅ Order status email sent successfully:', data);
    toast.success(`✅ Order details email sent to ${orderData.customerEmail}`, {
      duration: 5000
    });
    return true;
  } catch (error) {
    console.error('💥 Failed to send order status email:', error);
    toast.error('❌ Failed to send order details email');
    return false;
  }
};

export const notifyOrderStatusChange = async (
  orderId: string,
  newStatus: string,
  customerEmail: string,
  orderItems: any[],
  totalAmount: number,
  shippingAddress?: any
) => {
  console.log('📬 notifyOrderStatusChange called with:', {
    orderId,
    newStatus,
    customerEmail,
    orderItems: orderItems?.length || 0,
    totalAmount
  });

  if (!customerEmail || customerEmail === 'N/A' || customerEmail.trim() === '') {
    console.warn('⚠️ Invalid customer email provided:', customerEmail);
    toast.warning('Cannot send email notification - no valid email address');
    return false;
  }

  const emailData: OrderEmailData = {
    orderId,
    customerEmail: customerEmail.trim(),
    customerName: 'Customer',
    status: newStatus,
    orderItems: orderItems || [],
    totalAmount: totalAmount || 0,
    shippingAddress
  };

  const success = await sendOrderStatusEmail(emailData);
  
  if (success) {
    console.log('✅ Order details email notification sent successfully');
  } else {
    console.log('❌ Order details email notification failed');
  }
  
  return success;
};

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('🎉 Sending order confirmation email with full details:', orderData);
    
    if (!orderData.customerEmail || orderData.customerEmail === 'N/A' || orderData.customerEmail.trim() === '') {
      console.warn('❌ No valid customer email provided for confirmation');
      toast.error('Cannot send confirmation email - no valid email address');
      return false;
    }

    const loadingToast = toast.loading('📧 Sending order confirmation with details...');

    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail.trim(),
        customerName: orderData.customerName || 'Customer',
        status: 'confirmed',
        orderItems: orderData.orderItems || [],
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        businessEmail: 'b3f.prints.pages.dev@gmail.com',
        emailType: 'confirmation',
        orderDetails: {
          orderNumber: orderData.orderId,
          items: orderData.orderItems,
          total: orderData.totalAmount,
          status: 'confirmed',
          shippingAddress: orderData.shippingAddress
        }
      }
    });

    toast.dismiss(loadingToast);

    if (error) {
      console.error('❌ Error sending order confirmation email:', error);
      toast.error(`Failed to send confirmation email: ${error.message}`);
      return false;
    }

    console.log('✅ Order confirmation email with details sent successfully:', data);
    toast.success(`✅ Order confirmation with details sent to ${orderData.customerEmail}`, {
      duration: 5000
    });
    return true;
  } catch (error) {
    console.error('💥 Failed to send order confirmation email:', error);
    toast.error('❌ Failed to send order confirmation email');
    return false;
  }
};