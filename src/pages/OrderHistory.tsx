
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Order } from '../lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const seoData = useSEO({
    title: 'Order History - View Your Orders',
    description: 'View your complete order history and track the status of your custom printed products.',
    keywords: 'order history, my orders, order tracking, purchase history'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedOrders: Order[] = data?.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          order_number: order.order_number,
          userId: order.user_id,
          user_id: order.user_id,
          userEmail: '', // Not available in database
          user_email: '', // Not available in database
          items: Array.isArray(order.items) ? order.items as any[] : [],
          total: order.total,
          status: order.status as 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending',
          paymentMethod: order.payment_method,
          payment_method: order.payment_method,
          shippingAddress: typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address,
          shipping_address: order.shipping_address,
          deliveryFee: order.delivery_fee,
          delivery_fee: order.delivery_fee,
          createdAt: order.created_at,
          created_at: order.created_at,
          updatedAt: order.updated_at,
          updated_at: order.updated_at,
          date: order.date || order.created_at
        })) || [];

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No orders found</p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {Array.isArray(order.items) ? order.items.length : 0} item(s)
                  </p>
                  <Link to={`/track-order/${order.id}`}>
                    <Button variant="outline" size="sm">Track Order</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderHistory;
