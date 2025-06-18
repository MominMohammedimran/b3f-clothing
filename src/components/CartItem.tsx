import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

interface CartItemProps {
  id: string;
  image: string;
  name: string;
  price: number;
  sizes: { size: string; quantity: number }[];
  options?: Record<string, string>;
}

const CartItem = ({ id, image, name, price, sizes, options }: CartItemProps) => {
  const { updateSizeQuantity, removeFromCart, removeSizeFromCart } = useCart();

  const handleQuantityChange = (size: string, value: number) => {
    if (value > 0) updateSizeQuantity(id, size, value);
  };

  const increment = (size: string, currentQty: number) => {
    updateSizeQuantity(id, size, currentQty + 1);
  };

  const decrement = (size: string, currentQty: number) => {
    if (currentQty > 1) updateSizeQuantity(id, size, currentQty - 1);
  };

  const totalQuantity = sizes.reduce((sum, s) => sum + s.quantity, 0);
  const totalPrice = totalQuantity * price;

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b">
      {/* Product Image */}
      <Link to={`/product/details/${id}`} className="w-full sm:w-24 h-24 overflow-hidden rounded-md bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center"
        />
      </Link>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/product/details/${id}`} className="text-lg font-semibold text-gray-900 hover:text-primary">
              {name}
            </Link>

            {options && Object.keys(options).length > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                {Object.entries(options).map(([key, value]) => (
                  <span key={key} className="mr-4">{key}: <span className="font-medium">{value}</span></span>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800">₹{totalPrice}</p>
        </div>

        {/* Sizes and Quantities */}
        <div className="mt-4 space-y-3">
          {sizes.map((s, index) => (
            <div key={`${s.size}-${index}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Size: {s.size}</span>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrement(s.size, s.quantity)}
                    className="h-8 w-8 rounded-r-none"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={s.quantity}
                    onChange={(e) => handleQuantityChange(s.size, parseInt(e.target.value))}
                    className="h-8 w-16 rounded-none text-center border-x-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => increment(s.size, s.quantity)}
                    className="h-8 w-8 rounded-l-none"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeSizeFromCart(id, s.size)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Size
              </Button>
            </div>
          ))}
        </div>

        {/* Remove Entire Item */}
        <div className="mt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeFromCart(id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
