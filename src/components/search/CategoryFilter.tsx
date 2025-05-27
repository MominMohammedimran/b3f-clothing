
import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  return (
    <div className="mb-6 overflow-x-auto scrollbar-none">
      <div className="flex space-x-2 pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => onCategorySelect(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`whitespace-nowrap ${
              selectedCategory === category 
                ? "bg-yellow-300 text-blue-600 hover:bg-yellow-400" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
