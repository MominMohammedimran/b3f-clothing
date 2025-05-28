
import React from 'react';
import { Type, Image as ImageIcon, Smile } from 'lucide-react';
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
    name: `Custom ${products[activeProduct]?.name || 'Product'}`,
    price: isDualSided && activeProduct === 'tshirt' ? 300 : products[activeProduct]?.price || 200,
    image: products[activeProduct]?.image || '',
    category: activeProduct,
    description: `Custom designed ${products[activeProduct]?.name || 'product'}`,
    stock: sizeInventory[activeProduct]?.[selectedSize] || 0,
    sizes: availableSizes
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <ProductViewSelector 
        productType={activeProduct}
        currentView={productView}
        onViewChange={onViewChange}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        isDualSided={isDualSided}
        onDualSidedChange={activeProduct === 'tshirt' ? onDualSidedChange : undefined}
      />
      
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Size</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableSizes.map((size) => (
            <div key={size} className="text-center">
              <Button
                variant={selectedSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeChange(size)}
                disabled={sizeInventory[activeProduct]?.[size] === 0}
                className={`w-full ${sizeInventory[activeProduct]?.[size] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {size}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Qty: {sizeInventory[activeProduct]?.[size] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Customization Options</h2>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={onOpenTextModal}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <Type size={24} className="mb-2 text-blue-600" />
            <span className="text-sm font-medium">Add Text</span>
          </button>
          
          <button 
            onClick={onOpenImageModal}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ImageIcon size={24} className="mb-2 text-blue-600" />
            <span className="text-sm font-medium">Add Image</span>
          </button>
          
          <button 
            onClick={onOpenEmojiModal}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <Smile size={24} className="mb-2 text-blue-600" />
            <span className="text-sm font-medium">Add Emoji</span>
          </button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Product Details</h2>
          <div className="font-bold text-green-600">
            {formatIndianRupees(isDualSided && activeProduct === 'tshirt' ? 300 : products[activeProduct]?.price)}
          </div>
        </div>
        
        <div className="mt-6">
          <ProductPlaceOrder
            product={currentProduct}
            size={selectedSize}
            variant="default"
            size_btn="default"
            className="w-full"
          />
        </div>
        
        {/* Error messages */}
        {!validateDesign() && (
          <p className="mt-2 text-sm text-red-500">
            {isDualSided 
              ? "Please complete both front and back designs"
              : "Please add some design elements"
            }
          </p>
        )}
        {sizeInventory[activeProduct][selectedSize] <= 0 && (
          <p className="mt-2 text-sm text-red-500">
            This size is currently out of stock
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomizationSidebar;
