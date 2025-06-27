import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Eye, Trash2 } from 'lucide-react';
import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import AdminOrderDownload from '../../components/admin/AdminOrderDownload';
import AdminDownloadDesign from '../../components/admin/AdminDownloadDesign';
import PaymentStatusUpdateDialog from '../../components/admin/PaymentStatusUpdateDialog';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
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
  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

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

  const sendStatusUpdateEmail = async (order: Order, newStatus: string) => {
    if (!order.user_email || order.user_email === 'N/A') return;

    try {
      const { data, error } = await supabase.functions.invoke('send-order-notification', {
        body: {
          orderId: order.order_number,
          customerEmail: order.user_email,
          customerName: 'Customer',
          status: newStatus,
          orderItems: order.items,
          totalAmount: order.total,
          shippingAddress: order.shipping_address,
          businessEmail: 'b3f.prints.pages.dev@gmail.com'
        }
      });

      if (error) throw error;
      console.log('Status update email sent successfully',data);
      toast.success('Status update email sent to customer');
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      toast.error('Failed to send email notification');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
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
        const shipping = updatedOrder.shipping_address;
        const emailToSend = shipping?.email || updatedOrder.user_email;

        if (!emailToSend || emailToSend === 'N/A') {
          toast.warning('⚠️ No email found for this customer');
        } else {
          await notifyOrderStatusChange(
            updatedOrder.order_number,
            newStatus,
            emailToSend,
            updatedOrder.items || [],
            updatedOrder.total || 0,
            {
              name: shipping?.fullName || 'Customer',
              phone: shipping?.phone || '',
              email: emailToSend,
              address: shipping?.address || '',
              city: shipping?.city || '',
              state: shipping?.state || '',
              zipCode: shipping?.zipCode || '',
              country: shipping?.country || ''
            },
            updatedOrder.payment_method
          );
        }
      }

      // Update state locally
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      );

      toast.success('✅ Order status updated');
    } catch (err) {
      console.error('❌ Error updating status:', err);
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentUpdate = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentUpdate(true);
  };

  const handlePaymentUpdateComplete = () => {
    setShowPaymentUpdate(false);
    setSelectedOrderForPayment(null);
    fetchOrders(); // Refresh orders after payment update
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

  const downloadPreviewImage = async (order: Order) => {
    try {
      // Find custom printed items with preview images
      const customItems = order.items?.filter((item: any) => 
        item.name?.toLowerCase().includes('custom printed') && 
        (item.metadata?.previewImage || item.metadata?.designData)
      );

      if (!customItems || customItems.length === 0) {
        toast.error('No preview images found for this order');
        return;
      }

      for (const item of customItems) {
        const previewUrl = item.metadata?.previewImage || item.metadata?.designData?.previewUrl;
        
        if (previewUrl) {
          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = previewUrl;
          link.download = `${order.order_number}_${item.name.replace(/\s+/g, '_')}_preview.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }

      toast.success('Preview images downloaded');
    } catch (error) {
      console.error('Error downloading preview images:', error);
      toast.error('Failed to download preview images');
    }
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
    <ModernAdminLayout 
      title="Orders Management" 
      subtitle="Manage customer orders and track status"
      actionButton={
        <Button variant="outline" onClick={handleExportOrders} className="gap-2">
          <Download size={16} />
          Export Orders
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 text-sm text-gray-600">
            <Badge variant="outline">{filteredOrders.length} orders</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Order</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Payment Update</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.user_email}</TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                          {order.payment_status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePaymentUpdate(order)}
                          className="text-xs px-2 py-1 h-8"
                        >
                          Update Payment
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                          {order.order_status || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{order.total}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={14} />
                          </Button>
                          <AdminOrderDownload order={order} />
                          {hasCustomPrinted(order) && (
                            <>
                              <AdminDownloadDesign order={order} />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadPreviewImage(order)}
                                className="text-xs px-2 py-1 h-8"
                                title="Download Preview Image"
                              >
                                Preview
                              </Button>
                            </>
                          )}
                          {(order.order_status || order.status) !== 'delivered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="text-xs px-2 py-1 h-8"
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
              </div>
            )}
          </div>
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

        {showPaymentUpdate && selectedOrderForPayment && (
          <PaymentStatusUpdateDialog
            isOpen={showPaymentUpdate}
            onClose={() => setShowPaymentUpdate(false)}
            order={selectedOrderForPayment}
            onUpdate={handlePaymentUpdateComplete}
          />
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminOrders;