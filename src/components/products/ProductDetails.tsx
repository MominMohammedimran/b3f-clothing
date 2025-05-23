
import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import ProductPlaceOrder from '@/components/products/ProductPlaceOrder';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProductDetailsProps {
  product: Product;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
}

const ProductDetails = ({ product, selectedSize, setSelectedSize }: ProductDetailsProps) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleAddToCart = async () => {
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
      await addToCart({
        ...product,
        size: selectedSize || undefined
      }, 1);
      
      toast.success(`${product.name} added to cart`);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">{product?.name}</h1>
      </div>
      
      <div className="mt-2">
        <span className="text-2xl font-bold text-blue-600">{formatCurrency(product?.price || 0)}</span>
        {product?.discountPercentage > 0 && (
          <span className="ml-2 text-gray-500 line-through">{formatCurrency(product?.originalPrice || 0)}</span>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-700">{product?.description}</p>
      </div>
      
      {product?.sizes && product.sizes.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md ${
                  selectedSize === size ? 'bg-blue-600 text-white' : 'bg-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <div className="flex gap-3">
          <Button 
            onClick={handleAddToCart} 
            variant="outline" 
            className="flex-1"
          >
            <ShoppingBag size={16} className="mr-2" />
            Add to Cart
          </Button>
          
          <ProductPlaceOrder
            product={product}
            size={selectedSize}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
