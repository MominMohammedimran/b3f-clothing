export async function onRequestPost(context) {
  try {
    const { amount, currency, receipt, cartItems, shippingAddress, customerInfo, orderNumber } = await context.request.json();

    const {
      RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE,
    } = context.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 });
    }

    // ✅ Step 1: Get real user ID from Supabase JWT
    const authHeader = context.request.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '').trim();

    let userId = null;
    if (jwt && jwt.length > 20) {
      try {
        const [header, payload] = jwt.split('.').slice(0, 2);
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.sub || null;
      } catch (err) {
        console.warn('Failed to decode JWT');
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid or missing Supabase token' }), { status: 401 });
    }

    // ✅ Step 2: Create Razorpay Order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes: {
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
        },
      }),
    });

    if (!razorpayRes.ok) {
      const errorText = await razorpayRes.text();
      throw new Error(`Razorpay Error: ${errorText}`);
    }

    const razorpayOrder = await razorpayRes.json();

    // ✅ Step 3: Insert Order into Supabase
    const orderInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        apikey: SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        order_number: orderNumber || receipt,
        user_id: userId,
        total: amount / 100,
        status: 'pending',
        items: cartItems,
        payment_method: 'razorpay',
        shipping_address: shippingAddress,
        user_email: customerInfo.email,
        payment_details: {
          razorpay_order_id: razorpayOrder.id,
          amount,
          currency,
        },
      }),
    });

    if (!orderInsertRes.ok) {
      const errorText = await orderInsertRes.text();
      throw new Error(`Supabase Error: ${errorText}`);
    }

    const dbOrder = await orderInsertRes.json();

    // ✅ Step 4: Return order info to frontend
    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: RAZORPAY_KEY_ID,
        order_number: orderNumber,
        db_order_id: dbOrder?.[0]?.id || null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('❌ create-order error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
