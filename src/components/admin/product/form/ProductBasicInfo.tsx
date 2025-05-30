
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductBasicInfoProps {
  name: string;
  code: string;
  category: string;
  onNameChange: (name: string) => void;
  onCodeChange: (code: string) => void;
  onCategoryChange: (category: string) => void;
  errors: Record<string, string>;
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
  name,
  code,
  category,
  onNameChange,
  onCodeChange,
  onCategoryChange,
  errors
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Product Code *</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>
    </div>
  );
};

export default ProductBasicInfo;
