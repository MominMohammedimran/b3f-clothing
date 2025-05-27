
import React from 'react';
import { Product } from '@/lib/types';
import ProductForm from './product/form/ProductForm';

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ product, onSave, onCancel }) => {
  return (
    <ProductForm 
      product={product}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

export default ProductEditForm;
