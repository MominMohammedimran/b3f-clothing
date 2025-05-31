
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getProductInventory, updateProductInventory } from '@/utils/productInventory';

export const useProductInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 10, M: 15, L: 8, XL: 5 },
    mug: { Standard: 20 },
    cap: { Standard: 12 }
  });

  const fetchProductInventory = useCallback(async () => {
    try {
      // Use our utility function to get inventory data
      const inventoryData = await getProductInventory();
      
      if (inventoryData) {
        setSizeInventory(inventoryData);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast.error('Failed to load product availability data');
    }
  }, []);

  const updateInventory = async (productType: string, size: string, change: number) => {
    try {
      // Use our utility function to update the database
      const success = await updateProductInventory(productType, size, change);
      
      if (success) {
        // Update local state
        setSizeInventory(prev => ({
          ...prev,
          [productType]: {
            ...prev[productType],
            [size]: Math.max(0, prev[productType][size] + change)
          }
        }));
      }
      
      return success;
    } catch (err) {
      console.error('Error updating inventory:', err);
      toast.error('Failed to update inventory', {
        description: 'Could not update product quantity',
      });
      return false;
    }
  };

  return {
    sizeInventory,
    fetchProductInventory,
    updateInventory
  };
};
