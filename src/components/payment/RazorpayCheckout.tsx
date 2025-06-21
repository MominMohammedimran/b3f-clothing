import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
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
  onRemoveItem,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings.delivery_fee;
const itemsDescription = cartItems
 .map(item => {
 const baseName = item.name || "Product";
  const itemPrice = item.price || 0;
 if (Array.isArray(item.sizes)) {
 return item.sizes
.map((s: any) =>
`${baseName} (${s.size} ×${s.quantity}) - ₹${s.quantity * itemPrice}`
)
.join(", ");
 } else {
  return `${baseName} (${item.size} ×${item.quantity}) - ₹${item.quantity * itemPrice}`;
 }
 })
 .join(", ");
const redirect = (product: { id: string }) => {
  // Example route logic
 if (!currentUser) {
      navigate('/signin?redirectTo=/cart');
      return;
    }
 navigate(`/product/details/${product.id}`);
};
  
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
          name: shippingAddress?.name ?? currentUser.email,
        },
        orderNumber: `B3F${Date.now()}`,
        OrderId: OrderId || null,
      };

      const response = await fetch(
        `https://cmpggiyuiattqjmddcac.supabase.co/functions/v1/${OrderId ? 'retry-razorpay-order' : 'create-razorpay-order'}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': '<YOUR_PUBLIC_API_KEY>'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

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
  currency: data.currency || "INR",
  name: "B3F Prints",
  description: itemsDescription, // 👈 Now shows full breakdown

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
    }
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
                if (Array.isArray(item.sizes)) {
                  for (const s of item.sizes) {
                    await supabase.rpc('update_product_stock', {
                      p_product_id: item.product_id,
                      p_size: s.size,
                      p_quantity: s.quantity
                    });
                  }
                } else if (item.size) {
                  await supabase.rpc('update_product_stock', {
                    p_product_id: item.product_id,
                    p_size: item.size,
                    p_quantity: item.quantity
                  });
                }
              }
              const { data: order } = await supabase
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

              toast.success("Payment successful! Order created.");
              onSuccess();
              navigate("/order-complete", { state: { orderNumber, orderId: order.id } });
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment succeeded but order processing failed.");
            onError();
          }
        }
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
<h3 className="text-base font-semibold text-gray-800">Order Items</h3>

{cartItems.map((item, idx) => (
<div
 key={item.id || idx} className="flex flex-col sm:flex-row sm:items-start gap-3 border rounded-md p-2 bg-white shadow-sm"
>
 <img
 src={item.image || '/placeholder.svg'}
 alt={item.name}
    onClick={() => redirect({ id: item.product_id })}
 className="w-14 h-14 object-cover rounded border cursor-pointer"
 />

 <div className="flex-1 text-sm text-gray-700 space-y-1">
 <div className="flex justify-between items-center">
 <p className="font-medium text-gray-900">{item.name}</p>
<button
 onClick={() => onRemoveItem(item.id)}
 className="text-red-500 text-xs hover:text-red-700"
 >
 Remove
 </button>
 </div>

 <p className="text-xs">Item Price: ₹{item.price}</p>
 <p className="text-xs">Delivery Fee: ₹{deliveryFee}</p>
<p className="font-semibold text-xs text-green-700">
 Total: ₹{item.price + deliveryFee}
</p>

{Array.isArray(item.sizes) ? (
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
 ) : (
<div className="text-xs text-gray-600">
Size: {item.size} × {item.quantity}
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
              Total Amount: <span className="text-green-600">₹{amount}</span>
            </div>
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
              `${OrderId ? 'Retry' : 'Pay'} ₹${amount} with Razorpay`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
