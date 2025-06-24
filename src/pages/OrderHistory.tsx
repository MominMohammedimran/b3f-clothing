
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Order, CartItem } from '../lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate= useNavigate()
  const seoData = useSEO({
    title: 'Order History - View Your Orders',
    description: 'View your complete order history and track the status of your custom printed products.',
    keywords: 'order history, my orders, order tracking, purchase history'
  });

   const redirect = (product: { id: string,pd_name:string }) => {
  // Example route logic
 if (!currentUser) {
      navigate('/signin?redirectTo=/orders');
      return;
    }
    else if (!product.pd_name.toLowerCase().includes('custom printed')) {
    navigate(`/product/details/${product.id}`);
  }
};

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

        let transformedOrders: Order[] = (data || []).map((order: any) => {
          // Parse items as CartItem[]
          let parsedItems: CartItem[] = [];
          try {
            if (Array.isArray(order.items)) {
              parsedItems = order.items.map((item: any) => ({
                id: item.id || '',
                product_id: item.product_id || '',
                productId: item.productId,
                name: item.name || '',
                image: item.image,
                price: item.price || 0,
                sizes: Array.isArray(item.sizes) ? item.sizes : [],
                color: item.color,
                metadata: item.metadata
              }));
            }
          } catch (e) {
            console.error('Error parsing order items:', e);
            parsedItems = [];
          }

          // Ensure status is properly typed
          const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'pending'] as const;
          const orderStatus = validStatuses.includes(order.status as any) ? order.status : 'pending';

          return {
            id: order.id,
            orderNumber: order.order_number,
            order_number: order.order_number,
            userId: order.user_id,
            user_id: order.user_id,
            userEmail: order.user_email || '',
            user_email: order.user_email || '',
            items: parsedItems,
            total: order.total,
            reward_points: order.reward_points || 0,
            status: orderStatus,
            paymentMethod: order.payment_method || 'unknown',
            payment_method: order.payment_method || 'unknown',
            shippingAddress: order.shipping_address,
            shipping_address: order.shipping_address,
            deliveryFee: order.delivery_fee,
            delivery_fee: order.delivery_fee,
            createdAt: order.created_at,
            created_at: order.created_at,
            updatedAt: order.updated_at,
            updated_at: order.updated_at,
            date: order.created_at,
            cancellationReason: order.cancellation_reason || null,
            cancellation_reason: order.cancellation_reason || null,
            payment_details: order.payment_details || null,
            payment_status: order.payment_status || 'pending',
            order_status: order.order_status || order.status || 'pending'
          };
        });

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleRemoveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Order removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove order');
    }
  };

  const getStatusBadgeClass = (status: string, paymentStatus: string) => {
    if (paymentStatus !== 'paid') return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (paymentStatus !== 'paid') return 'Payment Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <Link to="/"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Reward Points Used: <span className="font-semibold text-blue-600">{order.reward_points || 0}</span>
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status, order.payment_status)}`}>
                      {getStatusText(order.status, order.payment_status)}
                    </span>
                  </div>
                </div>

                {/* Order Status Notes */}
                {(order.status === 'refunded' || order.status === 'failed' || order.cancellation_reason) && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">
                      {order.status === 'refunded' && 'Order Refunded'}
                      {order.status === 'failed' && 'Order Failed'}
                      {order.status === 'cancelled' && 'Order Cancelled'}
                    </p>
                    {order.cancellation_reason && (
                      <p className="text-sm text-yellow-700 mt-1">
                        Note: {order.cancellation_reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Items Display */}
                <div className="space-y-2">
                  {order.items.map((item: any, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <img src={item.image || '/placeholder.svg'} 
                       onClick={() => redirect({ id: item.product_id ,pd_name:item.name})}
                      className={`h-14 w-14 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                       alt={item.name} />
                      <div className="text-sm">
                        <p className="font-medium">{item.name}</p>
                        {Array.isArray(item.sizes) ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.sizes.map((s: any, i: number) => (
                              <div key={i} className="bg-gray-100 px-2 py-1 rounded text-xs border">
                                <span className="text-gray-700">{s.size}</span> × <span className="text-gray-700">{s.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">{item.size} × {item.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {order.payment_status !== 'paid' ? (
                    <>
                      <Link to={`/payment-retry/${order.id}`}>
                        <Button variant="destructive" size="sm">Pay Now</Button>
                      </Link>
                      <Button onClick={() => handleRemoveOrder(order.id)} variant="ghost" size="icon" className="text-red-600 hover:text-red-800">
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Link to={`/track-order/${order.id}`}>
                      <Button variant="outline" size="sm">Track Order</Button>
                    </Link>
                  )}
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
