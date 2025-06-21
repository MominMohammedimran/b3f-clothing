// supabase/functions/send-order-notification/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      customerEmail,
      customerName,
      status,
      orderItems,
      totalAmount,
      shippingAddress
    } = await req.json();

    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASSWORD");

    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP credentials not configured");
    }

    const itemsHtml = orderItems.map((item: any) => `
      <li>
        <strong>${item.name}</strong> - Size: ${item.size || "N/A"}, Qty: ${item.quantity}
      </li>
    `).join('');

    const emailBody = `
      <h2>Order ${status.toUpperCase()} - ${orderId}</h2>
      <p>Hello ${customerName},</p>
      <p>Your order status is now: <strong>${status}</strong></p>
      <p><strong>Total:</strong> ₹${totalAmount}</p>
      <p><strong>Shipping To:</strong> ${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}</p>
      <ul>${itemsHtml}</ul>
    `;sss
    const mailPayload = {
      personalizations: [{ to: [{ email: customerEmail }] }],
      from: { email: smtpUser, name: "B3F Prints" },
      subject: `Your Order (${orderId}) is ${status}`,
      content: [{ type: "text/html", value: emailBody }],
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": Deno.env.get("BREVO_API_KEY") || "", // You can remove if using Gmail SMTP
      },
      body: JSON.stringify(mailPayload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Mail send failed: ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
