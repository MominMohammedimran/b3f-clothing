import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface ProductVariantsProps {
  sizes: string[];
  sizeQuantities: Record<string, number>;
  onSizesChange: (sizes: string[]) => void;
  onSizeQuantitiesChange: (quantities: Record<string, number>) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  sizes,
  sizeQuantities,
  onSizesChange,
  onSizeQuantitiesChange
}) => {
  const [newSize, setNewSize] = useState('');

  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      const updatedSizes = [...sizes, newSize.trim()];
      onSizesChange(updatedSizes);
      onSizeQuantitiesChange({
        ...sizeQuantities,
        [newSize.trim()]: 0
      });
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updatedSizes = sizes.filter(size => size !== sizeToRemove);
    const updatedQuantities = { ...sizeQuantities };
    delete updatedQuantities[sizeToRemove];
    onSizesChange(updatedSizes);
    onSizeQuantitiesChange(updatedQuantities);
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    onSizeQuantitiesChange({
      ...sizeQuantities,
      [size]: Math.max(0, quantity)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Variants & Quantity</h3>
      
      <div className="space-y-4">
        {/* Existing sizes with quantities */}
        {sizes.map((size) => (
          <div key={size} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="font-medium min-w-[60px]">
              Size: {size}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`qty-${size}`} className="text-sm">
                Quantity:
              </Label>
              <Input
                id={`qty-${size}`}
                type="number"
                min="0"
                value={sizeQuantities[size] || 0}
                onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRemoveSize(size)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add new size */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Enter size (e.g., S, M, L, XL)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSize}
              disabled={!newSize.trim() || sizes.includes(newSize.trim())}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Size
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Add different sizes and set quantities for each
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;
