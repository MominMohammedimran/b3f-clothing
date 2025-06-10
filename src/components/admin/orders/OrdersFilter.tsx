
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrdersFilterProps {
  showOnlySuccessful: boolean;
  onToggleFilter: (show: boolean) => void;
}

const OrdersFilter: React.FC<OrdersFilterProps> = ({ showOnlySuccessful, onToggleFilter }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-medium">Filter orders:</span>
      <Button 
        variant={showOnlySuccessful ? "default" : "outline"}
        size="sm"
        onClick={() => onToggleFilter(!showOnlySuccessful)}
      >
        {showOnlySuccessful ? "Show All Orders" : "Show Successful Only"}
      </Button>
    </div>
  );
};

export default OrdersFilter;