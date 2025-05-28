
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import { CartItem } from '@/lib/types';

interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  items: CartItem[];
  user_email?: string;
  user_name?: string;
  shipping_address?: any;
  payment_method?: string;
}

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const {
    data: orders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminOrders', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching orders...');
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%`);
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      // Fetch user profiles for each order and transform data
      const ordersWithUserInfo = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', order.user_id)
              .maybeSingle();

            // Transform items to CartItem[] format
            const transformedItems: CartItem[] = Array.isArray(order.items) 
              ? order.items.map((item: any) => ({
                  id: item.id || item.product_id || 'unknown',
                  name: item.name || 'Unknown Product',
                  price: Number(item.price) || 0,
                  quantity: Number(item.quantity) || 1,
                  image: item.image || '',
                  productId: item.product_id,
                  size: item.size,
                  color: item.color
                }))
              : [];

            const transformedOrder: AdminOrder = {
              id: order.id,
              order_number: order.order_number || '',
              user_id: order.user_id,
              total: Number(order.total) || 0,
              status: order.status || 'pending',
              created_at: order.created_at,
              items: transformedItems,
              user_email: profile?.email || 'Unknown',
              user_name: profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : profile?.first_name || profile?.last_name || 'Unknown',
              shipping_address: order.shipping_address,
              payment_method: order.payment_method
            };

            return transformedOrder;
          } catch (error) {
            console.error('Error fetching user profile:', error);
            
            // Fallback transformation
            const transformedItems: CartItem[] = Array.isArray(order.items) 
              ? order.items.map((item: any) => ({
                  id: item.id || item.product_id || 'unknown',
                  name: item.name || 'Unknown Product',
                  price: Number(item.price) || 0,
                  quantity: Number(item.quantity) || 1,
                  image: item.image || '',
                  productId: item.product_id,
                  size: item.size,
                  color: item.color
                }))
              : [];

            return {
              id: order.id,
              order_number: order.order_number || '',
              user_id: order.user_id,
              total: Number(order.total) || 0,
              status: order.status || 'pending',
              created_at: order.created_at,
              items: transformedItems,
              user_email: 'Unknown',
              user_name: 'Unknown',
              shipping_address: order.shipping_address,
              payment_method: order.payment_method
            };
          }
        })
      );

      console.log('Orders fetched:', ordersWithUserInfo);
      return ordersWithUserInfo;
    },
    staleTime: 30000
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Also update the tracking table
      const { error: trackingError } = await supabase
        .from('order_tracking')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (trackingError) {
        console.error('Error updating tracking:', trackingError);
      }

      toast.success('Order status updated successfully');
      refetch();
      setShowOrderDetails(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Orders">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading orders.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item(s)
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.user_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user_email || 'No email'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={showOrderDetails}
          onOpenChange={setShowOrderDetails}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
