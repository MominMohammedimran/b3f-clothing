
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: '', name: 'All Products' },
  { id: 'tshirt', name: 'T-Shirts' },
  { id: 'hoodie', name: 'Hoodies' },
  { id: 'mug', name: 'Mugs' },
  { id: 'cap', name: 'Caps' },
];

const ProductFilters: React.FC<ProductFiltersProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
