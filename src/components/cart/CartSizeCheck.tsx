
import React from 'react';
import { toast } from "sonner";

interface CartItemWithSize {
  size?: string;
  productId: string;
  name: string;
  selectedSizes?: string[];
}

interface CartSizeCheckProps {
  cartItems: CartItemWithSize[];
  children: React.ReactNode;
  onProceed: () => void;
}

export const CartSizeCheck: React.FC<CartSizeCheckProps> = ({ 
  cartItems, 
  children,
  onProceed 
}) => {
  const handleProceedClick = () => {
    // Check if any items are missing sizes
    const missingSize = cartItems.some(item => !item.size && (!item.selectedSizes || item.selectedSizes.length === 0));
    
    if (missingSize) {
      toast.error("Please select size for all items before proceeding to checkout.");
      // Don't proceed if sizes are missing
      return;
    }
    
    onProceed();
  };
  
  return (
    <div>
      {children}
      <div className="mt-4">
        <button
          onClick={handleProceedClick}
          className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSizeCheck;
