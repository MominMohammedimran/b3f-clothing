import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductVariant {
  size: string;
  stock: number;
}

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    code: product.code || '',
    description: product.description || '',
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    discountPercentage: product.discountPercentage || 0,
    category: product.category || '',
    image: product.image || '',
    images: product.images || [],
    tags: product.tags || [],
    stock: product.stock || 0,
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product?.id) return;

      const { data, error } = await supabase
        .from('products')
        .select('variants')
        .eq('id', product.id)
        .single();

      if (error) {
        console.error('Error fetching variants:', error);
        return;
      }

      let parsedVariants: ProductVariant[] = [];

      if (data?.variants && Array.isArray(data.variants)) {
        parsedVariants = data.variants.filter(
          (v) => typeof v?.size === 'string' && typeof v?.stock === 'number'
        );
      }

      setVariants(parsedVariants.length > 0 ? parsedVariants : [{ size: '', stock: 0 }]);
    };

    fetchVariants();
  }, [product.id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', stock: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      handleInputChange('images', [...formData.images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    handleInputChange(
      'images',
      formData.images.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange(
      'tags',
      formData.tags.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedVariants = variants.filter((v) => v.size && v.stock >= 0);
    const totalStock = cleanedVariants.reduce((sum, v) => sum + v.stock, 0);

    const productToSave: Product = {
      ...product,
      ...formData,
      stock: totalStock,
      variants: cleanedVariants,
    };

    onSave(productToSave);
  };

  const isInvalidVariant = variants.some((v) => !v.size || v.stock < 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="code">Product Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Discount %</Label>
              <Input id="discountPercentage" type="number" value={formData.discountPercentage} onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="image">Main Image URL</Label>
            <Input id="image" value={formData.image} onChange={(e) => handleInputChange('image', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Variants & Stock (fetched from DB)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={addVariant} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Size Variant
          </Button>

          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded">
                <div className="flex-1">
                  <Label>Size</Label>
                  <Input value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} placeholder="e.g., S, M, L, XL" />
                </div>
                <div className="flex-1">
                  <Label>Stock</Label>
                  <Input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)} min="0" />
                </div>
                <Button type="button" variant="destructive" onClick={() => removeVariant(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {variants.length > 0 && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800">
                Total Stock: {variants.reduce((sum, v) => sum + v.stock, 0)} units
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isInvalidVariant}>Save Product</Button>
      </div>
    </form>
  );
};

export default ProductEditForm;
