
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package2, ShoppingBag, CreditCard, TruckIcon, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Order, CartItem } from '@/lib/types';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is logged in
    if (!currentUser) {
      toast.error({ title: 'Please sign in to view your orders' });
      navigate('/signin');
      return;
    }
    
    loadOrders();
  }, [currentUser]);
  
  const loadOrders = async () => {
    setLoading(true);
    try {
      // Get orders from database if user is logged in
      if (currentUser && supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform data to match the Order type
          const transformedOrders = data.map((order: any) => {
            // Parse JSON items if they're stored as a string
            let parsedItems: CartItem[] = [];
            
            try {
              parsedItems = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : Array.isArray(order.items) ? order.items : [];
            } catch (e) {
              console.error('Failed to parse order items:', e);
              parsedItems = [];
            }
            
            // Convert to Order type
            return {
              id: order.id,
              user_id: order.user_id,
              order_number: order.order_number,
              status: order.status || 'processing',
              total: order.total,
              items: parsedItems,
              created_at: order.created_at,
              updated_at: order.updated_at,
              payment_method: order.payment_method,
              delivery_fee: order.delivery_fee,
              shipping_address: order.shipping_address
            };
          });
          
          setOrders(transformedOrders);
        } else {
          toast.info({ title: 'You have no orders yet' });
          setOrders([]);
        }
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date properly
  const formatOrderDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Date unavailable';
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <Package2 size={16} />;
      case 'processing':
        return <Clock size={16} />;
      case 'shipped':
        return <TruckIcon size={16} />;
      case 'cancelled':
        return <ShoppingBag size={16} />;
      case 'payment pending':
        return <CreditCard size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };
  
  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <div className="w-32"></div> {/* For balanced layout */}
        </div>
        
        {/* Display Orders History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Order History</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-opacity-50 border-t-blue-800 rounded-full"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={40} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">When you place orders, they will appear here.</p>
                <Link to="/" className="text-blue-600 hover:underline">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Order #{order.order_number}</div>
                        <div className="font-semibold">{formatOrderDate(order.created_at)}</div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}</span>
                        </div>
                        
                        <Link 
                               to="/track-order" 
                               state={{ orderId: order.id }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Track Order
                        </Link>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-3">
                        {Array.isArray(order.items) && order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-12 h-12 border rounded-md overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.quantity > 1 && <span className="ml-2">Qty: {item.quantity}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {Array.isArray(order.items) && order.items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm">
                          Total: <span className="font-bold">₹{order.total}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {order.payment_method ? (order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)) : 'Payment Method: Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
