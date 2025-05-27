
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProductSizesInputProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
}

const ProductSizesInput: React.FC<ProductSizesInputProps> = ({ sizes, onChange }) => {
  const [newSize, setNewSize] = useState<string>('');

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      onChange([...sizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onChange(sizes.filter(size => size !== sizeToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>Sizes</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {sizes.map(size => (
          <div key={size} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
            <span>{size}</span>
            <button
              type="button"
              onClick={() => removeSize(size)}
              className="ml-1 text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newSize}
          onChange={e => setNewSize(e.target.value)}
          placeholder="Add size (e.g. S, M, L)"
          className="flex-grow"
        />
        <Button type="button" onClick={addSize} variant="outline">Add</Button>
      </div>
    </div>
  );
};

export default ProductSizesInput;
