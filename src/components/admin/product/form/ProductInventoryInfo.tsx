
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductInventoryInfoProps {
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductInventoryInfo: React.FC<ProductInventoryInfoProps> = ({
  originalPrice,
  discountPercentage,
  stock,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing & Inventory</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price</Label>
          <Input
            id="originalPrice"
            name="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={originalPrice}
            onChange={onChange}
          />
          <p className="text-xs text-gray-500">Original price before discount</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discountPercentage">Discount (%)</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={discountPercentage}
            onChange={onChange}
          />
          <p className="text-xs text-gray-500">Percentage off the original price</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Available Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={stock}
            onChange={onChange}
          />
          <p className="text-xs text-gray-500">Number of items available</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryInfo;
