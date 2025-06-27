
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatIndianRupees } from '@/utils/currency';

interface ProductViewSelectorProps {
  productType: string;
  currentView: string;
  onViewChange: (viewId: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  availableSizes: string[];
  sizeInventory: Record<string, number>;
  isDualSided?: boolean;
  onDualSidedChange?: (isDualSided: boolean) => void;
}

const ProductViewSelector: React.FC<ProductViewSelectorProps> = ({
  productType,
  currentView,
  onViewChange,
  selectedSize,
  onSizeChange,
  availableSizes,
  sizeInventory,
  isDualSided = false,
  onDualSidedChange
}) => {
  return (
    <div className="p-4 pt-0">
      <h2 className="text-lg font-medium mb-3">{productType === 'tshirt' ? 'T-Shirt' : productType === 'mug' ? 'Mug' : 'Cap'} Views</h2>
      
      {productType === 'tshirt' ? (
        <Tabs defaultValue={currentView} className="w-[100%] justify-self-center" onValueChange={onViewChange}>
          <TabsList className="grid grid-cols-2 mb-4 justify-between" >
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
          
          {/* Add dual-sided printing option */}
          {onDualSidedChange && (
            <div className="flex items-center space-x-2 mt-2 p-2 bg-blue-50 rounded-md">
              <Checkbox 
                id="dual-sided" 
                checked={isDualSided} 
                onCheckedChange={(checked) => onDualSidedChange(checked === true)}
              />
              <Label htmlFor="dual-sided" className="text-l leading-[1.5]">
                I want to print on both sides ({formatIndianRupees(300)})
              </Label>
            </div>
          )}
        </Tabs>
      ) : productType === 'mug' ? (
        <div className="flex justify-center mb-4">
          <img
            src="https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/mug-sub-images/mug-plain.webp"
            alt="Mug"
            className="h-20 object-contain cursor-pointer border border-blue-300 rounded p-1"
            onClick={() => onViewChange('front')}
          />
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <img
            src="https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/cap-sub-images/cap-plain.webp"
            alt="Cap"
            className="h-20 object-contain cursor-pointer border border-blue-300 rounded p-1"
            onClick={() => onViewChange('front')}
          />
        </div>
      ) : (<div className="flex justify-center mb-4">
          <img
            src="https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/cap-sub-images/cap-plain.webp"
            alt="Photo"
            className="h-20 object-contain cursor-pointer border border-blue-300 rounded p-1"
            onClick={() => onViewChange('front')}
          />
        </div>)
      
      }
      
      {/* Size selector */}
      <div className="mt-6">
        <h3 className="text-xl font-medium mb-3">Select Size:</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {productType === 'tshirt' ? (
            <>
              {availableSizes.map((size) => (
                <button 
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`px-4 py-1 text-xl border rounded ${selectedSize === size ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                  disabled={sizeInventory[size] === 0}
                >
                  {size}
                  {sizeInventory[size] === 0 && <span className="block text-xs text-red-500">Out of Stock</span>}
                </button>
              ))}
            </>
          ) : (
            <button 
              onClick={() => onSizeChange('Standard')}
              className={`px-4 py-1 justify-center m-auto border rounded ${selectedSize === 'Standard' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
            >
              Standard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewSelector;
