
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProductTagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const ProductTagsInput: React.FC<ProductTagsInputProps> = ({ tags, onChange }) => {
  const [newTag, setNewTag] = useState<string>('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <div key={tag} className="flex items-center bg-gray-100 rounded-md px-2 py-1">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="Add tag"
          className="flex-grow"
        />
        <Button type="button" onClick={addTag} variant="outline">Add</Button>
      </div>
    </div>
  );
};

export default ProductTagsInput;
