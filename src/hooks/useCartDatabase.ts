
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/lib/types';

// Define the database cart item type to handle both old and new structures
interface DbCartItem {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  image?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  // Old structure
  size?: string;
  quantity?: number;
  // New structure
  sizes?: any;
  metadata?: any;
}

export const useCartDatabase = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!currentUser) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      // First try with new structure, fallback to old structure if needed
      let data: any[] = [];
      let error: any = null;

      try {
        const result = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', currentUser.id);
        
        data = result.data || [];
        error = result.error;
      } catch (queryError) {
        // If query fails, try with old structure
        const oldResult = await supabase
          .from('carts')
          .select('id, user_id, product_id, name, price, image, color, size, quantity, created_at, updated_at')
          .eq('user_id', currentUser.id);
        
        data = oldResult.data || [];
        error = oldResult.error;
      }

      if (error) throw error;
      
      // Transform database records to CartItem format
      const transformedItems: CartItem[] = data?.map((item: DbCartItem) => ({
        id: item.id,
        product_id: item.product_id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        sizes: item.sizes || [{ size: item.size || 'M', quantity: item.quantity || 1 }],
        image: item.image || '',
        color: item.color || undefined,
        metadata: item.metadata || undefined,
      })) || [];
      
      setCartItems(transformedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (item: CartItem) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      // Check if the new structure exists by trying to query it
      let useNewStructure = true;
      let existingItems: any = null;

      try {
        const result = await supabase
          .from('carts')
          .select('id, sizes, size, quantity')
          .eq('user_id', currentUser.id)
          .eq('product_id', item.product_id || item.productId)
          .maybeSingle();
        
        existingItems = result.data;
        if (result.error && result.error.message?.includes('column') && result.error.message?.includes('does not exist')) {
          useNewStructure = false;
        }
      } catch (queryError) {
        useNewStructure = false;
      }

      // Transform CartItem to database format
      const dbItem = {
        product_id: item.product_id || item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        user_id: currentUser.id,
        ...(useNewStructure ? {
          sizes: item.sizes,
          metadata: item.metadata,
        } : {
          size: item.sizes[0]?.size || 'M',
          quantity: item.sizes.reduce((sum, s) => sum + s.quantity, 0),
        })
      };

      let error;

      if (existingItems && useNewStructure) {
        // Handle both old and new structure when merging
        const existingSizes = existingItems.sizes || 
          (existingItems.size ? [{ size: existingItems.size, quantity: existingItems.quantity || 1 }] : []);
        const mergedSizes = [...existingSizes];
        
        item.sizes.forEach(newSize => {
          const existingIndex = mergedSizes.findIndex(s => s.size === newSize.size);
          if (existingIndex >= 0) {
            mergedSizes[existingIndex].quantity += newSize.quantity;
          } else {
            mergedSizes.push(newSize);
          }
        });

        const { error: updateError } = await supabase
          .from('carts')
          .update({ 
            sizes: mergedSizes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems.id);
        
        error = updateError;
      } else if (existingItems && !useNewStructure) {
        // Update with old structure
        const newQuantity = (existingItems.quantity || 0) + item.sizes.reduce((sum, s) => sum + s.quantity, 0);
        const { error: updateError } = await supabase
          .from('carts')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems.id);
        
        error = updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('carts')
          .insert([dbItem]);
        
        error = insertError;
      }

      if (error) throw error;
      await fetchCartItems();
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchCartItems();
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Update cart item size quantity
  const updateSizeQuantity = async (productId: string, size: string, quantity: number) => {
    if (!currentUser || quantity < 1) return;

    try {
      // Get current item
      const item = cartItems.find(item => item.id === productId);
      if (!item) return;

      // Check if new structure is available
      let useNewStructure = true;
      try {
        await supabase.from('carts').select('sizes').limit(1).single();
      } catch {
        useNewStructure = false;
      }

      if (useNewStructure) {
        // Update the sizes array
        const newSizes = item.sizes.map(s => 
          s.size === size ? { ...s, quantity } : s
        );

        const { error } = await supabase
          .from('carts')
          .update({ 
            sizes: newSizes,
            updated_at: new Date().toISOString() 
          })
          .eq('id', productId)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        // Update with old structure
        const { error } = await supabase
          .from('carts')
          .update({ 
            quantity,
            updated_at: new Date().toISOString() 
          })
          .eq('id', productId)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [currentUser]);

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    updateSizeQuantity,
    fetchCartItems
  };
};
