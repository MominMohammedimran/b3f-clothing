import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const allowedOrigins = [
  "https://b3f-prints.pages.dev",
  "http://localhost:8080",
];

function getCORSHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers });
  }

  try {
    const {
      orderId,
      customerEmail,
      customerName,
      status,
      orderItems,
      totalAmount,
      shippingAddress,
      emailType = "status_update",
    } = await req.json();

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("Brevo API key is missing");
    }

    if (!customerEmail || !orderItems || orderItems.length === 0) {
      throw new Error("Missing required fields");
    }

    // 🧾 HTML Email Body
    const itemHtml = orderItems
      .map((item: any) => {
        const sizeDetails = Array.isArray(item.sizes)
          ? item.sizes
              .map((s: any) => `<li>${s.size.toUpperCase()} × ${s.quantity}</li>`)
              .join("")
          : `<li>${item.size || "N/A"} × ${item.quantity || 1}</li>`;

        return `
          <tr style="border:1px solid #eee;">
            <td style="padding:10px;"><img src="${item.image ||
              "https://via.placeholder.com/60"}" width="60" /></td>
            <td style="padding:10px;">
              <strong>${item.name}</strong>
              <ul style="margin:0;padding-left:1em;font-size:13px;">${sizeDetails}</ul>
            </td>
            <td style="padding:10px;font-weight:bold;">₹${item.price}
             
          </tr>
        `;
      })
      .join("");

    const emailHtml = `
      <div style="max-width:600px;margin:auto;border:1px solid #eee;font-family:sans-serif;">
        <div style="background:#d1fae5;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <h2>ORDER ${emailType === "confirmation" ? "CONFIRMED" : "UPDATE"}</h2>
        </div>
        <div style="padding:20px;">
          <p>Hi ${customerName || "Customer"},</p>
          <p>Your order <strong>#${orderId}</strong> is now <strong>${status.toUpperCase()}</strong>.</p>

          <h3>Order Details:</h3>
          <table style="width:100%;border-collapse:collapse;">
            ${itemHtml}
            <tr style="background:#f0fdf4;">
              <td colspan="2" style="padding:10px;font-weight:bold;">Delivery :</td>
              <td style="padding:10px;font-weight:bold;">₹100</td>
            </tr>
             <tr style="background:#f0fdf4;">
              <td colspan="2" style="padding:10px;font-weight:bold;">Total:</td>
              <td style="padding:10px;font-weight:bold;">₹${totalAmount}</td>
            </tr>
            
          </table>
          <p style="margin-top:16px;">Paid via Razorpay</p>

          ${
            shippingAddress?.zipCode
              ? `<p style="margin-top:16px;">Estimated Delivery : <strong>7–10 Days</strong><br/>Track here: <a href="https://b3f-prints.pages.dev/orders" target="_blank">Track Order</a></p>`
              : ""
          }

          <p style="margin-top:32px;font-size:14px;color:#666;">Thank you for shopping with B3F Prints!</p>
        </div>
      </div>
    `;

    const mailPayload = {
      sender: {
        name: "B3F Prints",
        email: "b3f.prints.pages.dev@gmail.com" // ✅ Replace with your verified Brevo sender
      },
      to: [{ email: customerEmail }],
      subject: `Your Order (${orderId}) is ${status}`,
      htmlContent: emailHtml,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(mailPayload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Email send failed: ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  }
});
