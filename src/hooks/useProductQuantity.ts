
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductQuantity {
  [size: string]: number;
}

export const useProductQuantity = (productId?: string) => {
  const [quantities, setQuantities] = useState<ProductQuantity>({});
  const [loading, setLoading] = useState(false);

  const fetchProductQuantity = async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Try to get from products table directly
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock, sizes')
        .eq('id', id)
        .single();
      
      if (productError) {
        console.error('Error fetching product:', productError);
      }
      
      if (productData) {
        // If the product has sizes array, create quantity map
        if (productData.sizes && Array.isArray(productData.sizes)) {
          const quantityMap: ProductQuantity = {};
          productData.sizes.forEach((size: string) => {
            quantityMap[size] = productData.stock || 0;
          });
          setQuantities(quantityMap);
        } else {
          // Default single size with stock
          setQuantities({
            'Standard': productData.stock || 0
          });
        }
        return;
      }
      
      // Fallback: Default quantities if no data found
      setQuantities({
        'S': 10,
        'M': 10,
        'L': 10,
        'XL': 10
      });
      
    } catch (error) {
      console.error('Error fetching product quantity:', error);
      // Fallback quantities on error
      setQuantities({
        'S': 10,
        'M': 10,
        'L': 10,
        'XL': 10
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductQuantity(productId);
    }
  }, [productId]);

  return {
    quantities,
    loading,
    refetch: () => productId && fetchProductQuantity(productId)
  };
};
