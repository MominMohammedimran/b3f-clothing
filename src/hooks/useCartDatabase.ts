
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/lib/types';

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
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // Transform database records to CartItem format
      const transformedItems: CartItem[] = data?.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        color: item.color || undefined,
        size: item.size || undefined,
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
      // First check if item already exists in cart
      const { data: existingItems } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', currentUser.id)
        .eq('product_id', item.productId)
        .maybeSingle();

      // Transform CartItem to database format
      const dbItem = {
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size,
        user_id: currentUser.id
      };

      let error;

      if (existingItems) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('carts')
          .update({ 
            quantity: existingItems.quantity + item.quantity,
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

  // Update cart item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!currentUser || quantity < 1) return;

    try {
      const { error } = await supabase
        .from('carts')
        .update({ 
          quantity,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', currentUser.id)
        .eq('product_id', productId);

      if (error) throw error;
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
    updateQuantity,
    fetchCartItems
  };
};
