import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import OrderListItem from '../../components/admin/orders/OrderListItem';
import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import AdminOrderDownload from '../../components/admin/AdminOrderDownload';
import AdminDownloadDesign from '../../components/admin/AdminDownloadDesign';
import AdminLayout from '../../components/admin/AdminLayout';
import { notifyOrderStatusChange } from '../../components/admin/OrderStatusEmailService';

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  shipping_address: any;
  payment_method: string;
  payment_status?: string;
  order_status?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedOrders = data.map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          user_email: order.user_email || 'N/A',
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          items: order.items || [],
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          order_status: order.order_status
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Update order_status instead of status
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      const updatedOrder = orders.find(order => order.id === orderId);
      
      if (updatedOrder) {
        console.log('Order found, attempting to send email:', {
          orderNumber: updatedOrder.order_number,
          email: updatedOrder.user_email,
          status: newStatus
        });

        // Show loading toast
        const loadingToast = toast.loading('Updating order status and sending email...');
        
        try {
          // Send status update email to user with improved error handling
          const emailSent = await notifyOrderStatusChange(
            updatedOrder.order_number,
            newStatus,
            updatedOrder.user_email,
            updatedOrder.items || [],
            updatedOrder.total,
            updatedOrder.shipping_address
          );
          
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          
          if (emailSent) {
            toast.success(`✅ Order status updated to "${newStatus}" and email sent to ${updatedOrder.user_email}`, {
              duration: 5000
            });
          } else {
            toast.warning(`⚠️ Order status updated to "${newStatus}" but email notification failed`, {
              duration: 5000
            });
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          toast.dismiss(loadingToast);
          toast.error(`❌ Order status updated but failed to send email: ${emailError}`, {
            duration: 5000
          });
        }
      } else {
        console.warn('Order not found for email sending');
        toast.warning('Order status updated but could not send email - order not found');
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, order_status: newStatus } : order
      ));

    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error}`);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Customer', 'Status', 'Total'],
      ...orders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString(),
        order.user_email,
        order.order_status || order.status,
        order.total.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasCustomPrinted = (order: Order) => {
    return order.items?.some((item: any) => 
      item.name?.toLowerCase().includes('custom printed') ||
      item.name?.toLowerCase().includes('custom') ||
      item.metadata?.designData ||
      item.metadata?.printType === 'custom' ||
      item.metadata?.previewImage
    );
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.order_status || order.status).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <Button variant="outline" onClick={handleExportOrders}>
            Export Orders
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email Status Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">📧 Email Notifications</h3>
          <p className="text-sm text-blue-700">
            When you update an order status, an automatic email notification will be sent to the customer. 
            Watch for success/error messages to confirm email delivery.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <div>{order.user_email}</div>
                          <div className="text-xs text-gray-500">
                            {order.user_email && order.user_email !== 'N/A' ? '✅ Valid email' : '❌ No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {order.payment_status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'}>
                          {order.order_status || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{order.total}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </Button>
                          <AdminOrderDownload order={order} />
                          {hasCustomPrinted(order) && (
                            <AdminDownloadDesign order={order} />
                          )}
                          {(order.order_status || order.status) !== 'delivered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                            >
                              📧 Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showOrderDetails && selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={showOrderDetails}
            onOpenChange={(open) => setShowOrderDetails(open)}
            onStatusUpdate={handleStatusUpdate}
            onDeleteOrder={() => handleDeleteOrder(selectedOrder.id)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
