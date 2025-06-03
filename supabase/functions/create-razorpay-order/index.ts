
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://b3f-prints-pages.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo } = await req.json();

    console.log('Creating Razorpay order:', {
      amount,
      currency,
      receipt,
      cartItems: cartItems?.length || 0,
      customer: customerInfo?.email
    });

    // Mock Razorpay order creation for now - replace with actual Razorpay API call
    const orderData = {
      order_id: `order_${Date.now()}`,
      amount: amount,
      currency: currency || 'INR',
      key_id: 'rzp_live_FQUylFpHDtgrDj',
      receipt: receipt,
      prefill: {
        name: customerInfo?.name || '',
        email: customerInfo?.email || '',
        contact: customerInfo?.contact || ''
      }
    };

    return new Response(
      JSON.stringify(orderData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
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
