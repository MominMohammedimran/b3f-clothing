
import React from 'react';
import { Type, Image as ImageIcon, Smile, ShoppingCart } from 'lucide-react';
import { formatIndianRupees } from '@/utils/currency';
import ProductViewSelector from './ProductViewSelector';
import { Button } from '@/components/ui/button';
import ProductPlaceOrder from '@/components/products/ProductPlaceOrder';

interface CustomizationSidebarProps {
  activeProduct: string;
  productView: string;
  onViewChange: (view: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  isDualSided: boolean;
  onDualSidedChange?: (checked: boolean) => void;
  sizeInventory: Record<string, Record<string, number>>;
  products: Record<string, { name: string; price: number; image: string }>;
  onOpenTextModal: () => void;
  onOpenImageModal: () => void;
  onOpenEmojiModal: () => void;
  onSaveDesign: () => void;
  onAddToCart: () => void;
  validateDesign: () => boolean;
}

const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  activeProduct,
  productView,
  onViewChange,
  selectedSize,
  onSizeChange,
  isDualSided,
  onDualSidedChange,
  sizeInventory,
  products,
  onOpenTextModal,
  onOpenImageModal,
  onOpenEmojiModal,
  onSaveDesign,
  onAddToCart,
  validateDesign
}) => {
  const availableSizes = Object.keys(sizeInventory[activeProduct] || {});

  // Create a product object for the ProductPlaceOrder component
  const currentProduct = {
    id: `${activeProduct}-custom`,
    code: `CUSTOM-${activeProduct.toUpperCase()}`,
    name: `Custom ${products[activeProduct]?.name || 'Product'}`,
    price: isDualSided && activeProduct === 'tshirt' ? 300 : products[activeProduct]?.price || 200,
    image: products[activeProduct]?.image || '',
    category: activeProduct,
    description: `Custom designed ${products[activeProduct]?.name || 'product'}`,
    stock: sizeInventory[activeProduct]?.[selectedSize] || 0,
    sizes: availableSizes
  };

  const isDesignValid = validateDesign();
  const isInStock = sizeInventory[activeProduct]?.[selectedSize] > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <ProductViewSelector 
        productType={activeProduct}
        currentView={productView}
        onViewChange={onViewChange}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        availableSizes={availableSizes}
        sizeInventory={sizeInventory[activeProduct] || {}}
        isDualSided={isDualSided}
        onDualSidedChange={onDualSidedChange}
      />

      {/* Design Tools */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Design Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={onOpenTextModal}
            variant="outline"
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
          >
            <Type className="w-4 h-4 mb-1" />
            <span className="text-xs">Text</span>
          </Button>
          <Button
            onClick={onOpenImageModal}
            variant="outline"
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
          >
            <ImageIcon className="w-4 h-4 mb-1" />
            <span className="text-xs">Image</span>
          </Button>
          <Button
            onClick={onOpenEmojiModal}
            variant="outline"
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
          >
            <Smile className="w-4 h-4 mb-1" />
            <span className="text-xs">Emoji</span>
          </Button>
        </div>
      </div>

      {/* Product Price */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Price</span>
          <span className="font-semibold text-lg">
            {formatIndianRupees(currentProduct.price)}
          </span>
        </div>
        {isDualSided && activeProduct === 'tshirt' && (
          <p className="text-xs text-blue-600">Dual-sided design applied</p>
        )}
      </div>

      {/* Stock Status */}
      {selectedSize && (
        <div className="text-sm">
          <span className={`px-2 py-1 rounded text-xs ${
            isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isInStock ? `In Stock (${currentProduct.stock})` : 'Out of Stock'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <p className='text-center text-sm'> If you want to share your design in privately, <br/>please click below</p>
       <Button
        onClick={() => {
        window.open('https://wa.me/919581319687?text=I%20want%20to%20share%20my%20design%20privately', '_blank');
           
        }}
         variant="outline"
        className="w-full"
         
        >
        WhatsApp us
   </Button>

        <Button
          onClick={onSaveDesign}
          variant="outline"
          className="w-full"
          disabled={!isDesignValid}
        >
          Save Design
        </Button>
        <Button
          onClick={onAddToCart}
          className="w-full"
          disabled={!isDesignValid || !selectedSize || !isInStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
         <Button
      
          className="w-full"
          disabled={!isDesignValid || !selectedSize || !isInStock}
        >
         
         {/* ProductPlaceOrder for additional functionality */}
                 <ProductPlaceOrder 
                 product={currentProduct}
              selectedSize={selectedSize}
                 />
        </Button>
      </div>

    
      
    </div>
  );
};

export default CustomizationSidebar;
