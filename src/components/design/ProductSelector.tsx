import React from 'react';
import { formatIndianRupees } from '@/utils/currency';

interface Product {
  name: string;
  price: number;
  image: string;
}

export interface ProductSelectorProps {
  products?: Record<string, Product>;
  activeProduct?: string;
  isDualSided?: boolean;
  onProductSelect?: (productId: string) => void;
  // Add new props to match what ProductDesigner is passing
  onProductChange?: (productType: string) => void;
  onSizeChange?: (size: string) => void;
  selectedProduct?: string;
  selectedSize?: string;
  inventory?: Record<string, Record<string, number>>;
  isLoading?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products = {
    tshirt: { name: 'T-Shirt', price: 249, image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/tshirt-print/tshirt-print.webp' },
    mug: { name: 'Mug', price: 199, image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/mug-print/mug-print.webp' },
    cap: { name: 'Cap', price: 179, image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/cap-print/cap-print.webp' },
    photo_frame: { name: 'Photo Frame', price: 299, image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300' },
  },
  activeProduct = 'tshirt',
  isDualSided = false,
  onProductSelect = () => {},
  // Handle new props with defaults
  onProductChange,
  onSizeChange,
  selectedProduct,
  selectedSize,
  inventory,
  isLoading = false
}) => {
  // Use either the old or new style prop based on what's provided
  const handleProductSelection = (id: string) => {
    if (onProductChange) {
      onProductChange(id);
    } else {
      onProductSelect(id);
    }
  };
console.log(products)
  // If using the new inventory-based approach
  const renderSizeOptions = () => {
    if (!inventory || !selectedProduct) return null;

    const sizes = inventory[selectedProduct] || {};
    
    return (
      <div className="mt-4">
        <h3 className="text-s text-center font-medium mb-2">Select Size:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(sizes).map(([size, quantity]) => (
            <button
              key={size}
              onClick={() => onSizeChange && onSizeChange(size)}
              disabled={quantity <= 0}
              className={`px-3 py-1 text-sm border rounded-md ${
                selectedSize === size 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : quantity <= 0 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size} {quantity <= 0 ? '(Out of stock)' : `(${quantity})`}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 pt-0 mb-2">
      <h2 className="text-lg text-center font-semibold mb-3">Select Product</h2>
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(products).map(([id, product]) => (
              <button
                key={id}
                onClick={() => handleProductSelection(id)}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-md border transition ${
                  (selectedProduct || activeProduct) === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="w-12 h-10 sm:w-14 sm:h-12 bg-gray-100 rounded-md flex items-center justify-center mb-1 sm:mb-2">
                  <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-center leading-snug w-24 sm:w-28 break-words">
                  {product.name}
                </span>
                <span className="text-[14px] sm:text-s text-green-800">
                  {formatIndianRupees(isDualSided && id === 'tshirt' ? 300 : product.price)}
                </span>
              </button>
            ))}
          </div>
          
          {/* Render size options if using the inventory-based approach */}
          {inventory && renderSizeOptions()}
        </>
      )}
    </div>
  );
};

export default ProductSelector;