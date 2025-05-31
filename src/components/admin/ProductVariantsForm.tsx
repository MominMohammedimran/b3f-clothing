
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductVariant {
  size: string;
  stock: number;
}

interface ProductVariantsFormProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const ProductVariantsForm: React.FC<ProductVariantsFormProps> = ({
  variants,
  onVariantsChange
}) => {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);

  useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const addVariant = () => {
    const newVariant = { size: '', stock: 0 };
    const updated = [...localVariants, newVariant];
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = localVariants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const addDefaultSizes = () => {
    const defaultSizes = ['S', 'M', 'L', 'XL'];
    const newVariants = defaultSizes.map(size => ({
      size,
      stock: 10
    }));
    setLocalVariants(newVariants);
    onVariantsChange(newVariants);
    toast.success('Default sizes added');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Product Variants & Stock</Label>
        <div className="flex gap-2">
          <Button type="button" onClick={addDefaultSizes} variant="outline" size="sm">
            Add Default Sizes
          </Button>
          <Button type="button" onClick={addVariant} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Variant
          </Button>
        </div>
      </div>

      {localVariants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-2">No variants added yet</p>
          <Button type="button" onClick={addDefaultSizes} variant="outline">
            Add Default Sizes (S, M, L, XL)
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {localVariants.map((variant, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`size-${index}`} className="text-sm">Size</Label>
                <Input
                  id={`size-${index}`}
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  placeholder="e.g., S, M, L, XL"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`stock-${index}`} className="text-sm">Stock Quantity</Label>
                <Input
                  id={`stock-${index}`}
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                onClick={() => removeVariant(index)}
                variant="destructive"
                size="sm"
                className="mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {localVariants.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Total Stock:</strong> {localVariants.reduce((sum, v) => sum + v.stock, 0)} units across {localVariants.length} variants
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductVariantsForm;
