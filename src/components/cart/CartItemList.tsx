
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProductPlaceOrder from '@/components/products/ProductPlaceOrder';
import CartItemSizeSelector from './CartItemSizeSelector';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  selectedSizes?: string[];
}

interface CartItemListProps {
  cartItems: CartItem[];
}

const CartItemList: React.FC<CartItemListProps> = ({ cartItems }) => {
  const { removeFromCart, updateQuantity, clearCart, addToCart } = useCart();
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
  
  const incrementQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      handleAction(() => updateQuantity(productId, item.quantity + 1));
    }
  };
  
  const decrementQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      handleAction(() => updateQuantity(productId, item.quantity - 1));
    }
  };
  
  const handleRemoveFromCart = (productId: string) => {
    handleAction(() => removeFromCart(productId));
  };
  
  const handleClearCart = () => {
    handleAction(() => clearCart());
  };
  
  const handleSizeChange = (productId: string, size: string) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      // Remove the old item
      handleAction(() => {
        removeFromCart(productId);
        
        // Add it back with the new size
        setTimeout(() => {
          addToCart({
            ...item,
            size: size,
          }, item.quantity);
        }, 100);
      });
    }
  };
  
  const handleMultipleSizesChange = (productId: string, sizes: string[]) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      // Update the item with the new selected sizes
      handleAction(() => {
        removeFromCart(productId);
        
        // Add it back with the new sizes
        setTimeout(() => {
          addToCart({
            ...item,
            selectedSizes: sizes,
          }, item.quantity);
        }, 100);
      });
    }
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
            <div key={item.productId} className="py-6 flex flex-col sm:flex-row">
              <Link to={`/product/${item.productId}`} className="flex-shrink-0">
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
                    <Link to={`/product/${item.productId}`} className="text-base font-medium hover:text-blue-600">
                      {item.name}
                    </Link>
                    {item.color && (
                      <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>
                    )}
                    
                    {/* Enhanced Size selector with multi-select */}
                    <div className="mt-2 max-w-[180px]">
                      <CartItemSizeSelector 
                        currentSize={item.size} 
                        selectedSizes={item.selectedSizes}
                        availableSizes={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                        onSelectSize={(size) => handleSizeChange(item.productId, size)}
                        onSelectMultipleSizes={(sizes) => handleMultipleSizesChange(item.productId, sizes)}
                        allowMultiple={true}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => decrementQuantity(item.productId)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button 
                      onClick={() => incrementQuantity(item.productId)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <ProductPlaceOrder
                    product={{
                      id: item.productId,
                      productId: item.productId, // Add productId for compatibility
                      code: item.productId,
                      name: item.name,
                      price: item.price,
                      original_price: item.price,
                      image: item.image || '',
                      description: '',
                      discount_percentage: 0,
                      rating: 0,
                      category: '',
                      tags: []
                    }}
                    size={item.size}
                    selectedSizes={item.selectedSizes}
                    size_btn="sm"
                    variant="outline"
                    className="text-sm"
                  />
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
