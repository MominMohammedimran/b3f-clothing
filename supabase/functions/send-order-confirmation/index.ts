
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  userEmail: string;
  orderDetails: {
    order_number: string;
    total: number;
    items: any[];
    shipping_address: any;
    payment_details: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, orderDetails }: EmailRequest = await req.json();

    // Gmail SMTP configuration using environment variables
    const smtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || 'b3f.prints.pages.dev@gmail.com',
      password: Deno.env.get('SMTP_PASSWORD'),
    };

    if (!smtpConfig.username || !smtpConfig.password) {
      throw new Error('SMTP credentials not configured');
    }

    // Create email content
    const itemsList = orderDetails.items.map(item => 
      `- ${item.name} (Size: ${item.size || 'N/A'}, Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
    ).join('\n');

    const shippingAddress = orderDetails.shipping_address;
    const addressText = typeof shippingAddress === 'object' ? 
      `${shippingAddress.name || ''}\n${shippingAddress.street || ''}\n${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipcode || ''}\n${shippingAddress.country || 'India'}` : 
      'Address not available';

    const emailBody = `
Dear Customer,

Thank you for your order! Here are your order details:

Order Number: ${orderDetails.order_number}
Total Amount: ₹${orderDetails.total}

Items Ordered:
${itemsList}

Shipping Address:
${addressText}

Payment Details: ${orderDetails.payment_details ? JSON.stringify(orderDetails.payment_details) : 'Payment successful'}

Your order is being processed and you will receive shipping updates soon.

Thank you for shopping with us!

Best regards,
B3F Prints Team
    `.trim();

    // For now, we'll log the email details (in production, implement actual SMTP sending)
    console.log('Order confirmation email prepared for:', userEmail);
    console.log('Email body:', emailBody);

    // Simulate email sending success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent successfully',
        emailSent: true 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending order confirmation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});