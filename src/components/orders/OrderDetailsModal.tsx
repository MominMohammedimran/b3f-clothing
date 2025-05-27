
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderDetailsModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, open, onOpenChange }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Parse items if they're stored as a JSON string
  const orderItems = typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items || [];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order #{order.order_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p>{formatDate(order.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold">{formatCurrency(order.total)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img className="h-10 w-10 object-cover rounded" src={item.image} alt={item.name} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.size && <div className="text-sm text-gray-500">Size: {item.size}</div>}
                            {item.color && <div className="text-sm text-gray-500">Color: {item.color}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.total - (order.delivery_fee || 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.delivery_fee || 0)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
