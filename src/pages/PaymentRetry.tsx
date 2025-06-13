
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PaymentRetry from '@/components/payment/PaymentRetry';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
const PaymentRetryPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        if (data.payment_status === 'paid') {
          toast.info('Payment already completed for this order');
          return;
        }

        setOrder(data);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading order...</span>
      </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist or has been completed.</p>
        </div>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Retry Payment</h1>
        <PaymentRetry
          orderId={order.id}
          amount={order.total}
          orderNumber={order.order_number}
          data={order}
        />
      </div>
    </div>
    </Layout>
  );
};

export default PaymentRetryPage;
