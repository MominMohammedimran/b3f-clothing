
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
      
      // Fetch inventory data from products table
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'inventory');
      
      if (error) throw error;
      
      // Format the inventory data
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
      toast.error('Failed to load product inventory data');
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
      // Get current quantity
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const newQuantity = currentQuantity + quantityChange;
      
      if (newQuantity < 0) {
        toast.error(`Cannot set negative inventory for ${productType} size ${size}`);
        return false;
      }
      
      // Update in database
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newQuantity })
        .eq('category', 'inventory')
        .eq('name', `${productType}_${size}`);
      
      if (error) throw error;
      
      // Update local state
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: newQuantity
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    }
  };
  
  // Load inventory data on component mount
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
