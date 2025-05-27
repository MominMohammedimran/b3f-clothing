
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatIndianRupees } from '@/utils/currency';

interface OrderSummaryProps {
  totalAmount: number;
  deliveryFee: number;
  estimatedDeliveryDate: string;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalAmount,
  deliveryFee,
  estimatedDeliveryDate,
  orderNumber,
  paymentStatus,
  paymentMethod
}) => {
  const formatPaymentMethod = (method: string | undefined): string => {
    if (!method) return 'Online Payment';
    
    switch(method.toLowerCase()) {
      case 'razorpay': return 'Razorpay';
      case 'upi': return 'UPI Payment';
      case 'cod': return 'Cash on Delivery';
      default: return method;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your order details</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">{formatIndianRupees(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery Fee:</span>
          <span className="font-medium">{formatIndianRupees(deliveryFee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated Delivery:</span>
          <span className="font-medium">{estimatedDeliveryDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Order Number:</span>
          <span className="font-medium">{orderNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Payment Status:</span>
          <span className="font-medium">{paymentStatus}</span>
        </div>
        {paymentMethod && (
          <div className="flex items-center justify-between">
            <span>Payment Method:</span>
            <span className="font-medium">{formatPaymentMethod(paymentMethod)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Total:</span>
          <span className="text-xl font-semibold">{formatIndianRupees(totalAmount + deliveryFee)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
