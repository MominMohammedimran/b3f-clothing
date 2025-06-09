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
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
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

  const createRazorpayOrder = async ({
    amount,
    currency,
    receipt,
    customerInfo,
    orderNumber,
  }: {
    amount: number;
    currency: string;
    receipt: string;
    customerInfo: { name: string; email: string; contact: string };
    orderNumber: string;
  }) => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      method: 'POST',
      body: {
        amount,
        currency,
        receipt,
        customerInfo,
        orderNumber,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const orderNumber = generateB3FOrderNumber();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You must be logged in to proceed with payment.');
      }

      const data = await createRazorpayOrder({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderNumber,
        customerInfo,
        orderNumber,
      });

      if (!data || !data.order_id) {
        throw new Error('Invalid response from order function');
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "B3F Prints & Men's Wear",
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
          toast.success('Payment successful!');

          try {
            // ✅ Updated: use .from().update() with required fields
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'paid',
                updated_at: new Date().toISOString(),
                payment_details: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                upi_input: '', // ✅ Satisfies required field
              })
              .eq('id', data.db_order_id);

            if (updateError) {
              console.error('Failed to update order status:', updateError);
              throw new Error('Failed to update order status');
            }

            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: customerInfo.email,
                subject: `B3F Prints: Order ${data.order_number} Confirmation`,
                text: `Dear ${customerInfo.name},

We have received your payment for order ${data.order_number}.
Thank you for shopping with B3F Prints!

🧾 Order Total: ₹${amount.toFixed(2)}
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
          navigate(
            `/order-complete?orderId=${data.db_order_id}&orderNumber=${data.order_number || orderNumber}`
          );
        },
        modal: {
          ondismiss: function () {
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
    <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
      {loading ? 'Loading...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
    </Button>
  );
};

export default RazorpayCheckout;
