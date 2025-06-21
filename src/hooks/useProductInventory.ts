import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Variant {
  size: string;
  stock: number;
}

interface UseProductInventoryReturn {
  variants: Variant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProductInventory = (productId?: string): UseProductInventoryReturn => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!productId) {
      setVariants([]);
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
    } catch (err: any) {
      const message = err.message || 'Failed to load product inventory';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [productId]);

  return { variants, loading, error, refetch: fetchInventory };
};
