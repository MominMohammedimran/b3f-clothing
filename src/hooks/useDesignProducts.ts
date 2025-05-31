
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DesignProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  code: string;
}

export const useDesignProducts = () => {
  const [products, setProducts] = useState<Record<string, DesignProduct>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products that contain "print" in their code
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, code')
        .ilike('code', '%print%')
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        // Transform the data into the format expected by the design tool
        const productsMap: Record<string, DesignProduct> = {};
        
        data.forEach((product) => {
          // Create a key based on the product type (extracted from code)
          let key = 'tshirt'; // default
          if (product.code?.toLowerCase().includes('mug')) {
            key = 'mug';
          } else if (product.code?.toLowerCase().includes('cap')) {
            key = 'cap';
          } else if (product.code?.toLowerCase().includes('tshirt') || product.code?.toLowerCase().includes('shirt')) {
            key = 'tshirt';
          }

          productsMap[key] = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-print.webp',
            code: product.code
          };
        });

        setProducts(productsMap);
      } else {
        // Fallback to default products if no database products found
        setProducts({
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
      }
    } catch (err) {
      console.error('Error fetching design products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      toast.error('Failed to load products');
      
      // Fallback to default products on error
      setProducts({
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
          image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public//design-tool-page/mug-print.webp',
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
    } finally {
      setLoading(false);
    }
  };

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
