import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';
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
  quantities,
}: ProductActionButtonsProps) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [placing, setPlacing] = useState(false);

  const sizesArray: SizeQuantity[] = selectedSizes.map((size) => ({
    size,
    quantity: quantities[size] || 1,
  }));

  const totalPrice = sizesArray.reduce(
    (sum, item) => sum + product.price * item.quantity,
    0
  );

  const cartItem = {
    product_id: product.id,
    name: product.name,
    price: product.price,
    sizes: sizesArray,
    image: product.image,
    metadata: {
      view: 'product',
      isMultipleSize: true,
    },
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Please sign in', {
        description: 'Login required to add to cart',
      });
      navigate('/signin');
      return;
    }

    try {
      setAdding(true);
      await addToCart(cartItem);
      toast.success('Added to cart', {
        description: `${product.name} for ${sizesArray.length} size(s)`,
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in', {
        description: 'Login required to place order',
      });
      navigate('/signin');
      return;
    }

    try {
      setPlacing(true);
      await addToCart(cartItem);
      navigate('/checkout');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button
        onClick={handleAddToCart}
        className="flex-1"
        variant="outline"
        disabled={selectedSizes.length === 0 || adding}
      >
        {adding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <ShoppingBag size={16} className="mr-2" />
            Add to Cart {totalPrice > 0 && ` (₹${totalPrice})`}
          </>
        )}
      </Button>

      <Button
        onClick={handlePlaceOrder}
        className="flex-1"
        disabled={selectedSizes.length === 0 || placing}
      >
        {placing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <CheckCircle size={16} className="mr-2" />
            Place Order {totalPrice > 0 && ` (₹${totalPrice})`}
          </>
        )}
      </Button>
    </div>
  );
};

export default ProductActionButtons;
