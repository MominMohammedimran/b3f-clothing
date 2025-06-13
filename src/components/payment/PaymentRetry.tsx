
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface PaymentRetryProps {
  orderId: string;
  amount: number;
  orderNumber: string;
}

const PaymentRetry: React.FC<PaymentRetryProps> = ({ orderId, amount, orderNumber }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRetryPayment = async () => {
    try {
      setLoading(true);

      // Call the retry edge function
      const response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/retry-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE'
        },
        body: JSON.stringify({ orderId, amount })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Retry order error:', errorText);
        throw new Error(`Failed to retry payment: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: "rzp_live_FQUylFpHDtgrDj",
        amount: data.amount,
        currency: 'INR',
        name: "B3F Prints",
        description: `Retry Payment - Order: ${orderNumber}`,
        order_id: data.orderId,
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        handler: async (response: any) => {
          try {
            // Update payment status to paid
            const { error: updateError } = await supabase.rpc('update_payment_status', {
              p_order_id: orderId,
              p_payment_status: 'paid',
              p_order_status: 'pending'
            });

            if (updateError) throw updateError;

            toast.success("Payment successful!");
            navigate(`/track-order/${orderId}`);
          } catch (error: any) {
            console.error("Error processing payment:", error);
            toast.error("Payment succeeded but order processing failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment retry error:', error);
      toast.error('Failed to retry payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Retry Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Order: {orderNumber}</p>
            <p className="text-2xl font-bold text-green-600">₹{amount}</p>
          </div>

          <Button
            onClick={handleRetryPayment}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Retry Payment ₹${amount}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRetry;
