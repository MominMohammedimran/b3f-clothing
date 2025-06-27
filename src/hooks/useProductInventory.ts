
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/lib/types';

interface ProductVariant {
  size: string;
  stock: number;
}

interface ProductInventory {
  quantities: Record<string, number>;
}

// Create a simple event system for inventory updates
const inventoryUpdateListeners = new Set<() => void>();

const notifyInventoryUpdate = () => {
  inventoryUpdateListeners.forEach(listener => listener());
};

export const addInventoryUpdateListener = (listener: () => void) => {
  inventoryUpdateListeners.add(listener);
  return () => {
    inventoryUpdateListeners.delete(listener);
  };
};

export const updateInventoryFromPaidOrders = async () => {
  try {
    // Query orders with paid payment status that haven't been processed yet
    const { data: paidOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid');

    if (ordersError) throw ordersError;

    if (!paidOrders || paidOrders.length === 0) return;

    console.log(`Processing ${paidOrders.length} paid orders for inventory update`);

    // Process each paid order
    for (const order of paidOrders) {
      // Ensure items exists and is an array
      if (!order.items || !Array.isArray(order.items)) continue;
      
      // Cast through unknown first to satisfy TypeScript
      const items = order.items as unknown as CartItem[];

      // Process each item in the order
      for (const item of items) {
        if (!item.product_id || !item.sizes || !Array.isArray(item.sizes)) continue;

        // Fetch the product
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('variants')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error(`Error fetching product ${item.product_id}:`, productError);
          continue;
        }

        if (!product) continue;

        // Update variants based on item sizes
        const variants = Array.isArray(product.variants) ? [...(product.variants as unknown as ProductVariant[])] : [];
        
        item.sizes.forEach((sizeInfo) => {
          const variantIndex = variants.findIndex(
            (v: any) => v && typeof v === 'object' && v.size?.toLowerCase() === sizeInfo.size.toLowerCase()
          );

          if (variantIndex >= 0) {
            const variant = variants[variantIndex] as any;
            const currentStock = typeof variant.stock === 'number' ? variant.stock : 0;
            variants[variantIndex] = {
              ...variant,
              stock: Math.max(0, currentStock - sizeInfo.quantity)
            };
          }
        });

        // Update the product variants in Supabase
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            variants: variants as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        if (updateError) {
          console.error(`Error updating product ${item.product_id}:`, updateError);
        }
      }

      // Mark order as inventory_updated to avoid double processing
      const { error: markError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'inventory_updated',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (markError) {
        console.error(`Error marking order ${order.id} as inventory_updated:`, markError);
      }
    }

    console.log('Successfully updated inventory from paid orders');
    
    // Notify all listeners that inventory has been updated
    notifyInventoryUpdate();
    
  } catch (error) {
    console.error('Error updating inventory from paid orders:', error);
  }
};

export const useProductInventory = (productId?: string) => {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<ProductInventory | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('variants')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const quantities: Record<string, number> = {};
      
      if (product?.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
          if (variant && typeof variant === 'object' && variant.size && typeof variant.stock === 'number') {
            quantities[variant.size] = variant.stock;
          }
        });
      }

      setInventory({ quantities });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Listen for inventory updates and refetch when they occur
  useEffect(() => {
    const unsubscribe = addInventoryUpdateListener(() => {
      fetchInventory();
    });
    
    return () => {
      unsubscribe();
    };
  }, [fetchInventory]);

  const updateProductStock = useCallback(async (productId: string, size: string, quantityChange: number) => {
    setUpdating(true);
    try {
      // Fetch current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const variants = Array.isArray(product.variants) ? [...product.variants] : [];
      
      const variantIndex = variants.findIndex((v: any) => 
        v && typeof v === 'object' && v.size?.toLowerCase() === size.toLowerCase()
      );
      
      if (variantIndex >= 0) {
        const variant = variants[variantIndex] as any;
        const currentStock = typeof variant.stock === 'number' ? variant.stock : 0;
        variants[variantIndex] = { ...variant, stock: Math.max(0, currentStock + quantityChange) };
      } else {
        variants.push({
          size: size.toLowerCase(),
          stock: Math.max(0, quantityChange)
        });
      }

      // Update the product in database
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          variants: variants as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
         
      if (updateError) throw updateError;

      // Notify inventory update
      notifyInventoryUpdate();

      return variants;
    } catch (error) {
      console.error('Error updating product inventory:', error);
      toast.error('Failed to update product inventory');
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateInventory = useCallback(async (inventoryData: ProductInventory) => {
    if (!productId) return false;
    
    setUpdating(true);
    try {
      // Convert quantities to variants format
      const variants = Object.entries(inventoryData.quantities || {})
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => ({
          size,
          stock: qty
        }));

      const { error } = await supabase
        .from('products')
        .update({
          variants: variants as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local inventory state
      setInventory(inventoryData);
      
      // Notify inventory update
      notifyInventoryUpdate();
      
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [productId]);

  return {
    updateProductStock,
    updating,
    loading,
    error,
    inventory,
    fetchInventory,
    updateInventory
  };
};
