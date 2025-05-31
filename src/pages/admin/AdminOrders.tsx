
import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import OrderListItem from '@/components/admin/orders/OrderListItem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define a local Order interface to avoid conflicts with the imported type
interface AdminOrder {
  id: string;
  order_number: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  items?: any[];
  delivery_fee?: number;
  payment_method?: string;
  shipping_address?: any;
  updated_at?: string;
  user_id?: string;
}

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use React Query for better data fetching
  const { 
    data: ordersData = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchOrders,
    retry: 3,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true
  });

  async function fetchOrders(): Promise<AdminOrder[]> {
    try {
      console.log('Fetching orders from Supabase...');
      // Try to get orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, profiles:user_id(email)')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Supabase error:', ordersError);
        throw ordersError;
      }
      
      if (ordersData && ordersData.length > 0) {
        console.log(`Retrieved ${ordersData.length} orders`);
        // Format the orders with email from profiles
        const formattedOrders = ordersData.map((order: any) => ({
          ...order,
          user_email: order.profiles?.email || 'customer@example.com',
        }));
        
        return formattedOrders as AdminOrder[];
      }
      
      console.log('No orders found');
      // Return empty array if no orders
      return [];
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
      return [];
    }
  }

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Update in database
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      
      // If the currently selected order is the one being updated, update it
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order deleted successfully');
      
      // Close the dialog if the deleted order was selected
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDetails(false);
        setSelectedOrder(null);
      }
      
      setDeleteOrderId(null);
    } catch (error: any) {
      toast.error(`Failed to delete order: ${error.message}`);
    }
  };

  const renderOrdersTable = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading orders. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      );
    }

    return (
      <Table>
        <TableCaption>List of all orders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersData.length > 0 ? (
            ordersData.map((order) => (
              <OrderListItem 
                key={order.id}
                order={order}
                onView={() => handleViewOrder(order)}
                onStatusUpdate={handleStatusUpdate}
                onDelete={() => setDeleteOrderId(order.id)}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">No orders found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6 pt-0">
        <div className="flex justify-between items-center sticky top-0 bg-white py-4 z-10">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          </div>
        </div>
        
        {renderOrdersTable()}
      </div>

      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder as any}
          open={showOrderDetails}
          onOpenChange={setShowOrderDetails}
          onStatusUpdate={handleStatusUpdate}
          onDeleteOrder={() => setDeleteOrderId(selectedOrder.id)}
        />
      )}
      
      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteOrderId && handleDeleteOrder(deleteOrderId)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrders;
