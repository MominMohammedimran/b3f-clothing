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
  OrderId?: string; // NEW PROP for retry support
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
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      customerInfo: {
        email: currentUser.email,
        name: shippingAddress?.name ?? currentUser.email,
      },
      orderNumber: `ORD${Date.now()}`,
      cartItems,
      shippingAddress,
      OrderId: OrderId || null,  // Pass existing orderId to backend if retry
    };

    const response = await supabase.functions.invoke("create-razorpay-order", {
      body: payload,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.error) throw response.error;

    return response.data;
  };

  const handlePayment = async () => {
    if (!currentUser?.email) {
      toast.error("Please sign in to continue");
      return;
    }

    try {
      setLoading(true);
      const razorpayOrder = await createRazorpayOrder();

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const itemsDescription = cartItems
        .map(item => `${item.name} (Size: ${item.size || "N/A"}, Qty: ${item.quantity})`)
        .join(", ");

      const options = {
        key: "rzp_live_FQUylFpHDtgrDj",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "B3F Prints",
        description: `Order: ${itemsDescription}`,
        order_id: razorpayOrder.id,
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
              // ✅ Retry flow — update existing order
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
              // ✅ Normal payment flow — create new order
              const orderNumber = `ORD${Date.now()}`;
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
          <CardTitle className="text-center text-xl">Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              `Pay ₹${amount} with Razorpay`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
