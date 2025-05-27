
import React from 'react';

interface ProductQuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({ quantity, onIncrement, onDecrement }) => {
  return (
    <div className="flex items-center mr-4">
      <button
        onClick={onDecrement}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-l-md py-2 px-4"
      >
        -
      </button>
      <span className="text-center w-12">{quantity}</span>
      <button
        onClick={onIncrement}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-r-md py-2 px-4"
      >
        +
      </button>
    </div>
  );
};

export default ProductQuantitySelector;
