import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";
 console.log( Deno.env.get("RAZORPAY_KEY_ID"))
serve(async (req) => {
 
  try {
    // Validate environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: Supabase keys missing" }),
        { status: 500 }
      );
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay environment variables");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: Razorpay keys missing" }),
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();

    // Log incoming body for debugging
    console.log("Received create-razorpay-order request body:", body);

    const {
      amount,
      currency,
      receipt,
      customerInfo,
      orderNumber,
      cartItems,
      shippingAddress,
    } = body;

    // Validate required fields
    if (!amount || !currency || !receipt || !customerInfo || !orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required order fields" }),
        { status: 400 }
      );
    }

    // Prepare Razorpay order payload
    const razorpayPayload = {
      amount, // in paise, integer
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_contact: customerInfo.contact,
      },
    };

    // Create Razorpay order via API
    const authHeader = "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(razorpayPayload),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create Razorpay order", details: errorText }),
        { status: 500 }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    // Insert order in Supabase
    const { data, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency,
        status: "pending",
        payment_details: {},
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        customer_contact: customerInfo.contact,
        shipping_address: shippingAddress || null,
        items: cartItems || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting order into Supabase:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save order in database", details: insertError }),
        { status: 500 }
      );
    }

    // Return the razorpay order info + Supabase order ID
    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        key_id: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        db_order_id: data.id,
        order_number: orderNumber,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unhandled error in create-razorpay-order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});
