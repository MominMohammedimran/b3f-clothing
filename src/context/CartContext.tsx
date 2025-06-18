
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sizes: SizeQuantity[];
  color?: string;
  image?: string;
  metadata?: {
    view?: string;
    backImage?: string;
    designData?: any;
    previewImage?: string;
    isMultipleSize?: boolean;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  getCartCount: () => number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  removeSizeFromCart: (id: string, size: string) => Promise<void>;
  updateSizeQuantity: (id: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const fetchCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const transformedItems = data?.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: Number(item.price),
        sizes: item.sizes || [],
        color: item.color || undefined,
        image: item.image || undefined,
        metadata: item.metadata || undefined,
      })) || [];

      setCartItems(transformedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      // Check if item already exists with same product_id and color
      const existingItemIndex = cartItems.findIndex(
        cartItem => 
          cartItem.product_id === item.product_id &&
          cartItem.color === item.color
      );

      if (existingItemIndex >= 0) {
        // Merge sizes with existing item
        const existingItem = cartItems[existingItemIndex];
        const mergedSizes = [...existingItem.sizes];
        
        item.sizes.forEach(newSize => {
          const existingSizeIndex = mergedSizes.findIndex(s => s.size === newSize.size);
          if (existingSizeIndex >= 0) {
            mergedSizes[existingSizeIndex].quantity += newSize.quantity;
          } else {
            mergedSizes.push(newSize);
          }
        });

        const { error } = await supabase
          .from('carts')
          .update({ 
            sizes: mergedSizes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('carts')
          .insert([{
            user_id: currentUser.id,
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            sizes: item.sizes,
            color: item.color,
            image: item.image,
            metadata: item.metadata,
          }])
          .select()
          .single();

        if (error) throw error;
      }

      await fetchCart();
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (id: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const removeSizeFromCart = async (id: string, size: string) => {
    if (!currentUser) return;

    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;

      const newSizes = item.sizes.filter(s => s.size !== size);
      
      if (newSizes.length === 0) {
        // Remove entire item if no sizes left
        await removeFromCart(id);
        return;
      }

      const { error } = await supabase
        .from('carts')
        .update({ 
          sizes: newSizes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, sizes: newSizes } : item
      ));
      toast.success('Size removed from cart');
    } catch (error) {
      console.error('Error removing size from cart:', error);
      toast.error('Failed to remove size');
    }
  };

  const updateSizeQuantity = async (id: string, size: string, quantity: number) => {
    if (!currentUser || quantity < 1) return;

    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;

      const newSizes = item.sizes.map(s => 
        s.size === size ? { ...s, quantity } : s
      );

      const { error } = await supabase
        .from('carts')
        .update({ 
          sizes: newSizes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, sizes: newSizes } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => 
      sum + item.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0), 0
    );
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  const totalPrice = cartItems.reduce((sum, item) => 
    sum + item.sizes.reduce((sizeSum, size) => sizeSum + (item.price * size.quantity), 0), 0
  );
  
  const totalItems = cartItems.reduce((sum, item) => 
    sum + item.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0), 0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      totalPrice,
      totalItems,
      getCartCount,
      addToCart,
      removeFromCart,
      removeSizeFromCart,
      updateSizeQuantity,
      clearCart,
      loading,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
