
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import ProductBasicInfo from './ProductBasicInfo';
import ProductInventoryInfo from './ProductInventoryInfo';
import ProductDescription from './ProductDescription';
import ProductVariants from './ProductVariants';
import ProductImages from './ProductImages';

interface ProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

// Extended Product interface for the form
interface ProductFormData extends Product {
  sizeQuantities: Record<string, number>;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    ...product,
    sizeQuantities: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize size quantities from stock or sizes array
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      const quantities: Record<string, number> = {};
      product.sizes.forEach(size => {
        quantities[size] = product.stock || 0;
      });
      setFormData(prev => ({ ...prev, sizeQuantities: quantities }));
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Calculate total stock from size quantities
    const totalStock = Object.values(formData.sizeQuantities).reduce((sum, qty) => sum + qty, 0);

    // Convert size quantities to storage format (e.g., "S:5,M:4,L:3")
    const sizeQuantityString = Object.entries(formData.sizeQuantities)
      .map(([size, qty]) => `${size}:${qty}`)
      .join(',');

    const productToSave: Product = {
      ...formData,
      stock: totalStock,
      // Store size quantities in a custom field if needed, or handle in parent component
    };

    onSave(productToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductBasicInfo
        name={formData.name}
        code={formData.code}
        category={formData.category}
        onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
        onCodeChange={(code) => setFormData(prev => ({ ...prev, code }))}
        onCategoryChange={(category) => setFormData(prev => ({ ...prev, category }))}
        errors={errors}
      />

      <ProductImages
        mainImage={formData.image}
        additionalImages={formData.images || []}
        onMainImageChange={(image) => setFormData(prev => ({ ...prev, image }))}
        onAdditionalImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
      />

      <ProductInventoryInfo
        price={formData.price}
        originalPrice={formData.originalPrice}
        discountPercentage={formData.discountPercentage}
        onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
        onOriginalPriceChange={(originalPrice) => setFormData(prev => ({ ...prev, originalPrice }))}
        onDiscountPercentageChange={(discountPercentage) => setFormData(prev => ({ ...prev, discountPercentage }))}
        errors={errors}
      />

      <ProductVariants
        sizes={formData.sizes || []}
        sizeQuantities={formData.sizeQuantities}
        onSizesChange={(sizes) => setFormData(prev => ({ ...prev, sizes }))}
        onSizeQuantitiesChange={(sizeQuantities) => setFormData(prev => ({ ...prev, sizeQuantities }))}
      />

      <ProductDescription
        description={formData.description || ''}
        tags={formData.tags || []}
        onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
        onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
      />

      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Product
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
