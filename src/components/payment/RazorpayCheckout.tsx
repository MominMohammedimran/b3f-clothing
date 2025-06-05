
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RazorpayCheckoutProps {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  cartItems: any[];
  shippingAddress: any;
  onSuccess: (response: any) => void;
  onError: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  customerInfo,
  cartItems,
  shippingAddress,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      console.log('Creating Razorpay order with Supabase function...');
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          cartItems,
          shippingAddress,
          customerInfo
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from order creation');
      }

      console.log('Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Load Razorpay script
      console.log('Loading Razorpay script...');
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create order
      console.log('Creating order...');
      const orderData = await createRazorpayOrder();

      // Validate required fields
      if (!customerInfo.name || !customerInfo.email || !customerInfo.contact) {
        throw new Error('Please provide all required customer information');
      }

      const options = {
        key: orderData.key_id || 'rzp_live_FQUylFpHDtgrDj',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'B3F Prints & Men\'s Wear',
        description: 'Custom Print Order',
        order_id: orderData.order_id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
            toast.info('Payment cancelled by user');
          }
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          setLoading(false);
          toast.success('Payment completed successfully!');
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            order_number: orderData.order_number,
            db_order_id: orderData.db_order_id
          });
        }
      };

      console.log('Opening Razorpay with options:', {
        ...options,
        key: options.key // Don't log sensitive data
      });

      // Create Razorpay instance
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setLoading(false);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        onError();
      });

      // Open Razorpay payment modal
      rzp.open();

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setLoading(false);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      onError();
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
    </Button>
  );
};

export default RazorpayCheckout;
