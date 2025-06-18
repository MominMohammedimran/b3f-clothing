
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Undo2, Redo2, Trash2 } from 'lucide-react';

interface DesignToolQuantitySelectorProps {
  selectedSizes: string[];
  quantities: Record<string, number>;
  availableSizes: string[];
  onSizeToggle: (size: string) => void;
  onQuantityChange: (size: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalQuantity: () => number;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const DesignToolQuantitySelector: React.FC<DesignToolQuantitySelectorProps> = ({
  selectedSizes,
  quantities,
  availableSizes,
  onSizeToggle,
  onQuantityChange,
  getTotalPrice,
  getTotalQuantity,
  onUndo,
  onRedo,
  onClear,
  canUndo = false,
  canRedo = false
}) => {
  return (
    <div className="space-y-6">
      {/* Design Actions */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-2"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-2"
        >
          <Redo2 className="h-4 w-4" />
          Redo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Size Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Sizes</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {availableSizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              className="h-12"
              onClick={() => onSizeToggle(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity Controls */}
      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Quantities</h3>
          <div className="space-y-3">
            {selectedSizes.map((size) => (
              <div key={size} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Size {size}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(size, (quantities[size] || 1) - 1)}
                    disabled={(quantities[size] || 1) <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="bg-white border rounded px-3 py-1 min-w-[60px] text-center">
                    <span className="font-semibold">{quantities[size] || 1}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(size, (quantities[size] || 1) + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Quantity:</span>
          <span className="font-bold">{getTotalQuantity()}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">Total Price:</span>
          <span className="font-bold text-blue-600">₹{getTotalPrice()}</span>
        </div>
      </div>
    </div>
  );
};

export default DesignToolQuantitySelector;
