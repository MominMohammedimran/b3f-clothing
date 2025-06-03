
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    console.log('Sending order notification email:', {
      orderId,
      customerEmail,
      status,
      itemCount: orderItems?.length || 0
    });

    // Email template based on status
    let subject = '';
    let htmlContent = '';

    switch (status.toLowerCase()) {
      case 'confirmed':
        subject = `Order Confirmed - ${orderId}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Order Confirmed!</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for your order! Your order <strong>${orderId}</strong> has been confirmed and is being processed.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${orderId}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>

            <div style="background-color: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 6px;">
              <h4>Items Ordered:</h4>
              ${orderItems?.map((item: any) => `
                <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #2563eb;">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} | Price: ₹${item.price}
                  ${item.size ? `| Size: ${item.size}` : ''}
                </div>
              `).join('') || '<p>No items found</p>'}
            </div>

            ${shippingAddress ? `
              <div style="background-color: #f0f9ff; padding: 15px; margin: 15px 0; border-radius: 6px;">
                <h4>Shipping Address:</h4>
                <p>${shippingAddress.fullName}<br>
                ${shippingAddress.address}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}</p>
              </div>
            ` : ''}

            <p>We'll keep you updated on your order status. Thank you for choosing B3F Prints!</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                B3F Prints Team<br>
                <a href="https://b3f-prints-pages.dev" style="color: #2563eb;">b3f-prints-pages.dev</a>
              </p>
            </div>
          </div>
        `;
        break;

      case 'processing':
        subject = `Order Processing - ${orderId}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Order Processing</h2>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${orderId}</strong> is now being processed. We're working on preparing your items for shipment.</p>
            <p>Total Amount: ₹${totalAmount}</p>
            <p>We'll notify you once your order is ready to ship!</p>
            <p>Best regards,<br>B3F Prints Team</p>
          </div>
        `;
        break;

      case 'shipped':
        subject = `Order Shipped - ${orderId}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Order Shipped!</h2>
            <p>Dear ${customerName},</p>
            <p>Great news! Your order <strong>${orderId}</strong> has been shipped and is on its way to you.</p>
            <p>Total Amount: ₹${totalAmount}</p>
            <p>You should receive your order within 3-5 business days.</p>
            <p>Best regards,<br>B3F Prints Team</p>
          </div>
        `;
        break;

      case 'delivered':
        subject = `Order Delivered - ${orderId}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Order Delivered!</h2>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${orderId}</strong> has been successfully delivered!</p>
            <p>Total Amount: ₹${totalAmount}</p>
            <p>We hope you're happy with your purchase. Thank you for choosing B3F Prints!</p>
            <p>Best regards,<br>B3F Prints Team</p>
          </div>
        `;
        break;

      default:
        subject = `Order Update - ${orderId}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Update</h2>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${orderId}</strong> status has been updated to: <strong>${status}</strong></p>
            <p>Total Amount: ₹${totalAmount}</p>
            <p>Best regards,<br>B3F Prints Team</p>
          </div>
        `;
    }

    // Mock email sending (replace with actual email service like Resend)
    console.log('Email would be sent:', {
      to: customerEmail,
      subject,
      html: htmlContent
    });

    // Simulate successful email sending
    const emailResult = {
      success: true,
      messageId: `email_${Date.now()}`,
      to: customerEmail,
      subject
    };

    return new Response(
      JSON.stringify(emailResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending order notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
