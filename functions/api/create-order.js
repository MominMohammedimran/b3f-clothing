export async function onRequestPost(context) {
  const body = await context.request.json();

  const { amount, currency = "INR", receipt = "order_rcptid_11" } = body;

  const key_id = context.env.RAZORPAY_KEY_ID;
  const key_secret = context.env.RAZORPAY_KEY_SECRET;

  const credentials = btoa(`${key_id}:${key_secret}`);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
    }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
