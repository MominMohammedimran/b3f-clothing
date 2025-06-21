import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// ✅ Replace with your allowed domain(s)
const allowedOrigins = [
  "https://b3f-prints.pages.dev",
  "http://localhost:8080"
];

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };

  // ✅ CORS preflight check response
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers,
    });
  }

  try {
    // Your actual logic...
    const body = await req.json();
    console.log("📦 Request payload:", body);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
});
