
import React,{ useState }  from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Type, Image, Smile, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import ProductVariantSelector from '@/components/products/ProductVariantSelector';

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

  return (
    <div className="bg-white rounded-lg border shadow-lg p-6 space-y-6">

      {/* Design Tools */}
      <div className="border p-4">
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

      {/* Dual-sided Option */}
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

      {/* Product Variant Selector */}
      {product && (
        <ProductVariantSelector
          product={product}
          selectedSizes={selectedSizes}
          quantities={quantities}
          onSizeToggle={onSizeToggle}
          onQuantityChange={onQuantityChangeForSize}
        />
      )}

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
