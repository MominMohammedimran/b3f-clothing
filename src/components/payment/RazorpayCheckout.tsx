
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
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  cartItems,
  amount,
  shippingAddress,
  onSuccess,
  onError,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Create Razorpay order via Edge Function
  const createRazorpayOrder = async () => {
    // Ensure user is signed in and has an email
    if (!currentUser?.email) {
      throw new Error("User must be signed in to create order");
    }

    // Get access token for auth header
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
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
    };

    console.log("→ create-razorpay-order payload:", payload);

    const response = await supabase.functions.invoke(
      "create-razorpay-order",
      {
        body: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.error) {
      throw response.error;
    }

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
        .map((item) => {
          const printType = item.metadata?.designData
            ? "Custom Printed"
            : "Regular";
          return `${item.name} (Size: ${item.size || "N/A"}, Qty: ${
            item.quantity
          }, Type: ${printType})`;
        })
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

            // Send confirmation email
            try {
              await supabase.functions.invoke("send-order-confirmation", {
                body: {
                  userEmail: currentUser.email,
                  orderDetails: {
                    order_number: orderNumber,
                    total: amount,
                    items: cartItems,
                    shipping_address: shippingAddress,
                    payment_details: {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  },
                },
              });
            } catch (emailError) {
              console.error("Error sending confirmation email:", emailError);
            }

            toast.success("Payment successful! Order created.");
            onSuccess();

            navigate("/order-complete", {
              state: { orderNumber, orderId: order.id },
            });
          } catch (error: any) {
            console.error("Error processing payment:", error);
            toast.error("Payment succeeded but order creation failed.");
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
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="border-b pb-2 mb-2 items-center last:border-b-0"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-16 w-16 rounded object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />

                    <div className="flex-1 pr-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">{
                        `Size: ${item.size || "N/A"} | Qty: ${item.quantity}`
                      }</p>
                      {item.metadata?.designData && (
                        <p className="text-blue-600 text-xs font-medium">
                          ✨ Custom Printed Design
                        </p>
                      )}
                      {item.color && (
                        <p className="text-gray-500 text-xs">Color: {item.color}</p>
                      )}
                    </div>

                    <div className="text-end whitespace-nowrap">
                      <span className="font-medium text-lg">₹{item.price * item.quantity}</span>
                      <p className="text-xs text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mt-3">
              <h4 className="font-medium mb-2">Customer Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {shippingAddress?.name}</p>
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Phone:</strong> {shippingAddress?.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <div className="text-sm text-gray-600">
                <p>{shippingAddress?.street}</p>
                <p>{shippingAddress?.city}, {shippingAddress?.state}</p>
                <p>{shippingAddress?.zipcode}, {shippingAddress?.country}</p>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-green-600">₹{amount}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            size="lg"
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
          
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Secure payment powered by Razorpay
            </p>
            <p className="text-xs text-gray-400">
              Supports UPI, Cards, Net Banking, and Wallets
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
