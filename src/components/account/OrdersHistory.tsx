
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/types';

interface OrdersHistoryProps {
  orders: Order[];
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ orders }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{order.orderNumber || order.order_number}</CardTitle>
              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Date: {new Date(order.createdAt || order.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Total: {formatCurrency(order.total)}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Items:</p>
                {order.items.map((item, index) => {
                  const totalItemQuantity = item.sizes.reduce((sum, size) => sum + size.quantity, 0);
                  return (
                    <div key={index} className="text-sm text-gray-600 ml-2">
                      {item.name} - Qty: {totalItemQuantity}
                      {item.sizes.length > 0 && (
                        <span className="ml-2">
                          ({item.sizes.map(s => `${s.size}: ${s.quantity}`).join(', ')})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersHistory;
