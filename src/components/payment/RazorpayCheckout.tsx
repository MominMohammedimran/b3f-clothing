import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
  onError,
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
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const orderNumber = generateB3FOrderNumber();

      // ✅ Get the logged-in user's access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You must be logged in to proceed with payment.');
      }

      // 🔁 Send request to Cloudflare function or API
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // ✅ real token
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: orderNumber,
          cartItems,
          shippingAddress,
          customerInfo,
          orderNumber,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);g
        throw new Error('Invalid JSON response from server');
      }

      if (!data || !data.order_id) {
        throw new Error('Invalid response: missing order_id');
      }

      // 🧾 Razorpay Checkout Options
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
          contact: customerInfo.contact,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: any) {
  console.log('Payment successful:', response);
  toast.success('Payment successful!');

  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerInfo.email,
        subject: `B3F Prints: Order ${data.order_number} Confirmation`,
        text: `Dear ${customerInfo.name},

We have received your payment for order ${data.order_number}.
Thank you for shopping with B3F Prints!

🧾 Order Total: ₹${(amount).toFixed(2)}
🛒 Order ID: ${data.order_number}
📦 We will notify you once it is shipped.

– B3F Prints & Men's Wear`,
      }),
    });

    toast.success('Confirmation email sent');
  } catch (emailError) {
    console.warn('Email sending failed:', emailError);
    toast.warning('Order confirmed, but email failed to send');
  }

  onSuccess(response);
  navigate(`/order-complete?orderId=${data.db_order_id}&orderNumber=${data.order_number || orderNumber}`);
},

        modal: {
          ondismiss: function () {
            console.log('Payment cancelled');
            toast.error('Payment cancelled');
            onError();
          },
        },
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
