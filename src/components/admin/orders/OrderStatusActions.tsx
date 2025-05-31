
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
      // Update the status in Supabase
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
      
      // Call the callback to update the UI
      onStatusUpdate(orderId, newStatus);
      toast.success(`Order status updated to: ${newStatus}`);
    } catch (error: any) {
      toast.error(`Failed to update order status: ${error.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold mb-2">Update Status</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={() => updateStatus('processing')}
          disabled={currentStatus === 'processing' || isUpdating !== null}
          className={currentStatus === 'processing' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
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
          className={currentStatus === 'shipped' ? 'bg-blue-500 hover:bg-blue-600' : ''}
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
          className={currentStatus === 'out for delivery' ? 'bg-purple-500 hover:bg-purple-600' : ''}
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
          className={currentStatus === 'delivered' ? 'bg-green-500 hover:bg-green-600' : ''}
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
