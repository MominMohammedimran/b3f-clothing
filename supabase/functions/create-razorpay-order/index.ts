import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "https://esm.sh/razorpay@2";

serve(async (req) => {
  try {
    const { order_id, amount, currency, cartItems, shippingAddress, customerInfo, retry } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    // Always generate new Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `retry-${Date.now()}`,
    });

    if (retry && order_id) {
      console.log("Retry payment — skip DB insert");
      // Skip DB insert for retry flow
    } else {
      // Handle new order creation
      const { user, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      const orderNumber = `ORD${Date.now()}`;

      const { error: orderError } = await supabase.from("orders").insert({
        id: order_id || undefined,
        user_id: user.id,
        order_number: orderNumber,
        total: amount / 100,
        items: cartItems,
        status: "pending",
        payment_method: "razorpay",
        shipping_address: shippingAddress,
        payment_status: "pending",
        created_at: new Date(),
      });

      if (orderError) {
        console.error("DB insert error:", orderError);
        return new Response(JSON.stringify({ error: "DB insert failed" }), { status: 500 });
      }
    }

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});
