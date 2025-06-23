
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Variant {
  size: string;
  stock: number;
}

interface UseProductInventoryReturn {
  variants: Variant[];
  inventory: { quantities: Record<string, number> } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  updateInventory: (data: { quantities: Record<string, number> }) => Promise<void>;
}

export const useProductInventory = (productId?: string): UseProductInventoryReturn => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [inventory, setInventory] = useState<{ quantities: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!productId) {
      setVariants([]);
      setInventory(null);
      return;
    }

    try {
      setLoading(true);
      const { data: product, error } = await supabase
        .from('products')
        .select('variants')
        .eq('id', productId)
        .maybeSingle();

      if (error) throw error;

      let rawVariants = product?.variants;
      let parsedVariants: Variant[] = [];

      if (typeof rawVariants === 'string') {
        // Handle JSON string format
        try {
          parsedVariants = JSON.parse(rawVariants);
        } catch (e) {
          console.error('Error parsing variants JSON string:', e);
          parsedVariants = [];
        }
      } else if (Array.isArray(rawVariants)) {
        // Handle array of objects (possibly Json[])
        parsedVariants = rawVariants as any[];
      } else {
        parsedVariants = [];
      }

      const cleanVariants = parsedVariants
        .filter(
          (v): v is Variant =>
            typeof v === 'object' &&
            typeof v.size === 'string' &&
            !isNaN(Number(v.stock))
        )
        .map((v) => ({
          size: v.size,
          stock: Number(v.stock),
        }));

      setVariants(cleanVariants);
      
      // Create inventory object from variants
      const quantities: Record<string, number> = {};
      cleanVariants.forEach(variant => {
        quantities[variant.size.toLowerCase()] = variant.stock;
      });
      
      setInventory({ quantities });
    } catch (err: any) {
      const message = err.message || 'Failed to load product inventory';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (data: { quantities: Record<string, number> }) => {
    if (!productId) return;

    try {
      // Convert quantities back to variants format
      const updatedVariants = Object.entries(data.quantities).map(([size, stock]) => ({
        size,
        stock: Number(stock)
      }));

      const { error } = await supabase
        .from('products')
        .update({ variants: updatedVariants })
        .eq('id', productId);

      if (error) throw error;

      setInventory(data);
      setVariants(updatedVariants);
      
      toast.success('Inventory updated successfully');
    } catch (err: any) {
      const message = err.message || 'Failed to update inventory';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [productId]);

  return { 
    variants, 
    inventory, 
    loading, 
    error, 
    refetch: fetchInventory,
    fetchInventory,
    updateInventory
  };
};
