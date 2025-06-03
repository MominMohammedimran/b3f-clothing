import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SizeInventory {
  [productType: string]: {
    [size: string]: number;
  };
}

export const useDesignToolInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<SizeInventory>({
    tshirt: { S: 10, M: 10, L: 10, XL: 10 },
    mug: { Standard: 10 },
    cap: { Standard: 10 }
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch product inventory data
  const fetchProductInventory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'inventory');
      
      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      const inventory: SizeInventory = {
        tshirt: { S: 10, M: 10, L: 10, XL: 10 },
        mug: { Standard: 10 },
        cap: { Standard: 10 }
      };
      
      if (data && data.length > 0) {
        data.forEach((item: any) => {
          const [productType, size] = (item.name || '').split('_');
          if (productType && inventory[productType] && size) {
            inventory[productType][size] = item.stock || 0;
          }
        });
      }
      
      setSizeInventory(inventory);
    } catch (error) {
      console.error('Error fetching product inventory:', error);
      if (!error?.message?.includes('does not exist')) {
        toast.error('Failed to load product inventory data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Update product inventory
  const updateInventory = async (
    productType: string, 
    size: string, 
    quantityChange: number
  ): Promise<boolean> => {
    try {
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const newQuantity = Math.max(0, currentQuantity + quantityChange);
      const inventoryName = `${productType}_${size}`;
      const productId = `inv-${productType}-${size}`; // ✅ Fix added here
      
      const { data: existingItem, error: checkError } = await supabase
        .from('products')
        .select('id, stock')
        .eq('category', 'inventory')
        .eq('name', inventoryName)
        .maybeSingle();

      if (checkError && !checkError.message.includes('does not exist')) {
        throw checkError;
      }

      let success = false;
      
      if (existingItem) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            productId,
            stock: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);
          
        success = !updateError;
        if (updateError) {
          console.error('Update error:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            name: inventoryName,
            category: 'inventory',
            stock: newQuantity,
            price: 0,
            original_price: 0,
            code: `INV-${productType.toUpperCase()}-${size}`,
            productId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        success = !insertError;
        if (insertError) {
          console.error('Insert error:', insertError);
        }
      }
      
      if (success) {
        setSizeInventory(prev => ({
          ...prev,
          [productType]: {
            ...prev[productType],
            [size]: newQuantity
          }
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Error updating inventory:', error);
      return false;
    }
  };
  
  useEffect(() => {
    fetchProductInventory();
  }, []);
  
  return {
    sizeInventory,
    fetchProductInventory,
    updateInventory,
    loading
  };
};
