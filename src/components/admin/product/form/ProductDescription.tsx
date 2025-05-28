
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductDescriptionProps {
  description: string;
  tags: string[];
  onDescriptionChange: (description: string) => void;
  onTagsChange: (tags: string[]) => void;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  tags,
  onDescriptionChange,
  onTagsChange
}) => {
  const handleTagsChange = (value: string) => {
    const tagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    onTagsChange(tagArray);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Description & Tags</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter detailed product description..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide a detailed description of the product
          </p>
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            type="text"
            value={tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Enter tags separated by commas (e.g., cotton, casual, summer)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add relevant tags for better searchability (separate with commas)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
