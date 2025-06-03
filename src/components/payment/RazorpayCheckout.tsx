
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      console.log('Creating Razorpay order with Supabase function...');
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount * 100,
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
    setLoading(true);
    
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const orderData = await createRazorpayOrder();

      const options = {
        key: orderData.key_id || 'rzp_live_FQUylFpHDtgrDj',
        amount: orderData.amount,
        currency: orderData.currency,
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
            setLoading(false);
            onError();
          }
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          setLoading(false);
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setLoading(false);
        toast.error(`Payment failed: ${response.error.description}`);
        onError();
      });

      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      setLoading(false);
      toast.error('Failed to initialize payment. Please try again.');
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
