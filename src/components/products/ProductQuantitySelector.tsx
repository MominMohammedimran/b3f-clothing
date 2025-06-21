import React from 'react';

interface ProductQuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (quantity: number) => void;
}

const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({
  quantity,
  maxQuantity = 10,
  onChange,
}) => {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <button
        onClick={handleDecrement}
        className={`px-2 py-1 bg-gray-200 text-lg font-bold text-gray-700 rounded-l-md hover:bg-gray-300 disabled:opacity-50`}
        disabled={quantity <= 1}
        title="Decrease quantity"
      >
        –
      </button>
      <span className="px-4 py-1 bg-white border-t border-b border-gray-300 text-sm font-medium text-gray-800 min-w-[40px] text-center">
        {quantity}
      </span>
      <button
        onClick={handleIncrement}
        className={`px-2 py-1 bg-gray-200 text-lg font-bold text-gray-700 rounded-r-md hover:bg-gray-300 disabled:opacity-50`}
        disabled={quantity >= maxQuantity}
        title="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default ProductQuantitySelector;
