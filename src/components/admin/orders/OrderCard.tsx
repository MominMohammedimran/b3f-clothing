
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Download, Eye } from 'lucide-react';
import { Order } from '@/lib/types';
import OrderDesignDownload from './OrderDesignDownload';
import OrderDesignPreview from './OrderDesignPreview';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDesigns, setShowDesigns] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasDesignItems = order.items?.some((item: any) => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage ||
    (item.image && item.image.startsWith('data:'))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(order.date || order.created_at).toLocaleDateString()} • 
              {order.user_email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <span className="font-semibold">₹{order.total}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Order Items Summary */}
          <div>
            <p className="text-sm text-gray-600">
              {Array.isArray(order.items) ? order.items.length : 0} item(s)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {isExpanded ? 'Less Details' : 'View Details'}
            </Button>
            
            {hasDesignItems && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDesigns(!showDesigns)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {showDesigns ? 'Hide Designs' : 'View Designs'}
              </Button>
            )}
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="border-t pt-4 space-y-4">
              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} • Size: {item.size || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div>
                  <h4 className="font-medium mb-2">Shipping Address:</h4>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.street}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipcode}</p>
                    {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Design Previews */}
          {showDesigns && hasDesignItems && (
            <div className="border-t pt-4">
              <OrderDesignPreview items={order.items || []} orderNumber={order.order_number} />
            </div>
          )}

          {/* Design Download */}
          {hasDesignItems && (
            <OrderDesignDownload items={order.items || []} orderNumber={order.order_number} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;