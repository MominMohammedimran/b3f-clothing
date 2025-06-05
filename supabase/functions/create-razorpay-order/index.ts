
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  cartItems: any[];
  shippingAddress: any;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Create Razorpay order function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo }: OrderRequest = await req.json();
    
    console.log('Order request:', { amount, currency, receipt, customerInfo });

    // Create Razorpay order using direct API call
    const razorpayKeyId = 'rzp_live_FQUylFpHDtgrDj';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'your_razorpay_secret_key';
    
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderPayload = {
      amount,
      currency,
      receipt,
      notes: {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name
      }
    };

    console.log('Creating Razorpay order with payload:', orderPayload);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder);

    // Store order in database
    const orderNumber = `ORD${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: '00000000-0000-0000-0000-000000000000', // Default user for guest orders
        total: amount / 100,
        status: 'pending',
        items: cartItems,
        payment_method: 'razorpay',
        delivery_fee: 0,
        shipping_address: shippingAddress,
        user_email: customerInfo.email,
        payment_details: {
          razorpay_order_id: razorpayOrder.id,
          amount: amount,
          currency: currency
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Database error:', orderError);
      throw orderError;
    }

    console.log('Order stored in database:', order);

    const response = {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId,
      order_number: orderNumber,
      db_order_id: order.id
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-razorpay-order function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create order',
        details: error
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
