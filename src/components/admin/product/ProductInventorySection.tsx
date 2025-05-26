import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  size: string;
  quantity: number;
}

interface ProductInventorySectionProps {
  onInventoryChange?: (inventory: InventoryItem[]) => void;
  initialInventory?: InventoryItem[];
}

const ProductInventorySection: React.FC<ProductInventorySectionProps> = ({
  onInventoryChange,
  initialInventory = []
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [newSize, setNewSize] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);

  const handleAddInventory = () => {
    if (!newSize.trim()) {
      toast.error('Please enter a size');
      return;
    }

    if (inventory.some(item => item.size === newSize.trim())) {
      toast.error('This size already exists');
      return;
    }

    const newInventory = [...inventory, { size: newSize.trim(), quantity: newQuantity }];
    setInventory(newInventory);
    setNewSize('');
    setNewQuantity(0);
    
    if (onInventoryChange) {
      onInventoryChange(newInventory);
    }
  };

  const handleRemoveInventory = (index: number) => {
    const newInventory = inventory.filter((_, i) => i !== index);
    setInventory(newInventory);
    
    if (onInventoryChange) {
      onInventoryChange(newInventory);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newInventory = inventory.map((item, i) => 
      i === index ? { ...item, quantity: Math.max(0, quantity) } : item
    );
    setInventory(newInventory);
    
    if (onInventoryChange) {
      onInventoryChange(newInventory);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Add Stock</h3>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        {/* Existing Inventory */}
        {inventory.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Stock</Label>
            {inventory.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-md">
                <div className="flex-1">
                  <span className="font-medium">Size: {item.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${index}`} className="text-sm">Qty:</Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveInventory(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Inventory */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add New Size & Quantity</Label>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="size" className="text-sm">Size</Label>
              <Input
                id="size"
                placeholder="e.g., S, M, L, XL"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
              />
            </div>
            <div className="w-24">
              <Label htmlFor="quantity" className="text-sm">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <Button onClick={handleAddInventory} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventorySection;
