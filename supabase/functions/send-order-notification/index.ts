



import { serve } from "https://deno.land/std@0.190.0/http/server.ts";



const corsHeaders = {

  "Access-Control-Allow-Origin": "https://b3f-prints.pages.dev",

  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",

};



serve(async (req) => {

  // ✅ Always respond to OPTIONS (preflight) first

  if (req.method === "OPTIONS") {

    return new Response("OK", {

      headers: corsHeaders,

    });

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

    `).join("");



    const emailBody = `

      <h2>Order ${status.toUpperCase()} - ${orderId}</h2>

      <p>Hello ${customerName},</p>

      <p>Your order status is now: <strong>${status}</strong></p>

      <p><strong>Total:</strong> ₹${totalAmount}</p>

      <p><strong>Shipping To:</strong> ${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}</p>

      <ul>${itemsHtml}</ul>

    `;



    // You should use a mail library to send email using Gmail SMTP

    // Replace this with your actual logic or a verified API call

    console.log("🚀 Email content prepared for", customerEmail);



    return new Response(JSON.stringify({ success: true }), {

      status: 200,

      headers: {

        ...corsHeaders,

        "Content-Type": "application/json",

      },

    });



  } catch (err) {

    console.error("❌ Error:", err);

    return new Response(JSON.stringify({ error: err.message }), {

      status: 500,

      headers: {

        ...corsHeaders,

        "Content-Type": "application/json",

      },

    });

  }

});

