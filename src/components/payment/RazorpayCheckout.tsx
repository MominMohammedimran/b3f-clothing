
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

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

  const createRazorpayOrder = async () => {
    if (!currentUser?.email) {
      throw new Error("User must be signed in to create order");
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("No access token—are you signed in?");
    }

    const payload = {
      amount: Math.round(amount * 100), // Convert to paise
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

    console.log("Sending payment request with payload:", payload);

    try {
      const response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/create-razorpay-order`, {
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
        console.error('Edge function error response:', errorText);
        throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Edge function response:", data);

      if (!data) {
        throw new Error('No data received from payment service');
      }

      return data;
    } catch (error) {
      console.error('Error calling create-razorpay-order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!currentUser?.email) {
      toast.error("Please sign in to continue");
      return;
    }

    try {
      setLoading(true);
      
      let razorpayOrder;
      
      if (OrderId) {
        console.log("Retry payment for order:", OrderId);
        // Retry flow
        const response = await fetch(`https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/retry-razorpay-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE'
          },
          body: JSON.stringify({ orderId: OrderId, amount })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Retry order error:', errorText);
          throw new Error(`Failed to retry payment: ${response.status} ${response.statusText}`);
        }
        
        razorpayOrder = await response.json();
      } else {
        // Normal flow
        razorpayOrder = await createRazorpayOrder();
      }

      console.log("Razorpay order received:", razorpayOrder);

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const itemsDescription = cartItems
        .map(item => `${item.name} (Size: ${item.size || "N/A"}, Qty: ${item.quantity})`)
        .join(", ");

      const options = {
        key: "rzp_live_FQUylFpHDtgrDj",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "B3F Prints",
        description: OrderId ? `Retry Payment - ${itemsDescription}` : `Order: ${itemsDescription}`,
        order_id: razorpayOrder.razorpayOrderId || razorpayOrder.orderId || razorpayOrder.id,
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
              // Retry flow — update existing order
              const { error: updateError } = await supabase.rpc('update_payment_status', {
                p_order_id: OrderId,
                p_payment_status: 'paid',
                p_order_status: 'pending'
              });

              if (updateError) throw updateError;

              toast.success("Payment successful!");
              onSuccess();
              navigate(`/track-order/${OrderId}`);
            } else {
              // Normal payment flow — create new order
              const orderNumber = `ORD${Date.now()}`;
              
              // Update stock for each item
              for (const item of cartItems) {
                if (item.size) {
                  await supabase.rpc('update_product_stock', {
                    p_product_id: item.product_id,
                    p_size: item.size,
                    p_quantity: item.quantity
                  });
                }
              }
              
              const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
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
                })
                .select()
                .single();

              if (orderError) throw orderError;

              toast.success("Payment successful! Order created.");
              onSuccess();
              navigate("/order-complete", {
                state: { orderNumber, orderId: order.id },
              });
            }
          } catch (error: any) {
            console.error("Error processing payment:", error);
            toast.error("Payment succeeded but order processing failed.");
            onError();
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Failed to start payment: " + error.message);
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
          {/* Product Details */}
          <div className="space-y-3 mb-4 border-b pb-4">
            <h3 className="font-medium text-gray-700">Order Items</h3>
            {cartItems.map((item, index) => (
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
                  <p className="text-sm font-semibold">₹{item.price}</p>
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
