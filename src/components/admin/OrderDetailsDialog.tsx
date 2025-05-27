
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusActions from './orders/OrderStatusActions';
import OrderItems from './orders/OrderItems';
import { Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/types';

interface AdminOrder {
  id: string;
  order_number: string;
  user_email?: string;
  status: string;
  created_at: string;
  items: CartItem[];
  total: number;
  shipping_address?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment_method?: string;
}

interface OrderDetailsDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  onDeleteOrder?: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  order, 
  open, 
  onOpenChange,
  onStatusUpdate,
  onDeleteOrder
}) => {
  if (!order) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Order #{order.order_number}</span>
            {onDeleteOrder && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:bg-red-50"
                onClick={onDeleteOrder}
              >
                <Trash2 size={16} className="mr-1" />
                Delete Order
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.created_at)} by {order.user_email || 'Unknown User'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order items - passing total to fix type error */}
          <OrderItems items={order.items} total={order.total} />
          
          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Payment Information</h3>
              <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
              <p className="text-sm">Method: <span className="font-medium">{order.payment_method || 'Not specified'}</span></p>
              <p className="text-sm">Total: <span className="font-medium">{formatCurrency(order.total)}</span></p>
            </div>
            
            {order.shipping_address && (
              <div className="space-y-2">
                <h3 className="font-medium">Shipping Address</h3>
                <p className="text-sm">{order.shipping_address.name}</p>
                <p className="text-sm">{order.shipping_address.street}</p>
                <p className="text-sm">{`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`}</p>
                <p className="text-sm">{order.shipping_address.country}</p>
              </div>
            )}
          </div>
          
          {/* Status management */}
          <OrderStatusActions 
            orderId={order.id} 
            currentStatus={order.status}
            onStatusUpdate={onStatusUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
