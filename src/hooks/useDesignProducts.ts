import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DesignProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  code: string;
  variants?: { size: string; stock: number }[];
}

export const useDesignProducts = () => {
  const [products, setProducts] = useState<Record<string, DesignProduct>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, code, variants')
        .ilike('code', '%print%')
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const productsMap: Record<string, DesignProduct> = {};

        data.forEach((product) => {
          let key = 'tshirt';
          if (product.code?.toLowerCase().includes('mug')) key = 'mug';
          else if (product.code?.toLowerCase().includes('cap')) key = 'cap';
          else if (product.code?.toLowerCase().includes('tshirt') || product.code?.toLowerCase().includes('shirt')) key = 'tshirt';

          productsMap[key] = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-print.webp',
            code: product.code,
            variants: Array.isArray(product.variants) ? (product.variants as {size :string; stock:number}  []):[]
          };
        });

        setProducts(productsMap);
      } else {
        setProducts(getDefaultProducts());
      }
    } catch (err) {
      console.error('Error fetching design products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      toast.error('Failed to load products');
      setProducts(getDefaultProducts());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultProducts = (): Record<string, DesignProduct> => ({
    tshirt: {
      id: 'default-tshirt',
      name: 'T-shirt',
      price: 200,
      image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-print.webp',
      code: 'TSHIRT_PRINT'
    },
    mug: {
      id: 'default-mug',
      name: 'Mug',
      price: 200,
      image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/mug-print.webp',
      code: 'MUG_PRINT'
    },
    cap: {
      id: 'default-cap',
      name: 'Cap',
      price: 150,
      image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/cap-print.webp',
      code: 'CAP_PRINT'
    }
  });

  useEffect(() => {
    fetchDesignProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchDesignProducts
  };
};
