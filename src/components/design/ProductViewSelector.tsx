
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
  isDualSided?: boolean;
  onDualSidedChange?: (isDualSided: boolean) => void;
}

const ProductViewSelector: React.FC<ProductViewSelectorProps> = ({
  productType,
  currentView,
  onViewChange,
  selectedSize,
  onSizeChange,
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
            src="/lovable-uploads/mug.png"
            alt="Mug"
            className="h-20 object-contain cursor-pointer border border-blue-300 rounded p-1"
            onClick={() => onViewChange('front')}
          />
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/cap.png"
            alt="Cap"
            className="h-20 object-contain cursor-pointer border border-blue-300 rounded p-1"
            onClick={() => onViewChange('front')}
          />
        </div>
      )}
      
      {/* Size selector */}
      <div className="mt-6">
        <h3 className="text-xl font-medium mb-3">Select Size:</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {productType === 'tshirt' ? (
            <>
              <button 
                onClick={() => onSizeChange('S')}
                className={`px-4 py-1 text-xl border rounded ${selectedSize === 'S' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                S
              </button>
              <button 
                onClick={() => onSizeChange('M')}
                className={`px-4 py-1 text-xl border rounded ${selectedSize === 'M' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                M
              </button>
              <button 
                onClick={() => onSizeChange('L')}
                className={`px-4 py-1 text-xl border rounded ${selectedSize === 'L' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                L
              </button>
              <button 
                onClick={() => onSizeChange('XL')}
                className={`px-4 py-1 text-xl border rounded ${selectedSize === 'XL' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
              >
                XL
              </button>
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
