
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Trash2 } from 'lucide-react';
import { useProductInventory } from '@/hooks/useProductInventory';
import { toast } from 'sonner';

interface ProductInventoryManagerProps {
  productId: string | undefined;
  onInventoryChange?: (inventory: any) => void;
}

const ProductInventoryManager = ({ productId, onInventoryChange }: ProductInventoryManagerProps) => {
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const { 
    inventory,
    loading,
    error,
    fetchInventory,
    updateInventory
  } = useProductInventory(productId);

  useEffect(() => {
    if (productId) {
      fetchInventory();
    }
  }, [productId]);

  useEffect(() => {
    if (inventory && !loading && initialLoad) {
      const inventorySizes = Object.keys(inventory?.quantities || {});
      setSizes(inventorySizes || []);
      setQuantities(inventory?.quantities || {});
      setInitialLoad(false);
    }
  }, [inventory, loading, initialLoad]);

  const handleAddSize = () => {
    if (!newSize.trim()) {
      toast.error("Size cannot be empty");
      return;
    }

    if (sizes.includes(newSize.trim())) {
      toast.error("This size already exists");
      return;
    }

    setSizes([...sizes, newSize.trim()]);
    setQuantities({ ...quantities, [newSize.trim()]: 0 });
    setNewSize('');

    // Only update in database if product ID exists
    if (productId && !initialLoad) {
      const updatedQuantities = { ...quantities, [newSize.trim()]: 0 };
      
      updateInventory({
        quantities: updatedQuantities
      });

      if (onInventoryChange) {
        onInventoryChange({
          quantities: updatedQuantities
        });
      }
    }
  };

  const handleRemoveSize = (size: string) => {
    const newSizes = sizes.filter(s => s !== size);
    const newQuantities = { ...quantities };
    delete newQuantities[size];

    setSizes(newSizes);
    setQuantities(newQuantities);

    // Only update in database if product ID exists
    if (productId && !initialLoad) {
      updateInventory({
        quantities: newQuantities
      });

      if (onInventoryChange) {
        onInventoryChange({
          quantities: newQuantities
        });
      }
    }
  };

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity < 0) return;
    
    setQuantities({ ...quantities, [size]: quantity });
  };

  const handleQuantityUpdate = () => {
    if (productId && !initialLoad) {
      updateInventory({
        quantities: quantities
      });

      if (onInventoryChange) {
        onInventoryChange({
          quantities: quantities
        });
      }
      
      setIsEditing(false);
      toast.success("Inventory quantities updated");
    }
  };

  const handleQuantityBlur = () => {
    if (isEditing) {
      handleQuantityUpdate();
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading inventory...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading inventory: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sizes & Inventory</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              <X size={16} className="mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleQuantityUpdate}>
              <Check size={16} className="mr-1" /> Save
            </Button>
          </div>
        ) : (
          sizes.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Edit Quantities
            </Button>
          )
        )}
      </div>

      {sizes.length > 0 ? (
        <div className="grid gap-4">
          {sizes.map((size) => (
            <div key={size} className="flex items-center justify-between gap-2 border p-2 rounded-md">
              <span className="font-medium w-20">{size}</span>
              <div className="flex items-center gap-2 grow">
                <Label htmlFor={`quantity-${size}`} className="w-20">Quantity:</Label>
                <Input
                  id={`quantity-${size}`}
                  type="number"
                  min="0"
                  value={quantities[size] || 0}
                  onChange={(e) => {
                    handleQuantityChange(size, e.target.value);
                    setIsEditing(true);
                  }}
                  onBlur={handleQuantityBlur}
                  className="w-24"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveSize(size)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No sizes added yet. Add sizes below.</p>
      )}

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Add size (e.g. S, M, L, XL)"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSize()}
          className="flex-grow"
        />
        <Button onClick={handleAddSize}>Add Size</Button>
      </div>
    </div>
  );
};

export default ProductInventoryManager;
