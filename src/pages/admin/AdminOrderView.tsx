
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatOrderStatus, formatOrderDate, formatAddress } from '@/utils/orderUtils';
import OrderDesignDownload from '@/components/admin/orders/OrderDesignDownload';
import AdminLayout from '../../components/admin/AdminLayout';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  items: any[];
  delivery_fee: number;
}

const AdminOrderView = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      // Transform the data to match our Order interface
      const transformedOrder = {
        id: data.id,
        order_number: data.order_number,
        user_id: data.user_id,
        total: data.total,
        status: data.status,
        payment_method: data.payment_method,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shipping_address: typeof data.shipping_address === 'string' 
          ? JSON.parse(data.shipping_address) 
          : data.shipping_address,
        items: Array.isArray(data.items) 
          ? data.items 
          : (typeof data.items === 'string' ? JSON.parse(data.items) : []),
        delivery_fee: data.delivery_fee || 0
      };

      setOrder(transformedOrder);
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <ModernAdminLayout title="Orders">
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading order...</span>
        </div>
      </div>
       </ModernAdminLayout>
    );
  }

  if (!order) {
    return (
      <ModernAdminLayout title="Orders">
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Button onClick={() => navigate('/admin/orders')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
      </ModernAdminLayout >
    );
  }

  return (
     <ModernAdminLayout title="Orders">
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/orders')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order Number:</span> {order.order_number}</p>
              <p><span className="font-medium">Status:</span> {formatOrderStatus(order.status)}</p>
              <p><span className="font-medium">Total:</span> ₹{order.total}</p>
              <p><span className="font-medium">Payment Method:</span> {order.payment_method}</p>
              <p><span className="font-medium">Date:</span> {formatOrderDate(order.created_at)}</p>
              <p><span className="font-medium">Delivery Fee:</span> ₹{order.delivery_fee}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.shipping_address?.name || 'N/A'}</p>
              <p><span className="font-medium">Address:</span> {formatAddress(order.shipping_address)}</p>
              <p><span className="font-medium">Phone:</span> {order.shipping_address?.phone || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {order.shipping_address?.email || 'N/A'}</p>
            </div>
            
            {/* Add Download Button Below Shipping Address */}
            <OrderDesignDownload 
              items={order.items} 
              orderNumber={order.order_number} 
            />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex items-start space-x-4 p-3 border rounded">
                <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {/* Show preview image if available, otherwise show product image */}
                  <img 
                    src={item.metadata?.previewImage || item.image || '/placeholder.svg'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Show design overlay if preview exists */}
                  {item.metadata?.previewImage && item.metadata.previewImage !== item.image && (
                    <div className="absolute inset-0 z-10">
                      <img
                        src={item.metadata.previewImage}
                        alt={`${item.name} design`}
                        className="w-full h-full object-contain"
                        style={{ zIndex: 10 }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Quantity: {item.quantity} | Price: ₹{item.price}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    {item.metadata?.view && <p>View: {item.metadata.view}</p>}
                    {item.metadata?.backImage && <p>Design Type: Dual-Sided</p>}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">₹{item.price * item.quantity}</p>
                  {item.metadata?.previewImage && (
                    <p className="text-xs text-green-600 mt-1">Custom Design</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
     </ModernAdminLayout>
  );
};

export default AdminOrderView;
