
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface OrderNotificationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  orderItems: any[];
  totalAmount: number;
  shippingAddress: any;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailTemplate = (orderData: OrderNotificationRequest) => {
  const statusMessages = {
    'pending': 'Your order has been received and is being processed.',
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'processing': 'Your order is currently being processed.',
    'shipped': 'Your order has been shipped and is on its way to you.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.'
  };

  const itemsHtml = orderData.orderItems.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: left;">${item.name || 'Custom Design'}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 10px; text-align: right;">₹${item.price || 0}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Update - ${orderData.orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">B3F Prints</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Custom Printing Solutions</p>
      </div>
      
      <h2 style="color: #333;">Order Update: ${orderData.status.toUpperCase()}</h2>
      
      <p>Dear ${orderData.customerName},</p>
      
      <p>${statusMessages[orderData.status] || 'Your order status has been updated.'}</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderData.orderId}</p>
        <p><strong>Status:</strong> ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}</p>
        <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
      </div>
      
      <h3>Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      ${orderData.shippingAddress ? `
      <h3>Shipping Address</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;">${orderData.shippingAddress.fullName || orderData.customerName}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.address || orderData.shippingAddress.street || ''}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zipCode || ''}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.country || 'India'}</p>
        ${orderData.shippingAddress.phone ? `<p style="margin: 5px 0;">Phone: ${orderData.shippingAddress.phone}</p>` : ''}
      </div>
      ` : ''}
      
      <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 5px; margin-top: 30px; text-align: center;">
        <p style="margin: 0;">Thank you for choosing B3F Prints!</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">For any queries, contact us at b3f.prints.pages.de@gmail.com</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const orderData: OrderNotificationRequest = await req.json();

    console.log(`Sending order notification email to ${orderData.customerEmail} for order ${orderData.orderId}`);

    // Generate HTML email content
    const htmlContent = getEmailTemplate(orderData);

    // Here you would integrate with your SMTP service
    // For now, we'll log the email content and return success
    console.log("Email notification content generated:", {
      to: orderData.customerEmail,
      subject: `Order Update: ${orderData.orderId} - ${orderData.status.toUpperCase()}`,
      from: 'b3f.prints.pages.dev@gmail.com'
    });

    // TODO: Integrate with actual SMTP service (SendGrid, Resend, etc.)
    // const emailResult = await sendEmail({
    //   from: 'b3f.prints.pages.de@gmail.com',
    //   to: orderData.customerEmail,
    //   subject: `Order Update: ${orderData.orderId} - ${orderData.status.toUpperCase()}`,
    //   html: htmlContent
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order notification email prepared",
        orderId: orderData.orderId,
        status: orderData.status,
        emailContent: htmlContent
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending order notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});