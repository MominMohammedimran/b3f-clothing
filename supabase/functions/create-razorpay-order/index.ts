
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "https://esm.sh/razorpay@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    let requestBody;
    try {
      const text = await req.text();
      console.log("Raw request body:", text);
      
      if (!text || text.trim() === '') {
        throw new Error("Request body is empty");
      }
      
      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const { amount, currency = "INR", cartItems, shippingAddress, customerInfo, orderNumber, OrderId } = requestBody;

    console.log("Parsed request data:", { amount, currency, cartItems, shippingAddress, customerInfo, orderNumber, OrderId });

    if (!amount || !cartItems || !customerInfo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, cartItems, customerInfo" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount), // Amount should already be in paise
      currency: currency,
      receipt: `order_${Date.now()}`,
    });

    console.log("Razorpay order created:", razorpayOrder);

    // If this is not a retry, create order in database
    if (!OrderId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (!userError && user) {
          const { error: orderError } = await supabase.from("orders").insert({
            user_id: user.id,
            order_number: orderNumber || `ORD${Date.now()}`,
            total: amount / 100, // Convert back to rupees
            items: cartItems,
            status: "pending",
            payment_method: "razorpay",
            shipping_address: shippingAddress,
            payment_status: "pending",
          });

          if (orderError) {
            console.error("Order creation error:", orderError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order: " + error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
