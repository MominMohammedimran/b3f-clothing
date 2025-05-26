
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const OrderStatusActions = ({ orderId, currentStatus, onStatusUpdate }: OrderStatusActionsProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    if (!orderId) {
      toast.error('Order ID is missing');
      return;
    }
    
    if (newStatus === currentStatus) {
      toast.info('Order is already in this status');
      return;
    }
    
    setIsUpdating(newStatus);
    
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      
      // Update the status in orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('*');
      
      if (orderError) {
        console.error('Error updating order status:', orderError);
        throw orderError;
      }
      
      console.log('Order status updated:', orderData);
      
      // Call the callback to update the UI immediately
      onStatusUpdate(orderId, newStatus);
      toast.success(`Order status updated to: ${newStatus}`);
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'processing':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'shipped':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'out for delivery':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold mb-2">Update Status</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => updateStatus('pending')}
          disabled={currentStatus === 'pending' || isUpdating !== null}
          className={currentStatus === 'pending' ? getStatusColor('pending') : ''}
        >
          {isUpdating === 'pending' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Pending'}
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => updateStatus('processing')}
          disabled={currentStatus === 'processing' || isUpdating !== null}
          className={currentStatus === 'processing' ? getStatusColor('processing') : ''}
        >
          {isUpdating === 'processing' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Processing'}
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => updateStatus('shipped')}
          disabled={currentStatus === 'shipped' || isUpdating !== null}
          className={currentStatus === 'shipped' ? getStatusColor('shipped') : ''}
        >
          {isUpdating === 'shipped' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Shipped'}
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => updateStatus('out for delivery')}
          disabled={currentStatus === 'out for delivery' || isUpdating !== null}
          className={currentStatus === 'out for delivery' ? getStatusColor('out for delivery') : ''}
        >
          {isUpdating === 'out for delivery' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Out for Delivery'}
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => updateStatus('delivered')}
          disabled={currentStatus === 'delivered' || isUpdating !== null}
          className={currentStatus === 'delivered' ? getStatusColor('delivered') : ''}
        >
          {isUpdating === 'delivered' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Delivered'}
        </Button>
        
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => updateStatus('cancelled')}
          disabled={currentStatus === 'cancelled' || isUpdating !== null}
          className={currentStatus === 'cancelled' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
        >
          {isUpdating === 'cancelled' ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Updating...
            </>
          ) : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

export default OrderStatusActions;
