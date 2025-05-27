
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface OrderSummaryCardProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ subtotal, deliveryFee, total }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-6">
        <Link to="/orders">
          <Button variant="outline" className="w-full">View All Orders</Button>
        </Link>
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          If you have any questions about your order, please contact our support team.
        </p>
        <Link to="/contact-us">
          <Button variant="secondary" size="sm" className="w-full">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
