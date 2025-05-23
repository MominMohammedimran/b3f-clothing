
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InventoryData {
  quantities: Record<string, number>;
  product_type?: string;
  [key: string]: any;
}

interface UseProductInventoryReturn {
  inventory: InventoryData | null;
  loading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  updateInventory: (data: Partial<InventoryData>) => Promise<void>;
}

// Define a more specific type for the product that includes the properties we need to access
interface ProductWithInventory {
  id: string;
  product_type?: string;
  inventory?: {
    quantities?: Record<string, number>;
    [key: string]: any;
  } | string;
  [key: string]: any; // Allow other properties
}

export const useProductInventory = (productId?: string): UseProductInventoryReturn => {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async (): Promise<void> => {
    if (!productId) {
      setInventory({ quantities: {} });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch product data to get inventory information
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (productError) {
        throw new Error(`Error fetching product: ${productError.message}`);
      }

      // Handle case where product doesn't exist or inventory is null
      if (!product) {
        setInventory({ quantities: {} });
        return;
      }

      // Cast the product to our more specific type
      const typedProduct = product as unknown as ProductWithInventory;

      // Extract inventory data with fallback
      const inventoryData: InventoryData = {
        quantities: {},
        product_type: typedProduct.product_type || ''
      };

      // Check if product has inventory field, safely
      if (typedProduct && 'inventory' in typedProduct && typedProduct.inventory) {
        try {
          // If inventory is a string, parse it
          if (typeof typedProduct.inventory === 'string') {
            const parsedInventory = JSON.parse(typedProduct.inventory);
            inventoryData.quantities = parsedInventory.quantities || {};
          } 
          // If inventory is an object
          else if (typeof typedProduct.inventory === 'object') {
            const inventoryObj = typedProduct.inventory as { quantities?: Record<string, number> };
            inventoryData.quantities = inventoryObj.quantities || {};
          }
        } catch (parseError) {
          console.error('Error parsing inventory:', parseError);
          inventoryData.quantities = {};
        }
      }

      setInventory(inventoryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching inventory';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (data: Partial<InventoryData>): Promise<void> => {
    if (!productId) {
      toast.error('Cannot update inventory: Product ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Error fetching product: ${fetchError.message}`);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Cast the product to our more specific type
      const typedProduct = product as unknown as ProductWithInventory;

      // Prepare the inventory data to update
      // If product has existing inventory, merge with new data
      let inventoryToUpdate: InventoryData = {
        quantities: data.quantities || {}
      };

      // Check if product has inventory field, safely
      if (typedProduct && 'inventory' in typedProduct && typedProduct.inventory) {
        const currentInventory = typeof typedProduct.inventory === 'string' 
          ? JSON.parse(typedProduct.inventory) 
          : typedProduct.inventory;

        inventoryToUpdate = {
          ...currentInventory,
          ...data
        };
      }

      // Update the product with new inventory
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          inventory: inventoryToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) {
        throw new Error(`Error updating inventory: ${updateError.message}`);
      }

      // Update local state
      setInventory(prevInventory => ({
        ...prevInventory || { quantities: {} },
        ...data
      }));

      console.log('Inventory updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating inventory';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory data when productId changes
  useEffect(() => {
    if (productId) {
      fetchInventory();
    } else {
      setInventory({ quantities: {} });
    }
  }, [productId]);

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    updateInventory
  };
};
