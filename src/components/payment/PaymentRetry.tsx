import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';

interface PaymentRetryProps {
  orderId: string;
  amount: number;
  orderNumber: string;
  data: any;
}

const PaymentRetry: React.FC<PaymentRetryProps> = ({ orderId, amount, orderNumber, data }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings.delivery_fee || 0;

  const [orderItems, setOrderItems] = useState<any[]>(data.items || []);
   const redirect = (product: { id: string,pd_name:string }) => {
  // Example route logic
 if (!currentUser) {
      navigate('/signin?redirectTo=/orders');
      return;
    }
    else if (!product.pd_name.toLowerCase().includes('custom printed')) {
    navigate(`/product/details/${product.id}`);
  }
};
  
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

      const amountInPaise = amount;

      const response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/retry-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'your-public-api-key-here'
        },
        body: JSON.stringify({ orderId, amount: amountInPaise })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to retry payment: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const options = {
        key: 'rzp_live_FQUylFpHDtgrDj',
        amount: amountInPaise,
        currency: 'INR',
        name: 'B3F Prints',
        description: `Retry Payment - Order: ${orderNumber}`,
        order_id: data.orderId,
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          }
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
            toast.error("Payment succeeded but order processing failed.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Retry payment error:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
    toast.success('Item removed from order');
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
 <div key={index} className="space-y-1">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <img
 src={item.image || '/placeholder.svg'}
 alt={item.name}
  onClick={() => redirect({ id: item.product_id,pd_name:item.name})}
 className={`h-14 w-14 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                       />
 <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
</div>

 <Button
 variant="ghost"
 size="icon"
onClick={() => handleRemoveItem(index)}
 className="text-xs text-red-600 hover:text-red-800"
 >
 Clear
</Button>
 </div>

 {Array.isArray(item.sizes) ? (
 <div className="flex flex-wrap gap-1 pl-14">
{item.sizes.map((s: any, sIdx: number) => (
<div
 key={`${item.name}-${s.size}-${sIdx}`}
className="flex items-center gap-1 px-2 py-0.5 border rounded bg-gray-100 text-xs"
 >
<span className="text-gray-700 font-medium">{s.size}</span>
 <span className="text-gray-500">× {s.quantity}</span>
 {s.updated_quantity && s.updated_quantity !== s.quantity && (
 <span className="text-gray-400 italic ml-1">
 → {s.updated_quantity}
 </span>
 )}
 </div>
 ))}
 </div>
 ) : (
<div className="pl-14 text-xs text-gray-700">
 {item.size} × {item.quantity}
</div>
 )}
 </div>
 ))
 )}
</div>


          <p className="text-2xl font-bold text-green-600 text-center">₹{amount}</p>

          <Button
            onClick={handleRetryPayment}
            disabled={loading || orderItems.length === 0}
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
