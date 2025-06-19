import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import { useCart } from '@/context/CartContext';

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

export interface ProductDetailsProps {
  product: Product;
  allowMultipleSizes?: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, allowMultipleSizes = true }) => {
  const [selectedSizes, setSelectedSizes] = useState<SizeWithQuantity[]>([]);
  const { cartItems, removeSizeFromCart } = useCart();

  useEffect(() => {
    const cartItem = cartItems.find(item => item.product_id === product.id);
    if (cartItem) {
      setSelectedSizes(cartItem.sizes.map(s => ({ size: s.size, quantity: s.quantity })));
    }
  }, [cartItems, product.id]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      const exists = prev.find(s => s.size === size);
      if (exists) {
        return prev.filter(s => s.size !== size);
      } else {
        return [...prev, { size, quantity: 1 }];
      }
    });
  };

  const handleDoubleRemove = async (size: string) => {
    const cartItem = cartItems.find(item => item.product_id === product.id);
    if (cartItem) {
      await removeSizeFromCart(cartItem.id, size);
    }
    handleSizeToggle(size);
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setSelectedSizes(prev =>
      prev.map(s => (s.size === size ? { ...s, quantity } : s))
    );
  };

  let productVariants = product.variants;
  if (typeof productVariants === 'string') {
    try {
      productVariants = JSON.parse(productVariants);
    } catch {
      productVariants = [];
    }
  }

  const availableSizes = Array.isArray(productVariants)
    ? productVariants.map(v => v.size)
    : [];

  const totalQuantity = selectedSizes.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedSizes.reduce((sum, item) => sum + item.quantity * product.price, 0);

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
      {/* Product Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
        <span className="text-2xl font-bold text-blue-600">₹{totalPrice || product.price}</span>
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-gray-700">{product.description}</p>
      )}

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Sizes</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map(size => {
            const selected = selectedSizes.some(s => s.size === size);
            const cartItem = cartItems.find(item => item.product_id === product.id);
            const inCart = cartItem?.sizes.some(s => s.size === size);

            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                onDoubleClick={() => handleDoubleRemove(size)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium
                  ${selected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'border-gray-300'}
                  ${inCart ? 'ring-2 ring-green-400' : ''}`}
              >
                {size}
                {inCart && (
                  <div className="text-xs text-green-700">In Cart</div>
                )}
              </button>
            );
          })}
        </div>
         </div>

      {/* Quantity Controls */}
      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Quantities</h3>
          <div className="flex gap-3 overflow-x-auto">
            {selectedSizes.map(sizeItem => {
              const variant = productVariants?.find(v => v.size === sizeItem.size);
              const maxStock = variant ? parseInt(variant.stock.toString()) : 10;
              const cartItem = cartItems.find(item => item.product_id === product.id);
              const cartSize = cartItem?.sizes.find(s => s.size === sizeItem.size);
              const inCartQty = cartSize?.quantity;

              return (
                <div
  key={sizeItem.size}
  className={`flex flex-col border rounded-lg p-3 min-w-[140px] bg-gray-50 ${
    inCartQty ? 'border-green-400 bg-green-50' : ''
  }`}
>
  {/* Size + Actions */}
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-semibold">{sizeItem.size}</span>

    <div className="flex items-center space-x-1">
      {inCartQty > 0 && (
        <button
          onClick={() => removeSizeFromCart(cartItem?.id, sizeItem.size)}
          className="text-red-600 hover:text-green-800"
          title="Remove from cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-x" viewBox="0 0 16 16">
  <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793z"/>
  <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>
        </button>
      )}
      <button
        className="text-red-500"
        onClick={() => handleSizeToggle(sizeItem.size)}
        title="Remove selection"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  </div>

  {/* In Cart Quantity Info */}
  {inCartQty > 0 && (
    <div className="text-xs text-green-700 mb-1">In Cart: {inCartQty}</div>
  )}

  {/* Quantity Selector */}
  <ProductQuantitySelector
    quantity={sizeItem.quantity}
    maxQuantity={maxStock}
    onChange={(qty) => handleQuantityChange(sizeItem.size, qty)}
  />

  {/* Price */}
  <div className="mt-2 text-sm font-semibold text-gray-800">
    ₹{(product.price * sizeItem.quantity).toFixed(2)}
  </div>
</div>

              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <ProductActionButtons
        product={product}
        selectedSizes={selectedSizes.map(s => s.size)}
        quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
      />
    </div>
  );
};

export default ProductDetails;
