
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface SizeStock {
  size: string;
  stock: number;
}

interface ProductVariantsProps {
  sizes: string[];
  sizeQuantities: Record<string, number>;
  onSizesChange: (sizes: string[]) => void;
  onSizeQuantitiesChange: (quantities: Record<string, number>) => void;
  onSizeStockChange?: (sizeStocks: SizeStock[]) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  sizes,
  sizeQuantities,
  onSizesChange,
  onSizeQuantitiesChange,
  onSizeStockChange
}) => {
  const [newSize, setNewSize] = useState('');

  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      const updatedSizes = [...sizes, newSize.trim()];
      onSizesChange(updatedSizes);
      const updatedQuantities = {
        ...sizeQuantities,
        [newSize.trim()]: 0
      };
      onSizeQuantitiesChange(updatedQuantities);
      
      // Update size stocks if callback provided
      if (onSizeStockChange) {
        const sizeStocks = updatedSizes.map(size => ({
          size,
          stock: updatedQuantities[size] || 0
        }));
        onSizeStockChange(sizeStocks);
      }
      
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updatedSizes = sizes.filter(size => size !== sizeToRemove);
    const updatedQuantities = { ...sizeQuantities };
    delete updatedQuantities[sizeToRemove];
    onSizesChange(updatedSizes);
    onSizeQuantitiesChange(updatedQuantities);
    
    // Update size stocks if callback provided
    if (onSizeStockChange) {
      const sizeStocks = updatedSizes.map(size => ({
        size,
        stock: updatedQuantities[size] || 0
      }));
      onSizeStockChange(sizeStocks);
    }
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    const updatedQuantities = {
      ...sizeQuantities,
      [size]: Math.max(0, quantity)
    };
    onSizeQuantitiesChange(updatedQuantities);
    
    // Update size stocks if callback provided
    if (onSizeStockChange) {
      const sizeStocks = sizes.map(sizeItem => ({
        size: sizeItem,
        stock: updatedQuantities[sizeItem] || 0
      }));
      onSizeStockChange(sizeStocks);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Variants & Size-Specific Stock</h3>
      <p className="text-sm text-gray-600">
        Add different sizes and set individual stock quantities for each size variant.
      </p>
      
      <div className="space-y-4">
        {/* Existing sizes with quantities */}
        {sizes.map((size) => (
          <div key={size} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
            <div className="font-medium min-w-[60px]">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {size}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor={`qty-${size}`} className="text-sm whitespace-nowrap">
                Stock Quantity:
              </Label>
              <Input
                id={`qty-${size}`}
                type="number"
                min="0"
                value={sizeQuantities[size] || 0}
                onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                className="w-24"
                placeholder="0"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRemoveSize(size)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {sizes.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <p>No size variants added yet</p>
            <p className="text-sm">Add sizes below to manage size-specific inventory</p>
          </div>
        )}

        {/* Add new size */}
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Enter size (e.g., S, M, L, XL, Standard)"
              className="flex-1 bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSize();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddSize}
              disabled={!newSize.trim() || sizes.includes(newSize.trim())}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Size
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Add different sizes with individual stock quantities. Each size will have its own inventory count.
          </p>
        </div>

        {/* Summary */}
        {sizes.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Size Inventory Summary:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {sizes.map(size => (
                <div key={size} className="flex justify-between text-green-700">
                  <span>{size}:</span>
                  <span className="font-medium">{sizeQuantities[size] || 0} units</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-green-300">
              <div className="flex justify-between text-green-800 font-medium">
                <span>Total Stock:</span>
                <span>{Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0)} units</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariants;
