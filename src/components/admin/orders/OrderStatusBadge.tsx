
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
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
  
  return <Badge className={getStatusColor(status)}>{status}</Badge>;
};

export default OrderStatusBadge;
