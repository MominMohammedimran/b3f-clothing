
import React, { useState } from 'react';
import { Eye, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusBadge from './OrderStatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderListItemProps {
  order: Order;
  onView: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  onDelete?: () => void;
}

const OrderListItem = ({ order, onView, onStatusUpdate, onDelete }: OrderListItemProps) => {
  const [updating, setUpdating] = useState(false);
  
  const handleMarkDelivered = async () => {
    setUpdating(true);
    try {
      // Try to update in database if supabase is available
      if (supabase) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', order.id);
        
        if (error) throw error;
      }
      
      // Update locally regardless of database availability
      onStatusUpdate(order.id, 'delivered');
      toast.success('Order marked as delivered');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <TableRow>
      <TableCell className="font-medium">{order.order_number}</TableCell>
      <TableCell>{formatDate(order.created_at)}</TableCell>
      <TableCell>{order.user_email}</TableCell>
      <TableCell><OrderStatusBadge status={order.status} /></TableCell>
      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600"
            onClick={onView}
          >
            <Eye size={16} className="mr-1" />
            View
          </Button>
          
          {order.status !== 'delivered' && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600"
              disabled={updating}
              onClick={handleMarkDelivered}
            >
              {updating ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <CheckCircle size={16} className="mr-1" />
              )}
              Mark Delivered
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrderListItem;
