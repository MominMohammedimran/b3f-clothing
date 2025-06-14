import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PaymentRetryProps {
  orderId: string;
  amount: number;
  orderNumber: string;
  data: any; // full order object passed as prop
}

const PaymentRetry: React.FC<PaymentRetryProps> = ({ orderId, amount, orderNumber, data }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const orderItems = data.items || []; // extract items array from full order object

  const handleRetryPayment = async () => {
    try {
      setLoading(true);

      if (!currentUser?.email) {
        toast.error("Please sign in to continue");
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;
      if (!accessToken) {
        toast.error("Unable to fetch access token. Please login again.");
        navigate("/login");
        return;
      }

      const amountInPaise = Math.round(amount * 100);

      const response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/retry-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE'
        },
        body: JSON.stringify({ orderId, amount: amountInPaise })
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
        amount: amount,
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
          <p className="text-sm text-gray-600 text-center">Order: {orderNumber}</p>

          <div className="space-y-3 border-b pb-4">
            {orderItems.length === 0 ? (
              <p className="text-center text-gray-400 text-sm">No items found.</p>
            ) : (
              orderItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {item.size || 'N/A'} | Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-2xl font-bold text-green-600 text-center">₹{amount}</p>

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
