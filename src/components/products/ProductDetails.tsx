import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Share, XCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useProductInventory } from '@/hooks/useProductInventory';

import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import ShareModal from './ShareModal';

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
  const [removingSize, setRemovingSize] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { cartItems, removeSizeFromCart } = useCart();

  const {
    inventory,
    loading: inventoryLoading,
  } = useProductInventory(product.id);

  const productVariants: { size: string; stock: number }[] = useMemo(() => {
    if (product.variants) {
      if (typeof product.variants === 'string') {
        try {
          const parsed = JSON.parse(product.variants);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      if (Array.isArray(product.variants)) {
        return product.variants as { size: string; stock: number }[];
      }
    }

    if (inventory?.quantities) {
      return Object.entries(inventory.quantities).map(([size, stock]) => ({
        size,
        stock: typeof stock === 'number' ? stock : 0,
      }));
    }

    return [];
  }, [product.variants, inventory]);

  const availableSizes = productVariants.map((v) => v.size);

  useEffect(() => {
    const cartItem = cartItems.find((item) => item.product_id === product.id);
    if (cartItem) {
      setSelectedSizes(
        cartItem.sizes.map((s) => ({ size: s.size, quantity: s.quantity }))
      );
    }
  }, [cartItems, product.id]);

  const toggleSize = (size: string) => {
    const variant = productVariants.find((v) => v.size === size);
    const stock = variant?.stock ?? 0;
    const alreadySelected = selectedSizes.some((s) => s.size === size);
    if (stock === 0 && !alreadySelected) return;

    setSelectedSizes((prev) =>
      alreadySelected
        ? prev.filter((s) => s.size !== size)
        : [...prev, { size, quantity: 1 }]
    );
  };

  const changeQuantity = (size: string, qty: number) =>
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity: qty } : s))
    );

  const removeSizeFromCartOnly = async (
    e: React.MouseEvent,
    size: string
  ) => {
    e.stopPropagation();
    setRemovingSize(size);
    const cartItem = cartItems.find((c) => c.product_id === product.id);
    if (cartItem) {
      await removeSizeFromCart(cartItem.id, size);
      toast.success(`Size ${size} removed from cart`);
      setSelectedSizes((prev) => prev.filter((s) => s.size !== size));
    }
    setTimeout(() => setRemovingSize(null), 1000);
  };

  const totalPrice = selectedSizes.reduce(
    (sum, item) => sum + item.quantity * product.price,
    0
  );

  if (inventoryLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        <span className="text-2xl font-bold text-blue-600">
          ₹{totalPrice || product.price}
        </span>
        <Button variant="outline" size="icon" onClick={() => setShowShareModal(true)}>
          <Share className="h-4 w-4" />
        </Button>
      </div>

      {product.description && (
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Select Sizes</h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {availableSizes.map((size) => {
            const variant = productVariants.find((v) => v.size === size);
            const stock = variant?.stock ?? 0;
            const selected = selectedSizes.some((s) => s.size === size);
            const inCart = cartItems.find((c) => c.product_id === product.id)?.sizes.some((s) => s.size === size);

            return (
              <button
  key={size}
  onClick={() => toggleSize(size)}
  disabled={stock === 0 && !selected}
  className={`rounded-lg border px-2 py-1 text-xs text-center transition-all
    ${selected ? 'border-blue-500 text-blue-800 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
    ${inCart ? 'ring-2 ring-green-400' : ''}
    ${stock === 0 ? 'opacity-50' : ''}`}
>
  {/* size label */}
  <div className="font-semibold">{size}</div>

  {/* numeric stock ALWAYS shown */}
  <div className="text-xs mt-1 font-medium text-gray-700">
    Stock:&nbsp;
    <span className={stock === 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>
      {stock}
    </span>
  </div>

  {/* out-of-stock message just below */}
  {stock === 0 && (
    <p className="text-[11px] text-red-600 font-semibold mt-0.5">
      🚫 Out&nbsp;of&nbsp;Stock
    </p>
  )}

  {/* selected / in-cart badges */}
  {selected && stock > 0 && (
    <p className="text-[10px] text-blue-600 font-semibold mt-0.5">✓ Selected</p>
  )}
  {inCart && (
    <span className="inline-block bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full mt-0.5">
      In Cart
    </span>
  )}
</button>

            );
          })}
        </div>
      </div>

      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedSizes.map((sizeItem) => {
              const variant = productVariants.find((v) => v.size === sizeItem.size);
              const maxStock = variant?.stock ?? 0;
              const cartItem = cartItems.find((item) => item.product_id === product.id);
              const cartSizeInfo = cartItem?.sizes?.find((s) => s.size === sizeItem.size);
              const inCartQty = cartSizeInfo?.quantity;

              return (
                <div
                  key={sizeItem.size}
                  className={`p-2 bg-white rounded-xl border shadow-sm ${
                    inCartQty ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      Size: {sizeItem.size}
                    </span>
                    {inCartQty && (
                      removingSize === sizeItem.size ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <button
                          onClick={(e) => removeSizeFromCartOnly(e, sizeItem.size)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/10967/10967145.png"
                            alt="Remove"
                            className="w-4 h-4"
                          />
                        </button>
                      )
                    )}
                  </div>

                  {maxStock > 0 ? (
                    <ProductQuantitySelector
                      quantity={sizeItem.quantity}
                      maxQuantity={maxStock}
                      onChange={(q) => changeQuantity(sizeItem.size, q)}
                    />
                  ) : (
                    <p className="text-sm text-red-500 font-medium mt-2">⚠️ Out of Stock</p>
                  )}

                  {inCartQty && (
                    <div className="text-xs text-green-700 mt-1">In Cart: {inCartQty}</div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">Stock: {maxStock}</div>

                  <div className="text-sm font-semibold text-right text-gray-800 mt-2">
                    ₹{(product.price * sizeItem.quantity).toFixed(2)}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      className="flex items-center text-sm text-red-500 hover:text-red-600"
                      onClick={() => toggleSize(sizeItem.size)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ProductActionButtons
        product={product}
        selectedSizes={selectedSizes.map((s) => s.size)}
        quantities={selectedSizes.reduce(
          (acc, s) => ({ ...acc, [s.size]: s.quantity }),
          {}
        )}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
