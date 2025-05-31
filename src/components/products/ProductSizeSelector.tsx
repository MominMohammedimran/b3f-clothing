
import React from 'react';

interface Size {
  name: string;
  quantity: number;
  selected: boolean;
}

interface ProductSizeSelectorProps {
  sizes: Size[];
  onToggleSize: (index: number) => void;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({ sizes, onToggleSize }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size, index) => (
        <button
          key={size.name}
          className={`px-2 py-1 sm:px-6 sm:py-3 md:px-8 md:py-5 border rounded-md ${
            size.selected
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onToggleSize(index)}
        >
          {size.name} ({size.quantity})
        </button>
      ))}
    </div>
  );
};

export default ProductSizeSelector;
