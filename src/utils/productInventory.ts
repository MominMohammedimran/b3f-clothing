import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toastWrapper';

/**
 * Update product inventory in the database
 * @param productType The product type (tshirt, mug, cap)
 * @param size The product size
 * @param quantity The new quantity to set
 * @returns Promise resolving to boolean indicating success
 */
export const updateProductInventory = async (
  productType: string, 
  size: string,
  quantity: number
): Promise<boolean> => {
  try {
    console.log(`Updating inventory for ${productType}_${size} to ${quantity}`);
    
    // Check if the inventory item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('category', 'inventory')
      .eq('name', `${productType}_${size}`)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking inventory:', checkError);
      throw checkError;
    }
    
    if (existingItem) {
      // Update existing inventory item
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);
      
      if (error) {
        console.error('Error updating inventory:', error);
        throw error;
      }
    } else {
      // Create new inventory item with required fields based on schema
      const { error } = await supabase
        .from('products')
        .insert({
          name: `${productType}_${size}`,
          category: 'inventory',
          stock: quantity,
          price: 0, // Required field
          original_price: 0, // Required field according to schema
          code: `INV-${productType}-${size}`, // Required field according to schema
        });
      
      if (error) {
        console.error('Error creating inventory item:', error);
        throw error;
      }
    }
    
    console.log(`Successfully updated inventory for ${productType}_${size}`);
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
    // Since we don't have a product_inventory table yet,
    // we'll use the products table with category='inventory'
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'inventory');
    
    if (error) throw error;
    
    // Format the inventory data
    const inventory: Record<string, Record<string, number>> = {
      tshirt: { S: 0, M: 0, L: 0, XL: 0 },
      mug: { Standard: 0 },
      cap: { Standard: 0 }
    };
    
    if (data) {
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

/**
 * Update a product in the database
 * @param productId The product ID to update
 * @param productData The updated product data
 * @returns Promise resolving to boolean indicating success
 */
export const updateProduct = async (
  productId: string,
  productData: any
): Promise<boolean> => {
  try {
    console.log('Updating product:', productId, productData);
    
    // Make sure we have a timestamp
    const dataWithTimestamp = {
      ...productData,
      updated_at: new Date().toISOString()
    };
    
    // Update the product with proper error handling
    const { error } = await supabase
      .from('products')
      .update(dataWithTimestamp)
      .eq('id', productId);
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    toast.success('Product updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
    return false;
  }
};
