
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

// Extended Product interface for file uploads
interface ProductWithFiles extends Product {
  mainImageFile?: File;
  additionalImageFiles?: File[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductWithFiles>({...product});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  
  useEffect(() => {
    // Initialize product data when component mounts or product changes
    setFormData({
      ...product,
      originalPrice: product.originalPrice || product.price,
      discountPercentage: product.discountPercentage || 0,
      stock: product.stock || 0,
      sizes: product.sizes || [],
      tags: product.tags || [],
      images: product.images || [],
    });
  }, [product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'discountPercentage' || name === 'stock' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
    
    // Clear error for category
    if (errors.category) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleSizesChange = (sizes: string[]) => {
    setFormData(prev => ({
      ...prev,
      sizes
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };
  
  const handleMainImageChange = (file: File) => {
    setMainImageFile(file);
    // Create a temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      image: imageUrl,
      mainImageFile: file // Add the file to formData
    }));
  };
  
  const handleAdditionalImagesChange = (files: File[]) => {
    setAdditionalImageFiles(prev => [...prev, ...files]);
    
    // Update the form data with the additional image files
    setFormData(prev => ({
      ...prev,
      additionalImageFiles: [...(prev.additionalImageFiles || []), ...files]
    }));
  };
  
  const handleRemoveAdditionalImage = (index: number) => {
    // Remove from the additionalImageFiles array
    setAdditionalImageFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    // Also remove from the images array in formData
    setFormData(prev => {
      const updatedImages = [...(prev.images || [])];
      updatedImages.splice(index, 1);
      
      return {
        ...prev,
        images: updatedImages,
        additionalImageFiles: prev.additionalImageFiles?.filter((_, i) => i !== index)
      };
    });
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.code?.trim()) {
      newErrors.code = "Product code is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // We can safely pass formData as it now includes mainImageFile property
      onSave(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <ProductBasicInfo 
        name={formData.name || ''}
        code={formData.code || ''}
        category={formData.category || ''}
        price={formData.price || 0}
        errors={errors}
        onChange={handleChange}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Product Images Section */}
      <ProductImages
        mainImage={formData.image || ''}
        additionalImages={formData.images || []}
        onMainImageChange={handleMainImageChange}
        onAdditionalImagesChange={handleAdditionalImagesChange}
        onRemoveAdditionalImage={handleRemoveAdditionalImage}
      />
      
      {/* Inventory & Pricing Section */}
      <ProductInventoryInfo 
        originalPrice={formData.originalPrice || formData.price || 0}
        discountPercentage={formData.discountPercentage || 0}
        stock={formData.stock || 0}
        onChange={handleChange}
      />
      
      {/* Variants Section */}
      <ProductVariants 
        sizes={formData.sizes || []}
        tags={formData.tags || []}
        onSizesChange={handleSizesChange}
        onTagsChange={handleTagsChange}
      />
      
      {/* Description Section */}
      <ProductDescription 
        description={formData.description || ''}
        onChange={handleChange}
      />
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
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
