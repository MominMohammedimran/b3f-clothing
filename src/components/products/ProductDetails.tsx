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

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  allowMultipleSizes = true,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<SizeWithQuantity[]>([]);
  const { cartItems, removeSizeFromCart } = useCart();

  // Parse variants from string
  let productVariants: { size: string; stock: string }[] = [];
  if (typeof product.variants === 'string') {
    try {
      productVariants = JSON.parse(product.variants);
    } catch {
      productVariants = [];
    }
  } else if (Array.isArray(product.variants)) {
    productVariants = product.variants as any[];
  }

  const availableSizes = productVariants.map((v) => v.size);

  useEffect(() => {
    const cartItem = cartItems.find((item) => item.product_id === product.id);
    if (cartItem) {
      setSelectedSizes(
        cartItem.sizes.map((s) => ({ size: s.size, quantity: s.quantity }))
      );
    }
  }, [cartItems, product.id]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) {
        return prev.filter((s) => s.size !== size);
      } else {
        return [...prev, { size, quantity: 1 }];
      }
    });
  };

  const handleDoubleRemove = async (size: string) => {
    const cartItem = cartItems.find((item) => item.product_id === product.id);
    if (cartItem) {
      await removeSizeFromCart(cartItem.id, size);
    }
    setSelectedSizes((prev) => prev.filter((s) => s.size !== size));
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity } : s))
    );
  };

  const totalQuantity = selectedSizes.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = selectedSizes.reduce(
    (sum, item) => sum + item.quantity * product.price,
    0
  );

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
        <span className="text-2xl font-bold text-blue-600">
          ₹{totalPrice || product.price}
        </span>
      </div>

      {product.description && (
        <p className="text-gray-700">{product.description}</p>
      )}

      {/* Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Sizes</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map((size) => {
            const selected = selectedSizes.some((s) => s.size === size);
            const cartItem = cartItems.find(
              (item) => item.product_id === product.id
            );
            const inCart = cartItem?.sizes.some((s) => s.size === size);
            const variant = productVariants.find((v) => v.size === size);
            const stock = variant?.stock ?? 'N/A';

            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                onDoubleClick={() => handleDoubleRemove(size)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium text-center
                ${selected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'border-gray-300'}
                ${inCart ? 'ring-2 ring-green-400' : ''}`}
              >
                <div className="font-semibold">{size}</div>
                <div className="text-xs text-gray-600">Qty: {stock}</div>
                {inCart && (
                  <div className="text-xs text-green-700 mt-1">In Cart</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Section */}
      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Quantities
          </h3>
          <div className="flex gap-3 overflow-x-auto py-2">
            {selectedSizes.map((sizeItem) => {
              const variant = productVariants.find(
                (v) => v.size === sizeItem.size
              );
              const maxStock = variant?.stock
                ? parseInt(variant.stock)
                : 0;
              const cartItem = cartItems.find(
                (item) => item.product_id === product.id
              );
              const cartSizeInfo = cartItem?.sizes?.find(
                (s) => s.size === sizeItem.size
              );
              const inCartQty = cartSizeInfo?.quantity;

              return (
                <div
                  key={sizeItem.size}
                  onDoubleClick={() => handleDoubleRemove(sizeItem.size)}
                  className={`flex flex-col border rounded-lg p-3 min-w-[140px] bg-gray-50 ${
                    inCartQty ? 'border-green-400 bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      {sizeItem.size}
                    </span>
                    <button
                      className="text-red-500"
                      onClick={() => handleSizeToggle(sizeItem.size)}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-800 mb-2">
                    Qty : {variant?.stock ?? 'N/A'}
                  </div>
                  {inCartQty !== undefined && (
                    <div className="text-xs text-green-700 mb-1">
                      In Cart : {inCartQty}
                    </div>
                  )}
                  <ProductQuantitySelector
                    quantity={sizeItem.quantity}
                    maxQuantity={maxStock}
                    onChange={(qty) =>
                      handleQuantityChange(sizeItem.size, qty)
                    }
                  />
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
        selectedSizes={selectedSizes.map((s) => s.size)}
        quantities={selectedSizes.reduce(
          (acc, s) => ({ ...acc, [s.size]: s.quantity }),
          {}
        )}
      />
    </div>
  );
};

export default ProductDetails;
