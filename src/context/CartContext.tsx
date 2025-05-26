
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  getCartCount: () => number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
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

      const transformedItems = data?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined,
        image: item.image || undefined,
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
      // Check if item already exists with same product_id, size, and color
      const existingItem = cartItems.find(
        cartItem => 
          cartItem.product_id === item.product_id &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        return;
      }

      const { data, error } = await supabase
        .from('carts')
        .insert([{
          user_id: currentUser.id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        }])
        .select()
        .single();

      if (error) throw error;

      const newItem: CartItem = {
        id: data.id,
        product_id: data.product_id,
        name: data.name,
        price: Number(data.price),
        quantity: data.quantity,
        size: data.size || undefined,
        color: data.color || undefined,
        image: data.image || undefined,
      };

      setCartItems(prev => [...prev, newItem]);
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

  const updateQuantity = async (id: string, quantity: number) => {
    if (!currentUser || quantity < 1) return;

    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
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
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      totalPrice,
      totalItems,
      getCartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
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
