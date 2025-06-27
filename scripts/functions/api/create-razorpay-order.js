
export async function onRequestPost(context) {
  try {
    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo } = await context.request.json();

    if (!amount || !currency || !receipt || !customerInfo) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: amount, currency, receipt, customerInfo' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const {
      RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE
    } = context.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderPayload = {
      amount,
      currency,
      receipt,
      notes: {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name
      }
    };

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

    // Store order in Supabase with 'pending' status - will be updated to 'paid' after successful payment
    const orderNumber = `B3F-${Date.now().toString().slice(-6)}`;
    
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'apikey': SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        order_number: orderNumber,
        user_id: '00000000-0000-0000-0000-000000000000', // Default user for guest orders
        total: amount / 100,
        status: 'pending', // Set to pending - will be updated after successful payment
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
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase error:', errorText);
      throw new Error(`Supabase error: ${errorText}`);
    }

    const order = await supabaseResponse.json();

    return new Response(JSON.stringify({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID,
      order_number: orderNumber,
      db_order_id: order[0].id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create order',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}