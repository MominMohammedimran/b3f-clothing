
import React from 'react';

export interface ProductSelectorProps {
  products: Record<string, any>;
  activeProduct: string;
  isDualSided?: boolean;
  selectedProduct?: string;
  selectedSize?: string;
  onProductSelect: (productId: string) => void;
  onProductChange?: (productId: string) => void;
  onSizeChange?: (size: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  activeProduct,
  isDualSided,
  onProductSelect,
  onProductChange = onProductSelect, // Default to onProductSelect if onProductChange not provided
}) => {
  const handleProductClick = (productId: string) => {
    onProductSelect(productId);
    if (onProductChange) {
      onProductChange(productId);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8 justify-center">
      {Object.entries(products).map(([productId, product]: [string, any]) => (
        <div
          key={productId}
          onClick={() => handleProductClick(productId)}
          className={`cursor-pointer relative p-4 border rounded-lg transition-all ${
            activeProduct === productId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="w-24 h-24 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-2 text-center text-sm font-medium">
            {product.name}
          </div>
          <div className="text-center text-xs text-gray-500">
            ${product.price}
          </div>
          {isDualSided && productId === 'tshirt' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Dual-Side
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductSelector;
