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
  onDecrement,
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
    <div className="flex items-center border rounded-md overflow-hidden w-fit">
      <button
        onClick={handleDecrement}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
        disabled={quantity <= 1}
      >
        –
      </button>
      <span className="px-4 py-1 text-sm font-semibold text-center min-w-[40px]">
        {quantity}
      </span>
      <button
        onClick={handleIncrement}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
        disabled={quantity >= maxQuantity}
      >
        +
      </button>
    </div>
  );
};

export default ProductQuantitySelector;
