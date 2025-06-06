
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Type, Image, Smile, ShoppingCart } from 'lucide-react';

interface CustomizationSidebarProps {
  activeProduct: string;
  productView: string;
  onViewChange: (view: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  isDualSided: boolean;
  onDualSidedChange: (checked: boolean) => void;
  sizeInventory: Record<string, Record<string, number>>;
  products: Record<string, any>;
  onOpenTextModal: () => void;
  onOpenImageModal: () => void;
  onOpenEmojiModal: () => void;
  onAddToCart: () => void;
  validateDesign: () => boolean;
  selectedSizes?: string[];
  onSizeToggle?: (size: string) => void;
  getTotalPrice?: () => number;
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
  onAddToCart,
  validateDesign,
  selectedSizes = [],
  onSizeToggle,
  getTotalPrice
}) => {
  const product = products[activeProduct];
  const productSizes = product?.sizes || ['S', 'M', 'L', 'XL'];
  console.log(product)
  return (
    <div className="bg-white rounded-lg border shadow-lg p-6 space-y-6">
      
      {/* Design Tools */}
      <div className='border p-4'>
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

      <div className='border pb-4 pt-2'>
        

      <h2 className="text-lg  text-center font-semibold pb-4">Customize Your Design</h2>

        <h3 className="text-sm text-center font-medium mb-2">View</h3>
        <div className="flex justify-self-center gap-2">
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
        <div className="flex items-center justify-self-center space-x-2">
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

      {/* Size Selection */}
      <div className='border pb-4'>
        <h3 className="text-sm font-medium text-center mb-2">Size Selection</h3>
        <div className="space-x-2 flex flex-wrap justify-center">
          {productSizes.map((size) => {
            const stock = sizeInventory[activeProduct]?.[size] || 0;
            const isSelected = onSizeToggle ? selectedSizes.includes(size) : selectedSize === size;
            
            return (
              <div key={size} className="grid grid-col-2 items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  {onSizeToggle ? (
                    <Checkbox
                      checked={isSelected}
                      className='text-center'
                      onCheckedChange={() => onSizeToggle(size)}
                      disabled={stock <= 0}
                    />
                  ) : (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className='text-center'
                      onClick={() => onSizeChange(size)}
                      disabled={stock <= 0}
                    >
                      {size}
                    </Button>
                  )}
              
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Stock: {stock}</div>
                  {stock <= 0 && (
                    <div className="text-xs text-red-700">Out of Stock</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {  
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


      }

      {/* Total Price Display */}
      {getTotalPrice && (
        <div className="p-3 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Price:</span>
            <span className="text-lg font-bold">₹{getTotalPrice()}</span>
          </div>
        </div>
      )}


      {/* Action Buttons - Removed Save Design button */}
      <div className="space-y-2">
        <Button 
          className="w-full" 
          onClick={onAddToCart}
          disabled={!validateDesign()}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSidebar;
