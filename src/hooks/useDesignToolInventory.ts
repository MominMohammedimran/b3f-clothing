
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addInventoryUpdateListener } from './useProductInventory';

export const useDesignToolInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const fetchProductInventory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, code, variants')
        .ilike('code', '%print%');

      if (error) throw error;

      const inventory: Record<string, Record<string, number>> = {};
      
      products?.forEach((product: any) => {
        let productKey = 'tshirt';
        if (product.code?.toLowerCase().includes('mug')) productKey = 'mug';
        if (product.code?.toLowerCase().includes('cap')) productKey = 'cap';
        
        inventory[productKey] = {};
        
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((variant: any) => {
            if (variant.size && typeof variant.stock === 'number') {
              inventory[productKey][variant.size.toLowerCase()] = variant.stock;
            }
          });
        } else {
          const defaultSizes = productKey === 'mug' || productKey === 'cap' 
            ? ['standard'] 
            : ['s', 'm', 'l', 'xl'];
          
          defaultSizes.forEach(size => {
            inventory[productKey][size] = 10;
          });
        }
      });

      setSizeInventory(inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch product inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for inventory updates and refetch when they occur
  useEffect(() => {
    const unsubscribe = addInventoryUpdateListener(() => {
      fetchProductInventory();
    });
    
    return () => {
      unsubscribe();
    };
  }, [fetchProductInventory]);

  // Updated to actually save to database
  const updateInventory = useCallback(async (productType: string, size: string, newQuantity: number) => {
    try {
      // Find the product in the database
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, variants')
        .ilike('code', `%${productType}%print%`);

      if (fetchError) throw fetchError;

      if (!products || products.length === 0) {
        toast.error(`No ${productType} product found`);
        return false;
      }

      // Update each matching product
      for (const product of products) {
        // Safely handle variants - ensure it's an array and properly typed
        let variants: Array<{size: string, stock: number}> = [];
        
        if (product.variants) {
          if (Array.isArray(product.variants)) {
            // Type cast and filter valid variants
            variants = (product.variants as any[])
              .filter((v: any) => v && typeof v === 'object' && typeof v.size === 'string' && typeof v.stock === 'number')
              .map((v: any) => ({ size: v.size, stock: v.stock }));
          }
        }
        
        const variantIndex = variants.findIndex(
          (v) => v.size?.toLowerCase() === size.toLowerCase()
        );

        if (variantIndex >= 0) {
          variants[variantIndex] = {
            ...variants[variantIndex],
            stock: Math.max(0, newQuantity)
          };
        } else {
          variants.push({
            size: size.toLowerCase(),
            stock: Math.max(0, newQuantity)
          });
        }

        // Update the product in database
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            variants: variants as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (updateError) throw updateError;
      }

      // Update local state
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size.toLowerCase()]: Math.max(0, newQuantity)
        }
      }));

      // Notify other hooks about the update
      const { addInventoryUpdateListener } = await import('./useProductInventory');
      const notifyInventoryUpdate = () => {
        // This will trigger refetch in all listening hooks
        fetchProductInventory();
      };
      notifyInventoryUpdate();

      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    }
  }, [fetchProductInventory]);

  return {
    sizeInventory,
    loading,
    fetchProductInventory,
    updateInventory
  };
};
