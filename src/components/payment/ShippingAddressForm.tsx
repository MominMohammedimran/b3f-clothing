
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RazorpayCheckoutProps {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  cartItems: any[];
  shippingAddress: any;
  onSuccess: (data: any) => void;
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

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order on backend
      const { data: orderData, error } = await supabase.functions.invoke('create-razorpay-order', {
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
        console.error('Error creating Razorpay order:', error);
        throw new Error('Failed to create payment order');
      }

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      console.log('Razorpay order created:', orderData);

      // Configure Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'B3F Prints',
        description: 'Custom Product Order',
        order_id: orderData.order_id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact
        },
        theme: {
          color: '#4F46E5'
        },
        handler: function (response: any) {
          console.log('Razorpay payment success:', response);
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay payment cancelled');
            onError();
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed to initialize');
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? 'Loading...' : `Pay with Razorpay - ₹${amount.toFixed(2)}`}
    </Button>
  );
};

export default RazorpayCheckout;