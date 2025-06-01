
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProductSizeManagerProps {
  productId: string;
  productName: string;
  currentInventory: Record<string, number>;
  onInventoryUpdate: (productId: string, inventory: Record<string, number>) => void;
}

const ProductSizeManager: React.FC<ProductSizeManagerProps> = ({
  productId,
  productName,
  currentInventory,
  onInventoryUpdate
}) => {
  const [inventory, setInventory] = useState<Record<string, number>>(currentInventory || {});
  const [loading, setLoading] = useState(false);

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard'];

  useEffect(() => {
    setInventory(currentInventory || {});
  }, [currentInventory]);

  const handleInventoryChange = (size: string, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setInventory(prev => {
      const prevInventory = prev || {};
      return {
        ...prevInventory,
        [size.toLowerCase()]: qty
      };
    });
  };

  const saveInventory = async () => {
    setLoading(true);
    try {
      // Format inventory as "s:5 m:8 l:10" string
      const inventoryString = Object.entries(inventory || {})
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => `${size}:${qty}`)
        .join(' ');

      console.log('Saving inventory:', inventoryString);

      // Get current inventory data
      const { data: currentData, error: fetchError } = await supabase
        .from('settings')
        .select('settings')
        .eq('type', 'product_inventory')
        .maybeSingle();

      if (fetchError && !fetchError.message.includes('No rows found')) {
        throw fetchError;
      }

      const currentSettings = (currentData?.settings as Record<string, any>) || {};
      const updatedSettings = {
        ...currentSettings,
        [productId]: inventoryString
      };

      // Upsert the inventory data
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'product_inventory',
          settings: updatedSettings as any
        });

      if (error) throw error;

      onInventoryUpdate(productId, inventory);
      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size Inventory for {productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {standardSizes.map((size) => (
            <div key={size} className="space-y-2">
              <label className="text-sm font-medium">{size}</label>
              <Input
                type="number"
                min="0"
                value={inventory[size.toLowerCase()] || 0}
                onChange={(e) => handleInventoryChange(size, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setInventory(currentInventory || {})}
          >
            Reset
          </Button>
          <Button
            onClick={saveInventory}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Inventory'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Current Inventory String:</strong>{' '}
            {Object.entries(inventory || {})
              .filter(([_, qty]) => qty > 0)
              .map(([size, qty]) => `${size}:${qty}`)
              .join(' ') || 'No inventory set'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSizeManager;