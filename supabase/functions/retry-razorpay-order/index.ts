
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Retry payment request method:", req.method);
    
    let requestBody;
    try {
      const text = await req.text();
      console.log("Raw retry request body:", text);
      
      if (!text || text.trim() === '') {
        throw new Error("Request body is empty");
      }
      
      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error in retry:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const { orderId, amount } = requestBody;

    console.log("Parsed retry data:", { orderId, amount });

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, amount" }),
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

    // Create new Razorpay order for retry
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `retry_${orderId}_${Date.now()}`,
    });

    console.log("Retry Razorpay order created:", razorpayOrder);

    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Retry payment error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create retry order: " + error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
