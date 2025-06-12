import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import RazorpayCheckout from '@/components/payment/RazorpayCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

const PaymentRetry = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !currentUser) {
      navigate('/orders');
      return;
    }
    fetchOrderDetails();
  }, [orderId, currentUser]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', currentUser?.id)
        .single();

      if (error) throw error;

      setOrder(data);
      await createRazorpayOrder(data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const createRazorpayOrder = async (orderData: any) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          order_id: orderData.id,
          amount: Math.round(orderData.total * 100),
          currency: 'INR',
          retry: true
        },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (error) throw error;

      setRazorpayOrderId(data.razorpayOrderId);
    } catch (err: any) {
      console.error('Error creating Razorpay order:', err);
      toast.error('Failed to create payment request');
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await supabase.rpc('update_payment_status', {
        p_order_id: orderId,
        p_payment_status: 'paid',
        p_order_status: 'pending'
      });

      toast.success('Payment successful!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error('Payment succeeded but failed to update status');
    }
  };

  const handlePaymentError = () => {
    toast.error('Payment failed. Please try again.');
  };

  if (loading || !razorpayOrderId) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Order not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Retry Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Order Number:</strong> {order.order_number}</p>
                <p><strong>Total Amount:</strong> ₹{order.total}</p>
                <p><strong>Items:</strong> {order.items?.length || 0}</p>
                <p><strong>Status:</strong> Payment Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <RazorpayCheckout
                amount={order.total}
                orderId={razorpayOrderId}
                cartItems={order.items || []}
                shippingAddress={order.shipping_address}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                OrderId={orderId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentRetry;
