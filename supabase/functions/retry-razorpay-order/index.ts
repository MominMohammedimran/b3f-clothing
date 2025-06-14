
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "npm:razorpay";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Retry payment request body:", requestBody);

    const { orderId, amount } = requestBody;

    if (!orderId || !amount) {
      console.error("Missing required fields:", { orderId, amount });
      return new Response(JSON.stringify({ error: "Missing orderId or amount" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const numericAmount = Math.round(Number(amount) * 100);  // convert rupees to paise
    console.log("Processing retry for order:", orderId, "amount:", numericAmount);

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("Order fetch error:", fetchError);
      return new Response(JSON.stringify({ error: "Order not found" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Found order:", order.order_number);

    const razorpayOrder = await razorpay.orders.create({
      amount: numericAmount,
      currency: "INR",
      receipt: order.order_number,
      notes: {
        orderId: orderId,
        userId: order.user_id,
        retry: "true"
      },
    });

    console.log("Created Razorpay order:", razorpayOrder.id);

    return new Response(JSON.stringify({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Retry payment error:", error);
    return new Response(JSON.stringify({ error: "Internal server error: " + error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
