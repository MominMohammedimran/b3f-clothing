import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "npm:razorpay";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const supabase = createClient(supabaseUrl, supabaseKey);
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

Deno.serve(async (req) => {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return new Response(JSON.stringify({ error: "Missing orderId or amount" }), { status: 400 });
    }

    const numericAmount = Math.round(Number(amount) );  // convert rupees -> paise

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("Order fetch error:", fetchError);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: numericAmount,
      currency: "INR",
      receipt: order.order_number,
      notes: {
        orderId: orderId,
        userId: order.user_id,
      },
    });

    return new Response(JSON.stringify({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    }), { status: 200 });

  } catch (error) {
    console.error("Retry payment error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
