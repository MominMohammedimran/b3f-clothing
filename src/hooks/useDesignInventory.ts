
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductInventory {
  id: string;
  name: string;
  sizes: string[];
  stock: number;
  price: number;
  variants: Array<{
    size: string;
    stock: number;
  }>;
}

export const useDesignInventory = () => {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sizes, stock, price, variants')
        .order('name');

      if (error) throw error;

      const formattedProducts = data?.map(product => {
        let variants: Array<{size: string; stock: number}> = [];
        
        // Parse variants safely
        if (product.variants) {
          try {
            if (typeof product.variants === 'string') {
              variants = JSON.parse(product.variants);
            } else if (Array.isArray(product.variants)) {
              // Type cast and validate each variant
              variants = (product.variants as any[]).filter(v => 
                v && typeof v === 'object' && 
                typeof v.size === 'string' && 
                typeof v.stock === 'number'
              ).map(v => ({
                size: v.size as string,
                stock: v.stock as number
              }));
            }
          } catch (parseError) {
            console.error('Error parsing variants for product:', product.id, parseError);
            variants = [];
          }
        }

        return {
          id: product.id,
          name: product.name,
          sizes: Array.isArray(product.sizes) ? product.sizes.filter(size => typeof size === 'string') : [],
          stock: product.stock || 0,
          price: product.price,
          variants
        };
      }) || [];

      setProducts(formattedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};