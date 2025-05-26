
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
}

const ProductActionButtons = ({ product, selectedSize }: ProductActionButtonsProps) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please sign in to add to cart');
      navigate('/signin');
      return;
    }
    
    // Validate size selection
    if (!selectedSize) {
      toast.error('Please select a size before adding to cart');
      return;
    }
    
    if (product) {
      addToCart({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: selectedSize,
        image: product.image
      });
      
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
    if (!selectedSize) {
      toast.error('Please select a size before placing your order');
      return;
    }
    
    try {
      if (product) {
        await addToCart({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: selectedSize,
          image: product.image
        });
        
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
        Add to Cart
      </Button>
      
      <Button
        onClick={handlePlaceOrder}
        className="flex-1"
      >
        <CheckCircle size={16} className="mr-2" />
        Place Order
      </Button>
    </div>
  );
};

export default ProductActionButtons;
