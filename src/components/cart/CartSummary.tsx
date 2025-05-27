
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  onCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  deliveryFee,
  onCheckout
}) => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const total = subtotal + deliveryFee;
  
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error('Please add items to your cart first');
      return;
    }
    
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">{formatCurrency(deliveryFee)}</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleCheckout} 
        className="w-full mt-6"
        disabled={!cartItems || cartItems.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default CartSummary;
