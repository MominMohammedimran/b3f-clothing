
import React from 'react';
import ProductSizesInput from '../ProductSizesInput';
import ProductTagsInput from '../ProductTagsInput';

interface ProductVariantsProps {
  sizes: string[];
  tags: string[];
  onSizesChange: (sizes: string[]) => void;
  onTagsChange: (tags: string[]) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  sizes,
  tags,
  onSizesChange,
  onTagsChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Variants & Tags</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ProductSizesInput 
            sizes={sizes} 
            onChange={onSizesChange} 
          />
          <p className="text-xs text-gray-500 mt-2">Add available sizes (S, M, L, etc.)</p>
        </div>
        
        <div>
          <ProductTagsInput 
            tags={tags} 
            onChange={onTagsChange} 
          />
          <p className="text-xs text-gray-500 mt-2">Add relevant tags for searchability</p>
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;
