
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface ProductPlaceOrderProps {
  product: Product;
  size?: string;
  selectedSizes?: string[];
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  size_btn?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ProductPlaceOrder: React.FC<ProductPlaceOrderProps> = ({
  product,
  size: selectedSize,
  selectedSizes = [],
  variant = "default",
  size_btn = "default",
  className = "",
}) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      navigate('/signin');
      return;
    }
    
    // Check if size is selected
    if (!selectedSize && (!selectedSizes || selectedSizes.length === 0)) {
      toast.error('Please select a size before placing your order');
      return;
    }
    
    try {
      // Make sure we have a valid product ID
      const productId = product.id;
      
      if (!productId) {
        console.error('Product ID is missing:', product);
        toast.error('Unable to place order: Product information is incomplete');
        return;
      }
      
      console.log('Adding to cart before checkout:', product);
      
      // Create a valid product object by ensuring all required fields exist
      const validProduct: Product = {
        id: productId,
        name: product.name || 'Product',
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        discountPercentage: product.discountPercentage || 0,
        image: product.image || '',
        description: product.description || '',
        rating: product.rating || 0,
        category: product.category || '',
        tags: product.tags || [],
        code: product.code || productId,
        stock: product.stock || 10,
      };
      
      // If we have multiple sizes selected, use those
      if (selectedSizes && selectedSizes.length > 0) {
        await addToCart({
          ...validProduct,
          selectedSizes: selectedSizes,
        }, 1);
      } else {
        // Otherwise use the single size
        await addToCart({
          ...validProduct,
          size: selectedSize,
        }, 1);
      }
      
      toast.success(`${product.name} added to cart`);
      
      // Redirect straight to checkout instead of cart
      navigate('/checkout');
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order');
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size_btn}
      onClick={handlePlaceOrder}
      className={`${className} flex items-center justify-center`}
      type="button"
    >
      <CheckCircle className="h-4 w-4 mr-2" />
      <span>Place Order</span>
    </Button>
  );
};

export default ProductPlaceOrder;
