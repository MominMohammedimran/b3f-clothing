
import React from 'react';
import { Type, Image as ImageIcon, Smile } from 'lucide-react';
import { formatIndianRupees } from '@/utils/currency';
import ProductViewSelector from './ProductViewSelector';

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
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-20">
      <ProductViewSelector 
        productType={activeProduct}
        currentView={productView}
        onViewChange={onViewChange}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        isDualSided={isDualSided}
        onDualSidedChange={activeProduct === 'tshirt' ? onDualSidedChange : undefined}
      />
      
      {/* Available stock info */}
      <div className="mt-2 p-2 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Available stock: <span className="font-medium">{sizeInventory[activeProduct][selectedSize] || 0}</span> items
        </p>
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
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSaveDesign}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Design
          </button>
          
          <button
            onClick={onAddToCart}
            disabled={!validateDesign() || sizeInventory[activeProduct][selectedSize] <= 0}
            className={`flex-1 px-4 py-2 text-white rounded-md ${
              !validateDesign() || sizeInventory[activeProduct][selectedSize] <= 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Add to Cart
          </button>
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
