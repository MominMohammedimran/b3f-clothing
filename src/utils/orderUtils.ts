
export const calculateEstimatedDelivery = (orderDate: Date): string => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days for delivery
  return deliveryDate.toISOString();
};

export const updateInventoryLevels = async (cartItems: any[]) => {
  // This is a placeholder function for inventory management
  // In a real application, you would update stock levels here
  console.log('Updating inventory for items:', cartItems);
  return Promise.resolve();
};

export const formatOrderStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export const getOrderStatusSteps = () => {
  return [
    { key: 'order_placed', label: 'Order Placed', description: 'Your order has been confirmed' },
    { key: 'processing', label: 'Processing', description: 'We are preparing your order' },
    { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is out for delivery' },
    { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered' }
  ];
};

export const parseOrderItems = (items: any): any[] => {
  if (!items) return [];
  
  // If items is already an array, return it
  if (Array.isArray(items)) return items;
  
  // If items is a string, try to parse it
  if (typeof items === 'string') {
    try {
      return JSON.parse(items);
    } catch (e) {
      console.error('Error parsing order items:', e);
      return [];
    }
  }
  
  // If items is an object, return it as a single-item array
  if (typeof items === 'object') {
    return [items];
  }
  
  return [];
};

export const normalizeOrderData = (orderData: any) => {
  return {
    ...orderData,
    items: parseOrderItems(orderData.items),
    shipping_address: typeof orderData.shipping_address === 'string' 
      ? JSON.parse(orderData.shipping_address) 
      : orderData.shipping_address || {}
  };
};

export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatAddress = (address: any): string => {
  if (!address || typeof address !== 'object') return 'N/A';
  
  const parts = [
    address.street || address.addressLine1,
    address.city,
    address.state,
    address.zipCode || address.postalCode || address.zipcode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ') || 'N/A';
};
