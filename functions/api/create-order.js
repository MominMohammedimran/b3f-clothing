export async function onRequestPost(context) {
  const { amount, description, customer, callback_url } = await context.request.json();

  const key_id = context.env.RAZORPAY_KEY_ID;
  const key_secret = context.env.RAZORPAY_KEY_SECRET;
  const credentials = btoa(`${key_id}:${key_secret}`);

  const response = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      description,
      customer,
      notify: {
        sms: false,
        email: true,
      },
      callback_url,
      callback_method: "get",
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: response.status,
  });
}
