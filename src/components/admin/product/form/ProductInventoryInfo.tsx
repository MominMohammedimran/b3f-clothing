
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductInventoryInfoProps {
  price: number;
  originalPrice: number;
  discountPercentage: number;
  onPriceChange: (price: number) => void;
  onOriginalPriceChange: (originalPrice: number) => void;
  onDiscountPercentageChange: (discountPercentage: number) => void;
  errors: Record<string, string>;
}

const ProductInventoryInfo: React.FC<ProductInventoryInfoProps> = ({
  price,
  originalPrice,
  discountPercentage,
  onPriceChange,
  onOriginalPriceChange,
  onDiscountPercentageChange,
  errors
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing & Inventory</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={originalPrice}
            onChange={(e) => onOriginalPriceChange(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="discountPercentage">Discount (%)</Label>
        <Input
          id="discountPercentage"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={discountPercentage}
          onChange={(e) => onDiscountPercentageChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default ProductInventoryInfo;
