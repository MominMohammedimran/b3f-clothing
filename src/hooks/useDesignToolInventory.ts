
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // This function just updates local state for UI purposes
  // Actual inventory will only be updated after successful payment
  const updateInventory = useCallback(async (productId: string, size: string, quantityChange: number) => {
    setSizeInventory(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size.toLowerCase()]: Math.max(0, (prev[productId]?.[size.toLowerCase()] || 0) + quantityChange)
      }
    }));
    
    return true;
  }, []);

  return {
    sizeInventory,
    loading,
    fetchProductInventory,
    updateInventory
  };
};