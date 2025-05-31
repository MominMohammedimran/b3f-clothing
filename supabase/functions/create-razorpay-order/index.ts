
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import crypto from "https://deno.land/std@0.208.0/crypto/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to create a text encoder
const encoder = new TextEncoder();

// Configure Razorpay API credentials
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_NRItHtK5M0vOd5";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "your_razorpay_secret_key";
const RAZORPAY_API_URL = "https://api.razorpay.com/v1/orders";

// Verify Razorpay signature
async function verifySignature(orderId: string, paymentId: string, signature: string) {
  const payload = orderId + "|" + paymentId;
  
  // Create a key object for HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  // Convert buffer to hex string
  const signatureBytes = new Uint8Array(signatureBuffer);
  const generatedSignature = Array.from(signatureBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  // Compare signatures
  return generatedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  // Set basic headers
  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };
  
  try {
    // Handle different endpoints
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // Create Razorpay order
    if (path === "create-order") {
      // Parse request body
      const { amount, orderId, currency = "INR", receipt = "" } = await req.json();
      
      if (!amount) {
        return new Response(
          JSON.stringify({ error: "Amount is required" }),
          { headers, status: 400 }
        );
      }
      
      // Basic auth for Razorpay API
      const authString = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
      const base64Auth = btoa(authString);
      
      // Create order in Razorpay
      const response = await fetch(RAZORPAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${base64Auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses paisa
          currency,
          receipt: receipt || orderId,
          notes: {
            order_id: orderId,
          },
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.description || "Failed to create Razorpay order");
      }
      
      return new Response(
        JSON.stringify({ 
          order_id: result.id,
          amount: result.amount,
          currency: result.currency
        }),
        { headers, status: 200 }
      );
    }
    
    // Verify payment
    if (path === "verify-payment") {
      const { orderId, paymentId, signature } = await req.json();
      
      if (!orderId || !paymentId || !signature) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { headers, status: 400 }
        );
      }
      
      const isValid = await verifySignature(orderId, paymentId, signature);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid payment signature" }),
          { headers, status: 400 }
        );
      }
      
      return new Response(
        JSON.stringify({ verified: true }),
        { headers, status: 200 }
      );
    }
    
    // Unknown endpoint
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { headers, status: 404 }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      { headers, status: 500 }
    );
  }
});
