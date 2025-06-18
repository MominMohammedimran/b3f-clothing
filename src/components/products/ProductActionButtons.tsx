
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart, SizeQuantity } from '@/context/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProductActionButtonsProps {
  product: Product;
  selectedSizes: string[];
  quantities: Record<string, number>;
}

const ProductActionButtons = ({ 
  product, 
  selectedSizes, 
  quantities
}: ProductActionButtonsProps) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const sizesArray: SizeQuantity[] = selectedSizes.map(size => ({
    size,
    quantity: quantities[size] || 1
  }));

  const totalQuantity = sizesArray.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = sizesArray.reduce((sum, item) => sum + (product.price * item.quantity), 0);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please sign in to add to cart');
      navigate('/signin');
      return;
    }
    
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      sizes: sizesArray,
      image: product.image,
      metadata: {
        view: 'product',
        isMultipleSize: true
      }
    };

    addToCart(cartItem);
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      navigate('/signin');
      return;
    }
    
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    try {
      const cartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        sizes: sizesArray,
        image: product.image,
        metadata: {
          view: 'product',
          isMultipleSize: true
        }
      };

      await addToCart(cartItem);
      navigate('/checkout');
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
        disabled={selectedSizes.length === 0}
      >
        <ShoppingBag size={16} className="mr-2" />
        Add to Cart {totalPrice > 0 && `(₹${totalPrice})`}
      </Button>
      
      <Button
        onClick={handlePlaceOrder}
        className="flex-1"
        disabled={selectedSizes.length === 0}
      >
        <CheckCircle size={16} className="mr-2" />
        Place Order {totalPrice > 0 && `(₹${totalPrice})`}
      </Button>
    </div>
  );
};

export default ProductActionButtons;
