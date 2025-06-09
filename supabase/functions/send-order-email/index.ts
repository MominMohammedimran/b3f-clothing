
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderEmailRequest {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  orderDetails: any;
  status?: string;
  emailType: 'confirmation' | 'status_update';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, customerEmail, customerName, orderDetails, status, emailType }: OrderEmailRequest = await req.json();

   
    // Create SMTP configuration
    const smtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || 'b3f.prints.pages.dev@gmail.com',
      password: Deno.env.get('SMTP_PASSWORD'),
      tls: true,
    };

    let subject = '';
    let htmlContent = '';

    if (emailType === 'confirmation') {
      subject = `Order Confirmation - ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your order, ${customerName}!</h2>
          <p>Your order <strong>${orderNumber}</strong> has been confirmed and is being processed.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
            <p><strong>Items:</strong></p>
            <ul>
              ${orderDetails.items?.map((item: any) => `
                <li>${item.name} - ${item.quantity}x ₹${item.price}</li>
              `).join('') || 'No items listed'}
            </ul>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Thank you for choosing B3F Prints!</p>
        </div>
      `;
    } else {
      subject = `Order Update - ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Hello ${customerName},</p>
          <p>Your order <strong>${orderNumber}</strong> status has been updated to: <strong>${status}</strong></p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Current Status:</strong> ${status}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
          </div>
          
          <p>Thank you for your patience!</p>
          <p>Best regards,<br>B3F Prints Team</p>
        </div>
      `;
    }

    // Use Supabase's built-in email functionality or external service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store email log
    await supabase.from('email_logs').insert({
      to_email: customerEmail,
      subject: subject,
      content: htmlContent,
      status: 'sent',
      order_number: orderNumber
    });

    // Here you would integrate with your actual email service
    // For now, we'll simulate sending
   
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
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
