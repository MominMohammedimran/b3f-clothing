
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { categories } from '@/data/products';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: string | null;
  priceRange: [number, number];
  onCategoryChange: (category: string | null) => void;
  onPriceChange: (range: [number, number]) => void;
  onFilterClear: () => void;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const ProductFilters = ({
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceChange,
  onFilterClear,
  className,
  isMobile,
  onClose
}: ProductFiltersProps) => {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onPriceChange(localPriceRange);
  };

  return (
    <div className={`${className} bg-white p-4 rounded-lg border`}>
      {isMobile && (
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-medium">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium mb-2">Categories</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="all-categories" 
                checked={selectedCategory === null}
                onCheckedChange={() => onCategoryChange(null)}
              />
              <Label htmlFor="all-categories" className="text-sm cursor-pointer">
                All Categories
              </Label>
            </div>
            
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={category.id}
                  checked={selectedCategory === category.id}
                  onCheckedChange={() => onCategoryChange(category.id)}
                />
                <Label htmlFor={category.id} className="text-sm cursor-pointer">
                  {category.name} ({category.count})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="px-2">
            <Slider
              value={[localPriceRange[0], localPriceRange[1]]}
              min={0}
              max={100}
              step={1}
              onValueChange={handlePriceChange}
              className="my-6"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}</span>
          </div>
          <Button 
            onClick={applyPriceFilter}
            variant="outline" 
            size="sm"
            className="w-full mt-2"
          >
            Apply Price
          </Button>
        </div>

        {/* Clear All Filters */}
        <Button 
          onClick={onFilterClear}
          variant="ghost" 
          size="sm"
          className="w-full mt-4 text-brand-coral hover:text-brand-coral hover:bg-red-50"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
