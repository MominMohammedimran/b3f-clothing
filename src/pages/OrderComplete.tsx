
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Layout from '@/components/layout/Layout';
import { CheckCircle, Package } from 'lucide-react';

const OrderComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
      // Clear cart after successful payment
      clearCart();
    } else if (!orderNumber) {
      navigate('/');
    }
  }, [orderId, orderNumber, navigate]);

  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">
                Thank you for your order. Your payment has been processed successfully.
              </p>
            </div>

            {orderData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order Number:</span>
                  <span>{orderData.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">₹{orderData.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="text-blue-600 capitalize">{orderData.status}</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">What's Next?</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• We'll start processing your order within 24 hours</li>
                <li>• Track your order status in the Orders section</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={() => navigate('/orders')} className="w-full">
                View My Orders
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderComplete;