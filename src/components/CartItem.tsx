
import { useState } from 'react';
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
  quantity: number;
  options?: Record<string, string>;
}

const CartItem = ({ id, image, name, price, quantity, options }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [itemQuantity, setItemQuantity] = useState(quantity);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setItemQuantity(value);
      updateQuantity(id, value);
    }
  };

  const incrementQuantity = () => {
    const newQuantity = itemQuantity + 1;
    setItemQuantity(newQuantity);
    updateQuantity(id, newQuantity);
  };

  const decrementQuantity = () => {
    if (itemQuantity > 1) {
      const newQuantity = itemQuantity - 1;
      setItemQuantity(newQuantity);
      updateQuantity(id, newQuantity);
    }
  };

  return (
    
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b">
      {/* Product Image */}
      <Link to={`/product/details${id}`} className="w-full sm:w-24 h-24 overflow-hidden rounded-md bg-gray-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-center"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <Link to={`/product/details/${id}`} className="text-lg font-medium text-gray-900 hover:text-brand-navy">
              {name}
            </Link>
            
            {/* Display selected options */}
            {options && Object.keys(options).length > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                {Object.entries(options).map(([key, value]) => (
                  <span key={key} className="mr-4">
                    {key}: <span className="font-medium">{value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="font-medium text-gray-900">
            ${price.toFixed(2)}
          </p>
        </div>

        {/* Mobile: Full Width Controls */}
        <div className="flex justify-between items-center mt-4 sm:hidden">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              className="h-8 w-8 rounded-r-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={itemQuantity}
              onChange={handleQuantityChange}
              min={1}
              className="h-8 w-16 rounded-none text-center border-x-0"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              className="h-8 w-8 rounded-l-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => removeFromCart(id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>

        {/* Desktop: inline controls */}
        <div className="hidden sm:flex justify-between items-center mt-2">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              className="h-8 w-8 rounded-r-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={itemQuantity}
              onChange={handleQuantityChange}
              min={1}
              className="h-8 w-16 rounded-none text-center border-x-0"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              className="h-8 w-8 rounded-l-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => removeFromCart(id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
