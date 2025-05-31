
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Update product inventory in the database
 * @param productType The product type (tshirt, mug, cap)
 * @param size The product size
 * @param change The quantity change (positive or negative)
 * @returns Promise resolving to boolean indicating success
 */
export const updateProductInventory = async (
  productType: string, 
  size: string,
  change: number
): Promise<boolean> => {
  try {
    // First, get the current stock
    const { data: currentData, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('name', `${productType}_${size}`)
      .eq('category', 'inventory')
      .single();
    
    if (fetchError) {
      console.error('Error fetching current inventory:', fetchError);
      throw fetchError;
    }
    
    const currentStock = currentData?.stock || 0;
    const newStock = Math.max(0, currentStock + change); // Ensure stock doesn't go below 0
    
    // Update the stock
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('name', `${productType}_${size}`)
      .eq('category', 'inventory');
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating product inventory:', error);
    toast.error('Inventory update failed', {
      description: 'Could not update product inventory'
    });
    return false;
  }
};

/**
 * Get the current product inventory
 * @returns Promise with inventory data
 */
export const getProductInventory = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, stock')
      .eq('category', 'inventory');
    
    if (error) throw error;
    
    // Format the inventory data
    const inventory: Record<string, Record<string, number>> = {
      tshirt: { S: 0, M: 0, L: 0, XL: 0 },
      mug: { Standard: 0 },
      cap: { Standard: 0 }
    };
    
    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const [productType, size] = item.name.split('_');
        if (
          productType && 
          inventory[productType] && 
          size
        ) {
          inventory[productType][size] = item.stock || 0;
        }
      });
    }
    
    return inventory;
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    toast.error('Inventory fetch failed', {
      description: 'Could not retrieve product inventory'
    });
    
    // Return default inventory in case of error
    return {
      tshirt: { S: 10, M: 15, L: 8, XL: 5 },
      mug: { Standard: 20 },
      cap: { Standard: 12 }
    };
  }
};
