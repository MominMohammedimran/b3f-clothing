
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProductActionButtonsProps {
  product: Product;
  selectedSize: string;
  selectedSizes?: string[];
  quantity?: number;
  totalPrice?: number;
}

const ProductActionButtons = ({ 
  product, 
  selectedSize, 
  selectedSizes = [], 
  quantity = 1,
  totalPrice
}: ProductActionButtonsProps) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const effectiveSizes = selectedSizes.length > 0 ? selectedSizes : [selectedSize];
  const finalPrice = totalPrice || (effectiveSizes.length > 1 ? product.price * 2 : product.price);
  
  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please sign in to add to cart');
      navigate('/signin');
      return;
    }
    
    // Validate size selection
    if (!selectedSize && effectiveSizes.length === 0) {
      toast.error('Please select a size before adding to cart');
      return;
    }
    
    if (product) {
      const cartItem = {
        product_id: product.id,
        name: product.name,
        price: finalPrice,
        quantity: quantity,
        size: effectiveSizes.length > 1 ? effectiveSizes.join(', ') : selectedSize,
        image: product.image,
        metadata: {
          view: 'product',
          selectedSizes: effectiveSizes,
          isMultipleSize: effectiveSizes.length > 1
        }
      };
      
      addToCart(cartItem);
      
      toast.success(`${product.name} added to cart`);
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      navigate('/signin');
      return;
    }
    
    // Validate size selection
    if (!selectedSize && effectiveSizes.length === 0) {
      toast.error('Please select a size before placing your order');
      return;
    }
    
    try {
      if (product) {
        const cartItem = {
          product_id: product.id,
          name: product.name,
          price: finalPrice,
          quantity: quantity,
          size: effectiveSizes.length > 1 ? effectiveSizes.join(', ') : selectedSize,
          image: product.image,
          metadata: {
            view: 'product',
            selectedSizes: effectiveSizes,
            isMultipleSize: effectiveSizes.length > 1
          }
        };
        
        await addToCart(cartItem);
        
        toast.success(`${product.name} added to cart`);
        
        // Navigate directly to checkout
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button 
        onClick={handleAddToCart} 
        className="flex-1"
        variant="outline"
      >
        <ShoppingBag size={16} className="mr-2" />
        Add to Cart (₹{finalPrice})
      </Button>
      
      <Button
        onClick={handlePlaceOrder}
        className="flex-1"
      >
        <CheckCircle size={16} className="mr-2" />
        Place Order (₹{finalPrice})
      </Button>
    </div>
  );
};

export default ProductActionButtons;
