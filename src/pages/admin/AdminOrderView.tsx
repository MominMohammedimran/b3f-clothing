import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderDate, formatAddress } from '@/utils/orderUtils';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle
} from 'lucide-react';

interface OrderItemsProps {
  items: CartItem[];
  total: number;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, total }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Order Items</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.size && `Size: ${item.size}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatPrice(item.price)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right font-medium">
                Total:
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-bold">
                {formatPrice(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let icon = <Clock className="w-4 h-4 mr-1" />;

  switch (status.toLowerCase()) {
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <Clock className="w-4 h-4 mr-1" />;
      break;
    case 'shipped':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <Truck className="w-4 h-4 mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <CheckCircle2 className="w-4 h-4 mr-1" />;
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <XCircle className="w-4 h-4 mr-1" />;
      break;
    case 'out for delivery':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <Package className="w-4 h-4 mr-1" />;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {status}
    </span>
  );
};

const AdminOrderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Parse JSON fields if needed
        const parsedOrder: Order = {
          ...data,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          shipping_address: typeof data.shipping_address === 'string' 
            ? JSON.parse(data.shipping_address) 
            : data.shipping_address
        };

        setOrder(parsedOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      setStatusLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update order status',
        variant: 'destructive',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setStatusLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason
        })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: 'cancelled', cancellation_reason: cancellationReason });
      setShowCancelDialog(false);
      
      toast({
        title: 'Order Cancelled',
        description: 'The order has been cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Could not cancel the order',
        variant: 'destructive',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8  mt-10">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/orders')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Order not found</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              The order you're looking for doesn't exist or has been removed.
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/orders')}
              >
                Back to Orders
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/orders')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            <h1 className="text-2xl font-bold">
              Order #{order.order_number || order.id.substring(0, 8)}
            </h1>
          </div>
          <Button variant="outline" onClick={handlePrintOrder}>
            <Printer className="mr-2 h-4 w-4" /> Print Order
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Order Details</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatOrderDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{order.payment_method || 'Cash on Delivery'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {order.user_email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="font-medium text-green-600">{formatPrice(order.total)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Update Status</p>
                <div className="flex space-x-2">
                  <Select
                    disabled={statusLoading || order.status === 'cancelled'}
                    onValueChange={handleStatusChange}
                    value={order.status}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="out for delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          Cancel Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Order</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for cancelling this order. This information will be visible to the customer.
                          </p>
                          <Textarea
                            placeholder="Cancellation reason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Back
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleCancelOrder}
                            disabled={!cancellationReason.trim()}
                          >
                            Confirm Cancellation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
              
              {order.status === 'cancelled' && order.cancellation_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
            
            <OrderItems 
              items={order.items}
              total={order.total}
            />
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="font-medium">{order.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {order.user_email || 'Not provided'}
                  </p>
                </div>
                <Link 
                  to={`/admin/customers/${order.user_id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Profile
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              {order.shipping_address ? (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p className="text-gray-600">{formatAddress(order.shipping_address)}</p>
                    </div>
                  </div>
                  {order.shipping_address.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <p>{order.shipping_address.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No shipping information provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderView;
