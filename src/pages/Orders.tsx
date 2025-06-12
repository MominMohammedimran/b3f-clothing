
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/layout/Layout';
import OrdersFilter from '../components/orders/OrdersFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlySuccessful, setShowOnlySuccessful] = useState(true);

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

      // Filter only orders with successful Razorpay payments
      const filteredOrders = data?.filter(order => {
        // Only show orders that have been successfully paid via Razorpay
        const isRazorpayPayment = order.payment_method === 'razorpay';
        const isSuccessfullyPaid = ['paid', 'completed', 'shipped', 'delivered', 'confirmed'].includes(order.status);
        
        return isRazorpayPayment && isSuccessfullyPaid;
      }) || [];

      setOrders(filteredOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser, showOnlySuccessful]);

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Please sign in to view your orders.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        <OrdersFilter 
          showOnlySuccessful={showOnlySuccessful}
          onToggleFilter={setShowOnlySuccessful}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                No successfully paid orders found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                      <p><strong>Total:</strong> ₹{order.total}</p>
                      <p><strong>Payment Method:</strong> Razorpay</p>
                    </div>
                    <div>
                      <p><strong>Items:</strong> {order.items?.length || 0}</p>
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Payment:</strong> <span className="text-green-600">Successfully Paid</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
