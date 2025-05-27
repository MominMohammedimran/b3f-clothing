
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define types for notification request
interface NotificationRequest {
  channel: "email" | "whatsapp";
  to: string;
  type: string;
  orderId: string;
  data?: Record<string, any>;
}

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};

// Email templates based on notification type
const getEmailTemplate = (type: string, orderId: string, data?: Record<string, any>): { subject: string, html: string } => {
  switch (type) {
    case "payment_confirmed":
      return {
        subject: `Payment Confirmed - Order #${orderId}`,
        html: `
          <h1>Payment Confirmed!</h1>
          <p>Thank you for your payment. Your order #${orderId} has been confirmed.</p>
          <p>Amount: ${data?.amount || "N/A"}</p>
          <p>We'll update you when your order ships.</p>
          <p>Thank you for shopping with us!</p>
        `
      };
    case "order_confirmed":
      return {
        subject: `Order Confirmed - Order #${orderId}`,
        html: `
          <h1>Order Confirmed!</h1>
          <p>Your order #${orderId} has been confirmed and is being processed.</p>
          <p>Estimated delivery date: ${data?.estimatedDelivery || "N/A"}</p>
          <p>Thank you for shopping with us!</p>
        `
      };
    case "order_shipped":
      return {
        subject: `Your Order #${orderId} Has Been Shipped`,
        html: `
          <h1>Order Shipped!</h1>
          <p>Your order #${orderId} has been shipped and is on its way.</p>
          <p>Tracking number: ${data?.trackingNumber || "N/A"}</p>
          <p>Estimated delivery date: ${data?.estimatedDelivery || "N/A"}</p>
        `
      };
    case "order_delivered":
      return {
        subject: `Your Order #${orderId} Has Been Delivered`,
        html: `
          <h1>Order Delivered!</h1>
          <p>Your order #${orderId} has been delivered.</p>
          <p>We hope you enjoy your purchase!</p>
          <p>Please let us know if you have any questions or concerns.</p>
        `
      };
    default:
      return {
        subject: `Update on Your Order #${orderId}`,
        html: `<p>There is an update to your order #${orderId}.</p>`
      };
  }
};

// WhatsApp message templates based on notification type
const getWhatsAppMessage = (type: string, orderId: string, data?: Record<string, any>): string => {
  switch (type) {
    case "payment_confirmed":
      return `Payment Confirmed ✅ - Thank you for your payment. Your order #${orderId} has been confirmed.`;
    case "order_confirmed":
      return `Order Confirmed ✅ - Your order #${orderId} has been confirmed and is being processed. Estimated delivery: ${data?.estimatedDelivery || "N/A"}`;
    case "order_shipped":
      return `Order Shipped 🚚 - Your order #${orderId} is on its way! Tracking: ${data?.trackingNumber || "N/A"}`;
    case "order_delivered":
      return `Order Delivered 📦 - Your order #${orderId} has been delivered. Enjoy your purchase!`;
    default:
      return `Update on your order #${orderId}.`;
  }
};

// Mock function for sending email (in production would use a real email service)
const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  // In a real implementation, you would integrate with an email service like SendGrid or Resend
  console.log(`[MOCK] Sending email to ${to}`);
  console.log(`[MOCK] Subject: ${subject}`);
  console.log(`[MOCK] Content: ${htmlContent}`);
  return true;
};

// Mock function for sending WhatsApp message (in production would use WhatsApp Business API)
const sendWhatsApp = async (to: string, message: string): Promise<boolean> => {
  // In a real implementation, you would integrate with WhatsApp Business API
  console.log(`[MOCK] Sending WhatsApp message to ${to}`);
  console.log(`[MOCK] Message: ${message}`);
  return true;
};

// Record notification in database
const recordNotification = async (
  supabase: any,
  userId: string,
  orderId: string,
  type: string,
  channel: string,
  success: boolean
): Promise<void> => {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      order_id: orderId,
      type,
      channel,
      status: success ? "delivered" : "failed",
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recording notification:", error);
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { channel, to, type, orderId, data } = await req.json() as NotificationRequest;

    // Get user ID and order details
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (orderError) {
      throw new Error(`Error fetching order: ${orderError.message}`);
    }

    const userId = orderData.user_id;
    let success = false;

    // Send notification based on channel
    if (channel === "email") {
      const { subject, html } = getEmailTemplate(type, orderId, data);
      success = await sendEmail(to, subject, html);
      await recordNotification(supabase, userId, orderId, type, "email", success);
    } else if (channel === "whatsapp") {
      const message = getWhatsAppMessage(type, orderId, data);
      success = await sendWhatsApp(to, message);
      await recordNotification(supabase, userId, orderId, type, "whatsapp", success);
    } else {
      throw new Error("Invalid notification channel");
    }

    return new Response(
      JSON.stringify({
        success,
        message: `${channel} notification ${success ? "sent" : "failed"} for ${type}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
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
