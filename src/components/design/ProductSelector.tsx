
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
    tshirt: { name: 'T-Shirt', price: 249, image: '/lovable-uploads/design-tool-page/tshirt-print.png' },
    mug: { name: 'Mug', price: 199, image: '/lovable-uploads/design-tool-page/mug-print.png' },
    cap: { name: 'Cap', price: 179, image: '/lovable-uploads/design-tool-page/cap-print.png' },
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

  // If using the new inventory-based approach
  const renderSizeOptions = () => {
    if (!inventory || !selectedProduct) return null;
    
    const sizes = inventory[selectedProduct] || {};
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Select Size:</h3>
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
      <h2 className="text-lg font-semibold mb-3">Select Product</h2>
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(products).map(([id, product]) => (
              <button
                key={id}
                onClick={() => handleProductSelection(id)}
                className={`flex flex-col items-center p-3 rounded-md border ${
                  (selectedProduct || activeProduct) === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="w-14 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-contain" />
                </div>
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-green-600">
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
