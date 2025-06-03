
import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';

export const useOrderData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock order data for now
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        order_number: 'ORD-001',
        userId: 'user1',
        user_id: 'user1',
        userEmail: 'user@example.com',
        user_email: 'user@example.com',
        items: [],
        total: 500,
        status: 'processing',
        paymentMethod: 'razorpay',
        payment_method: 'razorpay',
        shippingAddress: {},
        shipping_address: {},
        deliveryFee: 50,
        delivery_fee: 50,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date: new Date().toISOString(),
        payment_details: {}
      }
    ];

    setOrders(mockOrders);
    setLoading(false);
  }, []);

  return { orders, loading };
};
