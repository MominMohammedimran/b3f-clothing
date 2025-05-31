
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductBasicInfoProps {
  code: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
}

const CATEGORIES = [
  "Clothing",
  "Accessories",
  "Footwear",
  "Electronics",
  "Home Decor",
  "Books",
  "Sports",
  'tshirts',
  "Other"
];

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  code,
  name,
  category,
  price,
  originalPrice,
  discountPercentage,
  stock,
  errors,
  onChange,
  onCategoryChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Product Code *</Label>
          <Input
            id="code"
            name="code"
            value={code}
            onChange={onChange}
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
        </div>
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={category} 
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={onChange}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock">Stock</Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          min="0"
          value={stock || 0}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default ProductBasicInfo;
