import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

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
  const [showPopupForSize, setShowPopupForSize] = useState<string | null>(null);
  const { cartItems, removeSizeFromCart } = useCart();

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
    const variant = productVariants.find((v) => v.size === size);
    const stock = variant?.stock ? parseInt(variant.stock) : 0;
    if (stock === 0) return;

    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) {
        return prev.filter((s) => s.size !== size);
      } else {
        return [...prev, { size, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity } : s))
    );
  };

  const handleRemoveFromCartOnly = async (size: string) => {
    const cartItem = cartItems.find((item) => item.product_id === product.id);
    if (cartItem) {
      await removeSizeFromCart(cartItem.id, size);
      toast.success(`Size ${size} removed from cart`);
    }
  };

  const totalPrice = selectedSizes.reduce((sum, item) => {
    const variant = productVariants.find((v) => v.size === item.size);
    const stock = variant?.stock ? parseInt(variant.stock) : 0;
    return stock > 0 ? sum + item.quantity * product.price : sum;
  }, 0);

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        <span className="text-2xl font-bold text-blue-600">
          ₹{totalPrice || product.price}
        </span>
      </div>

      {product.description && (
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      )}

      {/* Sizes Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Sizes</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {availableSizes.map((size) => {
            const selected = selectedSizes.some((s) => s.size === size);
            const cartItem = cartItems.find(
              (item) => item.product_id === product.id
            );
            const inCart = cartItem?.sizes.some((s) => s.size === size);
            const variant = productVariants.find((v) => v.size === size);
            const stock = variant?.stock ? parseInt(variant.stock) : 0;

            return (
              <div key={size} className="relative">
                <button
                  onClick={() => handleSizeToggle(size)}
                  disabled={stock === 0}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-medium text-center
                    ${selected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'border-gray-300 hover:border-blue-400'}
                    ${inCart ? 'ring-2 ring-green-400' : ''}
                    ${stock === 0 ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <div className="font-semibold">{size}</div>
                  <div className="text-xs text-gray-600">
                    {stock === 0 ? 'Out of stock' : `Qty: ${stock}`}
                  </div>
                  {inCart && (
                    <div className="mt-1">
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        In Cart
                      </span>
                    </div>
                  )}
                </button>
              </div>
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
          <div className="flex flex-wrap gap-4 py-2">
            {selectedSizes.map((sizeItem) => {
              const variant = productVariants.find(
                (v) => v.size === sizeItem.size
              );
              const maxStock = variant?.stock ? parseInt(variant.stock) : 0;
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
                  className={`flex flex-col p-4 w-[140px] bg-white rounded-xl border shadow-sm ${
                    inCartQty
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {sizeItem.size}
                    </span>
                    <div className="flex items-center gap-2">
                      {inCartQty && (
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/10967/10967145.png"
                          alt="Remove from cart"
                          title="Remove from cart"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPopupForSize(sizeItem.size);
                          }}
                          className="w-5 h-4 cursor-pointer filter grayscale hover:grayscale-0 hover:brightness-110 hover:drop-shadow-md"
                        />
                      )}
                      <button
                        className="text-red-500"
                        onClick={() => handleSizeToggle(sizeItem.size)}
                        title="Remove size"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-1">
                    Stock: {maxStock}
                  </div>

                  {inCartQty && (
                    <div className="text-xs text-green-700 mb-1">
                      In Cart: {inCartQty}
                    </div>
                  )}

                  {maxStock > 0 ? (
                    <>
                      <ProductQuantitySelector
                        quantity={sizeItem.quantity}
                        maxQuantity={maxStock}
                        onChange={(qty) =>
                          handleQuantityChange(sizeItem.size, qty)
                        }
                      />
                      <div className="mt-2 text-sm font-semibold text-gray-900">
                        ₹{(product.price * sizeItem.quantity).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      Out of Stock
                    </p>
                  )}
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
