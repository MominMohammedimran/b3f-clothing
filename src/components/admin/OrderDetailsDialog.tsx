
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusActions from './orders/OrderStatusActions';
import OrderDesignDownload from './orders/OrderDesignDownload';
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
  cancellation_reason?: string;
}

interface OrderDetailsDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, status: string, reason?: string) => void;
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
          {/* Order items */}
          <div className="space-y-4">
            <h3 className="font-medium">Order Items</h3>
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                    {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>

          <OrderDesignDownload 
            items={order.items} 
            orderNumber={order.order_number} 
          />
          
          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Payment Information</h3>
              <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
              <p className="text-sm">Method: <span className="font-medium">{order.payment_method || 'Not specified'}</span></p>
              <p className="text-sm">Total: <span className="font-medium">{formatCurrency(order.total)}</span></p>
              {order.status === 'cancelled' && order.cancellation_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {order.shipping_address && (
                <>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm">{order.shipping_address.name}</p>
                  <p className="text-sm">{order.shipping_address.street}</p>
                  <p className="text-sm">{`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`}</p>
                  <p className="text-sm">{order.shipping_address.country}</p>
                </>
              )}
            </div>
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
