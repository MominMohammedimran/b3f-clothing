
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface CartItemListProps {
  cartItems: CartItem[];
}

const CartItemList: React.FC<CartItemListProps> = ({ cartItems }) => {
  const { removeFromCart, updateSizeQuantity, removeSizeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAction = (action: () => void) => {
    if (!currentUser) {
      toast.error('Please sign in to manage your cart');
      navigate('/signin');
      return;
    }
    action();
  };

  const incrementQuantity = (id: string, size: string, currentQuantity: number) => {
    handleAction(() => updateSizeQuantity(id, size, currentQuantity + 1));
  };

  const decrementQuantity = (id: string, size: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      handleAction(() => updateSizeQuantity(id, size, currentQuantity - 1));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    handleAction(() => removeFromCart(id));
  };

  const handleRemoveSize = (id: string, size: string) => {
    handleAction(() => removeSizeFromCart(id, size));
  };

  const handleClearCart = () => {
    handleAction(() => clearCart());
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cart Items ({cartItems.length})</h2>
        <button
          onClick={handleClearCart}
          className="text-red-500 flex items-center hover:text-red-600"
        >
          <Trash2 size={18} className="mr-1" />
          <span className="text-sm font-medium">Clear Cart</span>
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {cartItems.length === 0 ? (
          <p className="py-6 text-center text-gray-500">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="py-6 flex flex-col sm:flex-row">
              <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                <div className="h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 ml-0 sm:ml-6 mt-4 sm:mt-0">
                <div className="flex justify-between">
                  <div>
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-base font-medium hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    {item.color && (
                      <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Display sizes and quantities */}
                <div className="mt-4 space-y-2">
                  {item.sizes.map((sizeItem, index) => (
                    <div key={`${item.id}-${sizeItem.size}-${index}`} className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Size: {sizeItem.size}</span>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => decrementQuantity(item.id, sizeItem.size, sizeItem.quantity)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1">{sizeItem.quantity}</span>
                          <button
                            onClick={() => incrementQuantity(item.id, sizeItem.size, sizeItem.quantity)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveSize(item.id, sizeItem.size)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Remove Size
                        </button>
                      </div>

                      <div className="font-medium">
                        {formatPrice(item.price * sizeItem.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartItemList;
