import React from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
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

    if (!selectedSize) {
      toast.error('Please select a size before adding to cart');
      return;
    }

    await addToCart({
      product_id: product.productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      image: product.image,
    });

    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-2 text-sm text-gray-600">Code :{product.category}</p>
      </div>

      {/* Price */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
        {product.discountPercentage && product.discountPercentage > 0 && (
          <>
            <span className="text-gray-500 line-through text-lg">
              {formatPrice(product.originalPrice || 0)}
            </span>
            <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-1 rounded">
              -{product.discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div >
          <h3 className="text-md font-semibold mb-2 text-gray-800">Select Size</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md transition-all duration-150 text-sm font-medium
                  ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-blue-50 border-gray-300'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={handleAddToCart} variant="outline" className="flex-1">
          <ShoppingBag size={16} className="mr-2" />
          Add to Cart
        </Button>

        <ProductPlaceOrder product={product} size={selectedSize} className="flex-1" />
      </div>
    </div>
  );
};

export default ProductDetails;
