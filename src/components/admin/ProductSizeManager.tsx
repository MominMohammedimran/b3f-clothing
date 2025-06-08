
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
      // Convert inventory object to variants array format
      const variants = Object.entries(inventory || {})
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => ({
          size,
          stock: qty
        }));

      console.log('Saving variants:', variants);

      const { error } = await supabase
        .from('products')
        .update({
          variants: variants,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', productId);

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
        <CardTitle className="text-lg md:text-xl">Size Inventory for {productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {standardSizes.map((size) => (
            <div key={size} className="space-y-2">
              <label className="text-sm font-medium block">{size}</label>
              <Input
                type="number"
                min="0"
                value={inventory[size.toLowerCase()] || 0}
                onChange={(e) => handleInventoryChange(size, e.target.value)}
                placeholder="0"
                className="text-center"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setInventory(currentInventory || {})}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            onClick={saveInventory}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Saving...' : 'Save Inventory'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Current Inventory:</strong>{' '}
            {Object.entries(inventory || {})
              .filter(([_, qty]) => qty > 0)
              .map(([size, qty]) => `${size.toUpperCase()}:${qty}`)
              .join(' ') || 'No inventory set'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSizeManager;