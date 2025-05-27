
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProductDescriptionProps {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Description</h3>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={onChange}
          rows={4}
          placeholder="Provide detailed product description..."
          className="resize-y"
        />
        <p className="text-xs text-gray-500">Detailed information about the product</p>
      </div>
    </div>
  );
};

export default ProductDescription;
