import { CartItem } from '@/lib/types';

export const createOrderInMicroservice = async (orderData: any) => {
  // Transform cart items to match expected format
  const transformedItems = orderData.items.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    sizes: item.sizes,
    image: item.image || '',
    color: item.color || '',
    metadata: item.metadata || null,
  }));

  const payload = {
    user_id: orderData.userId,
    user_email: orderData.userEmail,
    items: transformedItems,
    total: orderData.total,
    shipping_address: orderData.shippingAddress,
    payment_method: orderData.paymentMethod || 'upi',
    delivery_fee: orderData.deliveryFee || 0,
  };

  try {
    const response = await fetch(`${process.env.MICROSERVICE_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order in microservice:', error);
    throw error;
  }
};
