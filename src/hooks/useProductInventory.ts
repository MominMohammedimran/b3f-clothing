
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductVariant {
  size: string;
  stock: number;
}

interface ProductInventory {
  quantities: Record<string, number>;
}

export const useProductInventory = (productId?: string) => {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<ProductInventory | null>(null);


  const fetchInventory = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('variants')
        .eq('id', productId)
        .single();


      if (fetchError) throw fetchError;

      const quantities: Record<string, number> = {};
      
      if (product?.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
          if (variant && typeof variant === 'object' && variant.size && typeof variant.stock === 'number') {
            quantities[variant.size] = variant.stock;
          }
        });
      }

      setInventory({ quantities });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const updateProductStock = useCallback(async (productId: string, size: string, quantityChange: number) => {
    setUpdating(true);
    try {
      // Fetch current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      let variants = Array.isArray(product.variants) ? [...product.variants] : [];
      
      const variantIndex = variants.findIndex((v: any) => 
        v && typeof v === 'object' && v.size?.toLowerCase() === size.toLowerCase()
      );
      
      if (variantIndex >= 0) {
        const variant = variants[variantIndex] as any;
        const currentStock = typeof variant.stock === 'number' ? variant.stock : 0;
        variants[variantIndex] = { ...variant, stock: Math.max(0, currentStock + quantityChange) };
      } else {
        variants.push({
          size: size.toLowerCase(),
          stock: Math.max(0, quantityChange)
        });
      }

      // Update the product in database
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          variants: variants,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      return variants;
    } catch (error) {
      console.error('Error updating product inventory:', error);
      toast.error('Failed to update product inventory');
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateInventory = useCallback(async (inventoryData: ProductInventory) => {
    if (!productId) return false;
    
    setUpdating(true);
    try {
      // Convert quantities to variants format
      const variants = Object.entries(inventoryData.quantities || {})
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => ({
          size,
          stock: qty
        }));

      const { error } = await supabase
        .from('products')
        .update({
          variants: variants,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local inventory state
      setInventory(inventoryData);
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [productId]);

  return {
    updateProductStock,
    updating,
    loading,
    error,
    inventory,
    fetchInventory,
    updateInventory
  };
};