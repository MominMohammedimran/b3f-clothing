
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/lib/types';
import ProductVariantsForm from './ProductVariantsForm';

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
  const [formData, setFormData] = useState<Product>(product);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    // Initialize variants from product data
    if (product.variants && Array.isArray(product.variants)) {
      setVariants(product.variants);
    } else if (product.sizes && Array.isArray(product.sizes)) {
      // Convert old sizes to variants format
      const defaultVariants = product.sizes.map(size => ({
        size,
        stock: Math.floor(product.stock / product.sizes.length) || 0
      }));
      setVariants(defaultVariants);
    } else {
      setVariants([]);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'discountPercentage' || name === 'stock'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [name]: arrayValue
    }));
  };

  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
    
    // Update sizes and total stock based on variants
    const sizes = newVariants.map(v => v.size);
    const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
    
    setFormData(prev => ({
      ...prev,
      sizes,
      stock: totalStock,
      variants: newVariants
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure variants are included in the final product data
    const finalProduct = {
      ...formData,
      variants,
      sizes: variants.map(v => v.size),
      stock: variants.reduce((sum, v) => sum + v.stock, 0)
    };
    
    onSave(finalProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="code">Product Code</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="originalPrice">Original Price (₹)</Label>
          <Input
            id="originalPrice"
            name="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.originalPrice || formData.price}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="discountPercentage">Discount (%)</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.discountPercentage || 0}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="image">Main Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <Label htmlFor="images">Additional Images (comma-separated URLs)</Label>
        <Input
          id="images"
          name="images"
          value={formData.images?.join(', ') || ''}
          onChange={(e) => handleArrayChange('images', e.target.value)}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => handleArrayChange('tags', e.target.value)}
          placeholder="featured, new, sale"
        />
      </div>

      <ProductVariantsForm 
        variants={variants}
        onVariantsChange={handleVariantsChange}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product.id ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductEditForm;
