
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Package, Truck, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  user_email?: string;
}

interface MobileOrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onDownloadDesign: (order: Order) => void;
}

const MobileOrderCard: React.FC<MobileOrderCardProps> = ({
  order,
  onViewDetails,
  onDownloadDesign
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasCustomDesign = order.items.some(item => 
    item.metadata?.designData || item.metadata?.previewImage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-sm">#{order.order_number}</h3>
          <p className="text-xs text-gray-600">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
          {order.user_email && (
            <p className="text-xs text-gray-600">{order.user_email}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">{formatPrice(order.total)}</p>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-gray-600">
                {item.sizes ? 
                  item.sizes.map((s: any) => `${s.size}(${s.quantity})`).join(', ') :
                  `Qty: ${item.quantity}`
                }
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-gray-600">
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(order)}
          className="flex-1 text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        {hasCustomDesign && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadDesign(order)}
            className="flex-1 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Design
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileOrderCard;
