
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import RazorpayCheckout from './RazorpayCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PaymentRetry = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const isRetry = searchParams.get('retry') === 'true';

  useEffect(() => {
    if (!orderId || !isRetry || !currentUser) {
      navigate('/orders');
      return;
    }

    fetchOrderDetails();
  }, [orderId, isRetry, currentUser]);

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
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update payment status to paid
      await supabase.rpc('update_payment_status', {
        p_order_id: orderId,
        p_payment_status: 'paid',
        p_order_status: 'pending'
      });

      toast.success('Payment successful!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error('Payment completed but failed to update status');
    }
  };

  const handlePaymentError = () => {
    toast.error('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p>Order not found</p>
      </div>
    );
  }

  return (
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
              cartItems={order.items || []}
              shippingAddress={order.shipping_address}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentRetry;
