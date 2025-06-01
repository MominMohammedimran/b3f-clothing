
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo } = await req.json()

    // Get Razorpay credentials from Supabase secrets
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found')
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating Razorpay order with amount:', amount)

    // Create Razorpay order
    const orderData = {
      amount: amount, // Amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        customer_name: customerInfo?.name || '',
        customer_email: customerInfo?.email || '',
        items_count: cartItems?.length || 0,
        shipping_address: JSON.stringify(shippingAddress || {})
      }
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Razorpay API error:', response.status, errorText)
      throw new Error(`Razorpay API error: ${response.status}`)
    }

    const order = await response.json()
    console.log('Razorpay order created successfully:', order.id)

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayKeyId,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-razorpay-order function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})