import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDeliverySettings } from "@/hooks/useDeliverySettings";
import { sendOrderConfirmationEmail } from "@/components/admin/OrderStatusEmailService";

interface RazorpayCheckoutProps {
  cartItems: any[];
  amount: number;
  shippingAddress: any;
  onSuccess: () => void;
  onError: () => void;
  OrderId?: string;
  RewardPoints: number;
  onRemoveSize: (itemId: string, size: string) => void;
  onRemoveItem: (itemId: string) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  cartItems,
  amount,
  shippingAddress,
  onSuccess,
  onError,
  OrderId,
  RewardPoints,
  onRemoveSize,
  onRemoveItem
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings.delivery_fee || 0;

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

      const payload = {
        amount: Math.round(amount * 100),
        currency: "INR",
        cartItems,
        shippingAddress,
        customerInfo: {
          email: currentUser.email,
          name: shippingAddress?.name ?? "Customer",
        },
        orderNumber: `B3F${Date.now()}`,
        OrderId: OrderId || null,
      };

      const response = await fetch(
        `https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/${OrderId ? "retry-razorpay-order" : "create-razorpay-order"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            apikey: "<YOUR_PUBLIC_API_KEY>"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      const itemsDescription = cartItems
        .map(item =>
          Array.isArray(item.sizes)
            ? item.sizes.map((s: any) => `${item.name} (${s.size}, Qty: ${s.quantity})`).join(", ")
            : `${item.name} (${item.size}, Qty: ${item.quantity})`
        )
        .join("; ");

      const options = {
        key: "rzp_live_FQUylFpHDtgrDj",
        amount: data.amount,
        currency: "INR",
        name: "B3F Prints",
        description: itemsDescription,
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
            const { error: updateError } = await supabase.rpc("update_payment_status", {
              p_order_id: OrderId,
              p_payment_status: "paid",
              p_order_status: "pending"
            });

            if (updateError) throw updateError;

            await sendOrderConfirmationEmail({
              orderId: OrderId || payload.orderNumber,
              customerEmail: currentUser.email,
              customerName: shippingAddress?.name || "Customer",
              status: "confirmed",
              orderItems: cartItems,
              totalAmount: amount,
              shippingAddress
            });

            toast.success("Payment successful and email sent!");
            onSuccess();
            navigate("/track-order");
          } catch (emailErr) {
            console.error("Email send error:", emailErr);
            toast.error("Payment succeeded but email failed.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Payment initiation failed: " + err.message);
      onError();
    } finally {
      setLoading(false);
    }
  };

  const redirect = (product: { id: string; pd_name: string }) => {
    if (!currentUser) {
      navigate("/signin?redirectTo=/payment");
      return;
    }

    if (!product.pd_name.toLowerCase().includes("custom printed")) {
      navigate(`/product/details/${product.id}`);
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
            <h3 className="text-base font-semibold text-gray-800">Order Items</h3>
            {cartItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex flex-col sm:flex-row sm:items-start gap-3 border rounded-md p-2 bg-white shadow-sm"
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  onClick={() => redirect({ id: item.product_id, pd_name: item.name })}
                  className={`h-14 w-14 object-cover rounded border shadow-sm hover:scale-110 transition ${
                    !item.name.toLowerCase().includes("custom printed")
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                />
                <div className="flex-1 text-sm space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-gray-700">Price: ₹{item.price}</p>
                  <p className="text-xs text-gray-700">Delivery Fee: ₹{deliveryFee}</p>
                  <p className="text-xs text-green-600 font-semibold">
                    Total: ₹{item.price + deliveryFee}
                  </p>
                  {Array.isArray(item.sizes) && (
                    <div className="flex flex-wrap gap-1">
                      {item.sizes.map((s: any) => (
                        <div
                          key={s.size}
                          className="flex items-center gap-1 px-2 py-0.5 border rounded bg-gray-100 text-xs"
                        >
                          <span>{s.size}</span>
                          <span className="text-gray-500">× {s.quantity}</span>
                          <button
                            onClick={() => onRemoveSize(item.id, s.size)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-lg font-bold space-y-1">
            <div>
              Reward Points: <span className="text-green-600">₹{RewardPoints}</span>
            </div>
            <div>
              Total: <span className="text-green-600">₹{amount}</span>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-12 text-lg bg-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `${OrderId ? "Retry" : "Pay"} ₹${amount} with Razorpay`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
