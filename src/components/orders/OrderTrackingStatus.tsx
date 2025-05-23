
import React from 'react';
import { Truck, Package, CheckCircle } from 'lucide-react';

export interface OrderTrackingStatusProps {
  currentStatus: string;
  estimatedDelivery: string;
}

const statusSteps = [
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusMap: Record<string, string> = {
  processing: 'processing',
  prepared: 'processing',
  order_placed: 'processing',
  pending: 'processing',
  shipped: 'shipped',
  shipping: 'shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  complete: 'delivered',
};

const OrderTrackingStatus: React.FC<OrderTrackingStatusProps> = ({
  currentStatus,
  estimatedDelivery,
}) => {
  // Normalize status - default to processing if invalid status provided
  const normalizedStatus = currentStatus && typeof currentStatus === 'string'
    ? (statusMap[currentStatus.toLowerCase()] || 'processing')
    : 'processing';
  
  console.log('Order tracking status:', currentStatus, 'Normalized:', normalizedStatus);
  
  // Find the index of the current status in our steps
  const currentStatusIndex = statusSteps.findIndex(step => step.key === normalizedStatus);
  
  // Calculate progress percentage (handle -1 case if status not found)
  const percentComplete = currentStatusIndex >= 0 
    ? ((currentStatusIndex + 1) / statusSteps.length) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Delivery Status</h2>
        <div className="text-blue-600 text-right">
          <p className="font-medium">Estimated Delivery</p>
          <p>{estimatedDelivery || 'To be confirmed'}</p>
        </div>
      </div>

      <div className="relative px-2 sm:px-4 mt-6">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-300 rounded z-0" />
        <div
          className="absolute top-5 left-0 h-1 bg-blue-600 rounded z-10 transition-all duration-500 ease-in-out"
          style={{ width: `${percentComplete}%` }}
        />

        <div className="relative flex justify-between z-20">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStatusIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'} transition-colors duration-300`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'} transition-colors duration-300`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-700">
        {currentStatusIndex === 0 &&
          'Your order is being processed and prepared for shipping.'}
        {currentStatusIndex === 1 &&
          'Your order has been shipped and is on its way to you.'}
        {currentStatusIndex === 2 &&
          'Your order is out for delivery and will reach you soon.'}
        {currentStatusIndex === 3 &&
          'Your order has been delivered. Enjoy your purchase!'}
      </div>

      <div className="mt-4 text-sm font-medium text-blue-700 text-center">
        Current Status: {currentStatusIndex >= 0 ? statusSteps[currentStatusIndex]?.label : 'Processing'}
      </div>
    </div>
  );
};

export default OrderTrackingStatus;
