
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

  const updateInventory = useCallback(async (productId: string, size: string, quantityChange: number) => {
    try {
      const productCodes = {
        'tshirt': ['TSHIRT001', 'TSHIRT_PRINT'],
        'mug': ['MUG001', 'MUG_PRINT'],
        'cap': ['CAP001', 'CAP_PRINT']
      };

      const codes = productCodes[productId as keyof typeof productCodes] || [productId.toUpperCase()];
      
      let updated = false;
      
      for (const code of codes) {
        const { data: products, error: fetchError } = await supabase
          .from('products')
          .select('id, variants')
          .ilike('code', code)
          .limit(1);

        if (fetchError || !products || products.length === 0) continue;

        const product = products[0];
        const productData = product as any;
        let variants = Array.isArray(productData.variants) ? [...productData.variants] : [];
        
        const variantIndex = variants.findIndex((v: any) => 
          v.size?.toLowerCase() === size.toLowerCase()
        );
        
        if (variantIndex >= 0) {
          variants[variantIndex].stock = Math.max(0, variants[variantIndex].stock + quantityChange);
        } else {
          variants.push({
            size: size.toLowerCase(),
            stock: Math.max(0, quantityChange)
          });
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            variants: variants,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', product.id);

        if (!updateError) {
          updated = true;
          break;
        }
      }

      if (updated) {
        setSizeInventory(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            [size.toLowerCase()]: Math.max(0, (prev[productId]?.[size.toLowerCase()] || 0) + quantityChange)
          }
        }));
        return true;
      } else {
        throw new Error('No matching product found for inventory update');
      }
      
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
