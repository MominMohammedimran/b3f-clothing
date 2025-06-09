
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
  stock?: number;
  metadata?: {
    inventory?: {
      quantities?: Record<string, number>;
      [key: string]: any;
    };
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

      // Check if product has metadata with inventory field
      if (typedProduct && 'metadata' in typedProduct && typedProduct.metadata) {
        try {
          let metadata;
          // If metadata is a string, parse it
          if (typeof typedProduct.metadata === 'string') {
            metadata = JSON.parse(typedProduct.metadata);
          } else {
            metadata = typedProduct.metadata;
          }
          
          if (metadata && metadata.inventory && metadata.inventory.quantities) {
            inventoryData.quantities = metadata.inventory.quantities;
          }
        } catch (parseError) {
          console.error('Error parsing metadata:', parseError);
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

      // Prepare the metadata with inventory data
      let currentMetadata = {};
      if (typedProduct.metadata) {
        currentMetadata = typeof typedProduct.metadata === 'string' 
          ? JSON.parse(typedProduct.metadata) 
          : typedProduct.metadata;
      }

      const updatedMetadata = {
        ...currentMetadata,
        inventory: {
          ...((currentMetadata as any)?.inventory || {}),
          ...data
        }
      };

      // Update the product with new metadata - use description field for metadata storage
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          description: JSON.stringify(updatedMetadata),
          updated_at: new Date().toISOString(),
          productId: product.productId || `prod-${Date.now()}` // Add required productId
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
