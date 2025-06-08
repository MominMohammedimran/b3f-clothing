
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const generateB3FOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `B3F${timestamp}${randomNum}`;
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const orderNumber = generateB3FOrderNumber();

      // Try Supabase Edge Function first
      let response;
      let data;

      try {
        response = await fetch('https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/create-razorpay-order', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE`
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: orderNumber,
            cartItems,
            shippingAddress,
            customerInfo,
            orderNumber
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText || 'Unknown error'}`);
        }

        const responseText = await response.text();
        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid JSON response from server');
        }

      } catch (error) {
        console.error('Payment setup error:', error);
        throw error;
      }

      if (!data || !data.order_id) {
        throw new Error('Invalid response: missing order_id');
      }

      // Configure Razorpay options
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'B3F Prints & Men\'s Wear',
        description: 'Order Payment',
        order_id: data.order_id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact
        },
        theme: {
          color: '#2563eb'
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          onSuccess(response);
          navigate(`/order-complete?orderId=${data.db_order_id}&orderNumber=${data.order_number || orderNumber}`);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
            toast.error('Payment cancelled');
            onError();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
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
      {loading ? 'Loading...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
    </Button>
  );
};

export default RazorpayCheckout;