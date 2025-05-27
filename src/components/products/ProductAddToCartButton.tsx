
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ProductAddToCartButtonProps {
  product: Product;
  onAddToCart: () => void;
  isLoading?: boolean;
}

const ProductAddToCartButton: React.FC<ProductAddToCartButtonProps> = ({ 
  product, 
  onAddToCart,
  isLoading = false
}) => {
  // Prevent event propagation to avoid triggering other click events
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart();
  };

  return (
    <Button
      onClick={handleClick}
      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white flex-grow"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      ) : (
        <span className="flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </span>
      )}
    </Button>
  );
};

export default ProductAddToCartButton;
