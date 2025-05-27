
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface CartItemSizeSelectorProps {
  currentSize?: string;
  selectedSizes?: string[];
  availableSizes: string[];
  onSelectSize: (size: string) => void;
  onSelectMultipleSizes?: (sizes: string[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
}

const CartItemSizeSelector: React.FC<CartItemSizeSelectorProps> = ({
  currentSize,
  selectedSizes = [],
  availableSizes,
  onSelectSize,
  onSelectMultipleSizes,
  allowMultiple = false,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [localSelectedSizes, setLocalSelectedSizes] = useState<string[]>(selectedSizes);
  
  // Use default sizes if none provided
  const sizes = availableSizes?.length > 0 
    ? availableSizes 
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  const handleSizeToggle = (size: string) => {
    if (allowMultiple) {
      let newSelectedSizes: string[];
      
      if (localSelectedSizes.includes(size)) {
        // Remove size if already selected
        newSelectedSizes = localSelectedSizes.filter(s => s !== size);
      } else {
        // Add size if not already selected
        newSelectedSizes = [...localSelectedSizes, size];
      }
      
      setLocalSelectedSizes(newSelectedSizes);
      
      if (onSelectMultipleSizes) {
        onSelectMultipleSizes(newSelectedSizes);
      }
    } else {
      // Single size selection mode
      onSelectSize(size);
      setOpen(false);
    }
  };
  
  const displayText = allowMultiple 
    ? localSelectedSizes.length > 0 
      ? `${localSelectedSizes.length} size${localSelectedSizes.length > 1 ? 's' : ''} selected` 
      : 'Select Sizes'
    : currentSize || 'Select Size';
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 border-dashed flex justify-between gap-1 w-full max-w-[180px]"
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className={`${allowMultiple ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-1 p-1`}>
          {sizes.map((size) => (
            <Button
              key={size}
              variant="ghost"
              className={`justify-start font-normal ${
                (allowMultiple ? localSelectedSizes.includes(size) : currentSize === size) 
                  ? "bg-gray-100" 
                  : ""
              }`}
              onClick={() => handleSizeToggle(size)}
            >
              {allowMultiple ? (
                <div className="flex items-center w-full">
                  <Checkbox 
                    checked={localSelectedSizes.includes(size)}
                    className="mr-2 h-4 w-4"
                  />
                  <span>{size}</span>
                </div>
              ) : (
                <>
                  {currentSize === size && <Check className="mr-2 h-4 w-4" />}
                  {size}
                </>
              )}
            </Button>
          ))}
        </div>
        
        {allowMultiple && (
          <div className="border-t p-2 flex justify-end">
            <Button 
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CartItemSizeSelector;
