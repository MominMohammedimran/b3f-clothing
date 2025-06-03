
import React from 'react';

interface ProductQuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (quantity: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({ 
  quantity, 
  maxQuantity = 10,
  onChange,
  onIncrement, 
  onDecrement 
}) => {
  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
    } else if (quantity < maxQuantity) {
      onChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (onDecrement) {
      onDecrement();
    } else if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  return (
  <div className="flex justify-items-center ">
      <button
        onClick={handleDecrement}
        className="bg-gray-100 text-xl hover:bg-gray-200 text-gray-600 rounded-l-md  px-2"
        disabled={quantity <= 1}
      >
        -
      </button>
      <span className="text-center w-12">{quantity}</span>
      <button
        onClick={handleIncrement}
        className="bg-gray-100 text-xl hover:bg-gray-200 text-gray-600 rounded-r-md  px-2"
        disabled={quantity >= maxQuantity}
      >
        +
      </button>
    </div>
  );
};

export default ProductQuantitySelector;
