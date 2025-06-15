import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDeliverySettings } from '@/hooks/useDeliverySettings';

interface RazorpayCheckoutProps {
  cartItems: any[];
  amount: number;
  shippingAddress: any;
  onSuccess: () => void;
  onError: () => void;
  OrderId?: string;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  cartItems,
  amount,
  shippingAddress,
  onSuccess,
  onError,
  OrderId,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings.delivery_fee;

  const handlePayment = async () => {
    if (!currentUser?.email) {
      toast.error("Please sign in to continue");
      return;
    }

    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("No access token");

      let payload = {
        amount: Math.round(amount * 100),
        currency: "INR",
        cartItems,
        shippingAddress,
        customerInfo: {
          email: currentUser.email,
          name: shippingAddress?.name ?? currentUser.email,
        },
        orderNumber: `ORD${Date.now()}`,
        OrderId: OrderId || null,
      };

      let response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/${OrderId ? 'retry-razorpay-order' : 'create-razorpay-order'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

      const itemsDescription = cartItems.map(item => `${item.name} (Size: ${item.size || "N/A"}, Qty: ${item.quantity})`).join(", ");

      const options = {
        key: "rzp_live_FQUylFpHDtgrDj",
        amount: data.amount,
        currency: data.currency || "INR",
        name: "B3F Prints",
        description: OrderId ? `Retry Payment - ${itemsDescription}` : `Order: ${itemsDescription}`,
        order_id: data.razorpayOrderId || data.orderId || data.id,
        prefill: {
          name: shippingAddress?.name || "",
          email: currentUser.email,
          contact: shippingAddress?.phone || "",
        },
        notes: {
          items: itemsDescription,
          customer_email: currentUser.email,
          total_amount: amount,
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled by user");
            onError();
          },
        },
        handler: async (response: any) => {
          try {
            if (OrderId) {
              await supabase.rpc('update_payment_status', {
                p_order_id: OrderId,
                p_payment_status: 'paid',
                p_order_status: 'pending'
              });
              toast.success("Payment successful!");
              onSuccess();
              navigate(`/track-order/${OrderId}`);
            } else {
              const orderNumber = `ORD${Date.now()}`;
              for (const item of cartItems) {
                if (item.size) {
                  await supabase.rpc('update_product_stock', {
                    p_product_id: item.product_id,
                    p_size: item.size,
                    p_quantity: item.quantity
                  });
                }
              }
              const { data: order } = await supabase.from("orders").insert({
                user_id: currentUser.id,
                order_number: orderNumber,
                total: amount,
                items: cartItems,
                status: "paid",
                payment_method: "razorpay",
                shipping_address: shippingAddress,
                payment_details: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  status: "success",
                },
              }).select().single();

              toast.success("Payment successful! Order created.");
              onSuccess();
              navigate("/order-complete", { state: { orderNumber, orderId: order.id } });
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment succeeded but order processing failed.");
            onError();
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to start payment: " + err.message);
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {OrderId ? "Retry Payment" : "Complete Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 mb-4 border-b pb-4">
            <h3 className="font-medium text-gray-700">Order Items</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                
                <div className="flex-1 flex justify-between items-start">
  {/* LEFT: Item info */}
  <div>
    <p className="text-sm font-medium">
      <span className="text-gray-900">{item.name}</span>
    </p>

    <p className="text-xs text-gray-500">
      Size: <span className="text-gray-900">{item.size || 'N/A'}</span> | 
      Qty: <span className="text-gray-900">{item.quantity}</span>
    </p>
  </div>

  {/* RIGHT: Prices info */}
  <div className="text-right space-y-1">
    <p className="text-xs text-gray-500">
      Item Price: ₹<span className="text-gray-900">{item.price}</span>
    </p>

    <p className="text-xs text-gray-500">
      Delivery Fee: ₹<span className="text-gray-900">{deliveryFee}</span>
    </p>

    <p className="text-sm font-semibold text-red-600">
      Total: ₹<span className="text-green-900">{item.price + deliveryFee}</span>
    </p>
  </div>
</div>



              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-green-600">₹{amount}</span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `${OrderId ? 'Retry' : 'Pay'} ₹ ${amount} with Razorpay`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
