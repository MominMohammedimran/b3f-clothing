
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/lib/types';
import ProductSizeSelector from '../ProductSizeSelector';
import ProductQuantitySelector from '../ProductQuantitySelector';
import ProductDetailsHeader from '../ProductDetailsHeader';
import ProductImageGallery from '../ProductImageGallery';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import ProductPlaceOrder from '@/components/products/ProductPlaceOrder';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState<any[]>([
    { name: 'S', quantity: 10, selected: false },
    { name: 'M', quantity: 15, selected: false },
    { name: 'L', quantity: 8, selected: false },
    { name: 'XL', quantity: 5, selected: false },
    { name: 'XXL', quantity: 3, selected: false }
  ]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  
  // Set up product images (main + placeholder variations)
  const productImages = [
    product.image || ''
  ].concat(product.images || []);

  const toggleSizeSelection = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes[index].selected = !updatedSizes[index].selected;
    setSizes(updatedSizes);
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = async () => {
    const selectedSizes = sizes.filter(size => size.selected).map(size => size.name);
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    try {
      setLoading(true);
      
      await addToCart({
        ...product,
        selectedSizes: selectedSizes
      }, quantity);
      
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCustomizeClick = () => {
    navigate(`/design-tool`);
  };

  const isCustomizableProduct = product.tags?.includes('customizable');
  const selectedSize = sizes.find(s => s.selected)?.name || '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div className="md:col-span-1">
        <ProductImageGallery images={productImages} productName={product.name} />
      </div>

      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ProductDetailsHeader product={product} />
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</h3>
            <ProductSizeSelector sizes={sizes} onToggleSize={toggleSizeSelection} />
          </div>

          <div className="flex items-center mb-6">
            <ProductQuantitySelector 
              quantity={quantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleAddToCart} 
              variant="outline" 
              className="flex-1"
              disabled={loading}
            >
              <ShoppingBag size={16} className="mr-2" />
              Add to Cart
            </Button>
            
            <ProductPlaceOrder
              product={{...product}}
              selectedSizes={sizes.filter(s => s.selected).map(s => s.name)}
              className="flex-1"
            />
          </div>

          {isCustomizableProduct && (
            <button
              onClick={handleCustomizeClick}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
