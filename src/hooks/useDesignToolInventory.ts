
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
        .in('code', ['TSHIRT001', 'MUG001', 'CAP001']);

      if (error) throw error;

      const inventory: Record<string, Record<string, number>> = {};
      
      products?.forEach((product: any) => {
        let productKey = 'tshirt';
        if (product.code?.includes('MUG')) productKey = 'mug';
        if (product.code?.includes('CAP')) productKey = 'cap';
        
        inventory[productKey] = {};
        
        // Check if variants exists and is an array
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((variant: any) => {
            if (variant.size && typeof variant.stock === 'number') {
              inventory[productKey][variant.size.toLowerCase()] = variant.stock;
            }
          });
        } else {
          // Default inventory if no variants
          const defaultSizes = productKey === 'mug' || productKey === 'cap' 
            ? ['standard'] 
            : ['s', 'm', 'l', 'xl'];
          
          defaultSizes.forEach(size => {
            inventory[productKey][size] = 10;
          });
        }
      });

      setSizeInventory(inventory);
      console.log('Fetched inventory:', inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch product inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInventory = useCallback(async (productId: string, size: string, quantityChange: number) => {
    try {
      // Get current product data
      const productCode = productId === 'tshirt' ? 'TSHIRT001' : 
                         productId === 'mug' ? 'MUG001' : 'CAP001';
      
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('variants')
        .eq('code', productCode)
        .single();

      if (fetchError) throw fetchError;

      // Ensure variants is an array - cast to any to bypass TypeScript type issues
      const productData = product as any;
      let variants = Array.isArray(productData.variants) ? [...productData.variants] : [];
      
      // Find existing variant or create new one
      const variantIndex = variants.findIndex((v: any) => 
        v.size?.toLowerCase() === size.toLowerCase()
      );
      
      if (variantIndex >= 0) {
        // Update existing variant
        variants[variantIndex].stock = Math.max(0, variants[variantIndex].stock + quantityChange);
      } else {
        // Add new variant
        variants.push({
          size: size.toLowerCase(),
          stock: Math.max(0, quantityChange)
        });
      }

      // Update database - cast to any to bypass TypeScript restrictions
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          variants: variants,
          updated_at: new Date().toISOString()
        } as any)
        .eq('code', productCode);

      if (updateError) throw updateError;

      // Update local state
      setSizeInventory(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size.toLowerCase()]: Math.max(0, (prev[productId]?.[size.toLowerCase()] || 0) + quantityChange)
        }
      }));

      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    }
  }, []);

  return {
    sizeInventory,
    loading,
    fetchProductInventory,
    updateInventory
  };
};
