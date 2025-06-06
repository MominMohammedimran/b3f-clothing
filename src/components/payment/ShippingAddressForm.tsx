
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

 const handlePayment = async () => {
  setLoading(true);

  try {
    const response = await fetch('/functions/api/create-order.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        description: 'B3F Prints Order',
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact,
        },
        callback_url: 'https://b3f-prints.pages.dev/order-complete',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.short_url) {
      throw new Error(data.error?.description || 'Failed to create payment link');
    }

    window.location.href = data.short_url; // redirect to Razorpay-hosted payment page
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Unable to create Razorpay payment link');
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