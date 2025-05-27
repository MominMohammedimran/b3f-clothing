
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import OrderDetailsModal from '../orders/OrderDetailsModal';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  date: string;
  items: any[]; // Using any[] to avoid type issues
}

interface UserProfileOrdersProps {
  userId: string;
}

const UserProfileOrders: React.FC<UserProfileOrdersProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);
  
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Order interface
      const transformedOrders = data?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        status: order.status,
        date: order.date,
        items: Array.isArray(order.items) ? order.items : []
      })) || [];
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show error toast to improve user experience
      setOrders([]);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-10 text-center">
        <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <Button asChild>
          <a href="/">Start Shopping</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Your Orders</h2>
      
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Order #{order.order_number}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Placed on: {formatDate(order.date)}</p>
              </div>
              
              <div className="text-right">
                <p className="font-medium">{formatCurrency(order.total)}</p>
                <Button 
                  size="sm" 
                  variant="link" 
                  className="mt-1 h-auto p-0"
                  onClick={() => handleViewOrder(order)}
                >
                  <Eye size={14} className="mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={showOrderDetails}
          onOpenChange={setShowOrderDetails}
        />
      )}
    </div>
  );
};

export default UserProfileOrders;
