import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import crypto from "https://deno.land/std@0.208.0/crypto/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use env vars in real app – hardcoded here for testing
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "rzp_test_NRItHtK5M0vOd5";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "hICwlPjUOy0YGydGJDEsW00m";
const RAZORPAY_API_URL = "https://api.razorpay.com/v1/orders";

const encoder = new TextEncoder();

function uint8ArrayToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifySignature(orderId: string, paymentId: string, signature: string) {
  const payload = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const generatedSignature = uint8ArrayToHex(new Uint8Array(signatureBuffer));

  // Razorpay sends signature in hex format
  return generatedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json",
    
  };

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "create-order") {
      const { amount, orderId, currency = "INR", receipt = "" } = await req.json();

      if (!amount) {
        return new Response(JSON.stringify({ error: "Amount is required" }), { headers, status: 400 });
      }

      // Encode auth manually (Deno does not support Buffer)
      const base64Auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

      const response = await fetch(RAZORPAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${base64Auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // in paisa
          currency,
          receipt: receipt || orderId,
          notes: { order_id: orderId },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Razorpay Error:", result);
        return new Response(JSON.stringify({ error: result.error?.description || "Failed to create order" }), { headers, status: 400 });
      }

      return new Response(
        JSON.stringify({
          order_id: result.id,
          amount: result.amount,
          currency: result.currency,
        }),
        { headers, status: 200 }
      );
    }

    if (path === "verify-payment") {
      const { orderId, paymentId, signature } = await req.json();

      if (!orderId || !paymentId || !signature) {
        return new Response(JSON.stringify({ error: "Missing required parameters" }), { headers, status: 400 });
      }

      const isValid = await verifySignature(orderId, paymentId, signature);

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid payment signature" }), { headers, status: 400 });
      }

      return new Response(JSON.stringify({ verified: true }), { headers, status: 200 });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), { headers, status: 404 });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), { headers, status: 500 });
  }
});
