
import React,{ useState }  from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Type, Image, Smile, ShoppingCart, Minus, Plus, Loader2 ,XCircle } from 'lucide-react';
import ProductQuantitySelector from '@/components/products/ProductQuantitySelector';

interface Variant {
  size: string;
  stock: number;
}

interface CustomizationSidebarProps {
  activeProduct: string;
  productView: string;
  onViewChange: (view: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  isDualSided: boolean;
  onDualSidedChange: (checked: boolean) => void;
  sizeInventory: Record<string, Record<string, number>>;
  products: Record<string, any>;
  onOpenTextModal: () => void;
  onOpenImageModal: () => void;
  onOpenEmojiModal: () => void;
  onAddToCart: () => void;
  validateDesign: () => boolean;
  getTotalPrice: () => number;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  productId: string;
  upi_input: string;
  quantities: Record<string, number>;
  onQuantityChangeForSize: (size: string, quantity: number) => void;
}

const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  activeProduct,
  productView,
  onViewChange,
  selectedSizes,
  onSizeToggle,
  isDualSided,
  onDualSidedChange,
  sizeInventory,
  products,
  onOpenTextModal,
  onOpenImageModal,
  onOpenEmojiModal,
  onAddToCart,
  validateDesign,
  getTotalPrice,
  quantity,
  onQuantityChange,
  productId,
  upi_input,
  quantities,
  onQuantityChangeForSize
}) => {
const [adding, setAdding] = useState(false); 
  const product = products[activeProduct];

  const renderViewSelector = () => {
    if (activeProduct === 'photo_frame') {
      return (
        <div className="border pb-4 pt-2">
          <h2 className="text-lg text-center font-semibold pb-4">Select Frame Size</h2>
          <div className="grid grid-cols-3 gap-2 ml-2 mr-2">
            <Button
              variant={productView === '8X12inch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('8X12inch')}
              className="w-full"
            >
              8×12 inch
            </Button>
            <Button
              variant={productView === '12x16inch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('12x16inch')}
              className="w-full"
            >
              12×16 inch
            </Button>
            <Button
              variant={productView === '5x7 inch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('5x7 inch')}
              className="w-full"
            >
              5×7 inch
            </Button>
          </div>
        </div>
      );
    }

    // Default view selector for other products
    return (
      <div className="border pb-4 pt-2">
        <h2 className="text-lg text-center font-semibold pb-4">Customize Your Design</h2>
        <h3 className="text-sm text-center font-medium mb-2">View</h3>
        <div className="flex justify-center gap-2">
          <Button
            variant={productView === 'front' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('front')}
          >
            Front
          </Button>
          {activeProduct === 'tshirt' && (
            <Button
              variant={productView === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('back')}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    );
  };





const renderSizeAndQuantitySelector = () => {
  if (!product || !product.variants) return null;

  return (
    <div className="border p-4 rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Select Size & Quantity
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-2 gap-4">
        {product.variants.map((variant: Variant) => {
          const isSelected      = selectedSizes.includes(variant.size);
          const currentQuantity = quantities[variant.size] || 0;
          const isAvailable     = variant.stock > 0;

          return (
            <div
              key={variant.size}
              className="flex flex-col border rounded-lg bg-gray-50 p-1 shadow-sm space-y-2"
            >
              {/* Size and Remove Row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSizeToggle(variant.size)}
                  disabled={!isAvailable}
                  className={`
                    px-2 py-2 rounded-md font-medium text-sm transition-all min-w-[50px]
                    ${isSelected
                      ? 'bg-blue-600 text-white'
                      : isAvailable
                        ? 'bg-white text-gray-700 hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {variant.size}
                </button>

                {isSelected && (
                  <button
                    onClick={() => onSizeToggle(variant.size)}
                    title="Remove size"
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Quantity Selector */}
              {isSelected && (
                <ProductQuantitySelector
                  quantity={currentQuantity}
                  maxQuantity={variant.stock}
                  onChange={(qty) =>
                    onQuantityChangeForSize(variant.size, qty)
                  }
                />
              )}

              {/* Stock Info */}
              <div className="text-sm text-gray-600">
                {isAvailable ? `Stock: ${variant.stock}` : (
                  <span className="text-red-600 font-medium">
                    🚫 Out of stock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Summary */}
      {selectedSizes.length > 0 && (
        <div className="mt-5 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            Selected:&nbsp;
            {selectedSizes
              .map((s) => `${s} (${quantities[s] || 0})`)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};



  return (
   <div className="bg-gray-50 rounded-xl border shadow-md p-4 sm:p-6 space-y-8 sm:space-y-8">

      {/* Design Tools */}
      <div className="border p-8">
        <h3 className="text-sm text-center font-medium mb-2">Add Elements</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={onOpenTextModal}>
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenImageModal}>
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenEmojiModal}>
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product View Selector */}
      {renderViewSelector()}

      {/* Dual-sided Option - only for tshirt */}
      {activeProduct === 'tshirt' && (
        <div className="flex items-center justify-center space-x-2">
          <Checkbox
            id="dual-sided"
            checked={isDualSided}
            onCheckedChange={onDualSidedChange}
          />
          <label htmlFor="dual-sided" className="text-sm font-medium">
            Dual-sided printing (+₹100)
          </label>
        </div>
      )}

      {/* Size and Quantity Selector */}
      {renderSizeAndQuantitySelector()}

      {/* WhatsApp Share */}
      <div className="p-4 bg-gray-50 rounded text-center">
        <p className="font-medium mb-4">
          If you want to share your design privately,<br />
          click the button below:
        </p>
        <a
          href="https://wa.me/919581319687"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white font-semibold px-6 py-2 rounded shadow hover:bg-green-700 transition"
        >
          WhatsApp
        </a>
      </div>

      {/* Total Price */}
      <div className="p-3 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Price:</span>
          <span className="text-lg font-bold">₹{getTotalPrice()}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-2">
        <p className='text-center text-gray-500'> please add atleast one image or text or emoji before adding to cart</p>
       
  <Button
    className="w-full"
    onClick={async () => {
      setAdding(true);
      try {
        await onAddToCart();
      } catch (err) {
        console.error(err);
      } finally {
        setAdding(false);
      }
    }}
    disabled={!validateDesign() || adding}
  >
    {adding ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
         Adding to cart Please wait...
      </>
    ) : (
      <>
       <ShoppingCart className="h-4 w-4 mr-2" />
        Add to Cart
      </>
    )}
  </Button>
</div>

    </div>
  );
};

export default CustomizationSidebar;