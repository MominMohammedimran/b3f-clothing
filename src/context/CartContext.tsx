import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Define cart item type
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  selectedSizes?: string[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number, selectedSizes?: string[]) => Promise<void>;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  getCartCount: () => number; // Add this method to the interface
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  getCartCount: () => 0 // Add default implementation
});

export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Load cart from Supabase DB with improved error handling
  const fetchCart = async () => {
    console.log('Fetching cart data for user:', currentUser?.id);
    
    try {
      if (!currentUser) {
        console.log('No user logged in, returning empty cart');
        return [];
      }
      
      // If user is logged in, load from DB
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      } 
      
      console.log('Cart data from DB:', data);
      
      if (data && data.length > 0) {
        // Transform database cart format to our CartItem format
        return data.map((item: any) => {
          // Parse selectedSizes from metadata if available
          let selectedSizes: string[] | undefined;
          try {
            if (item.metadata && typeof item.metadata === 'object' && item.metadata.selectedSizes) {
              selectedSizes = JSON.parse(item.metadata.selectedSizes);
            }
          } catch (e) {
            console.error('Error parsing selectedSizes:', e);
          }
          
          return {
            id: item.id,
            productId: item.product_id,
            name: item.name || 'Product',
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            image: item.image || '',
            size: item.size,
            color: item.color,
            selectedSizes
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Cart loading error:', error);
      return [];
    }
  };

  // Use React Query for cart data with improved error handling
  const { data: cartData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['cart', currentUser?.id],
    queryFn: fetchCart,
    staleTime: 1000 * 60, // 1 minute - shorter stale time for more frequent refreshes
    enabled: !!currentUser,  // Only run if user is logged in
  });

  // Update cartItems state when query data changes
  useEffect(() => {
    if (cartData) {
      console.log('Setting cart items from query data:', cartData);
      setCartItems(cartData);
    }
    setIsLoading(isQueryLoading);
  }, [cartData, isQueryLoading]);

  // Calculate total items and price using useMemo for performance
  const totalItems = useMemo(() => cartItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0), [cartItems]);
  
  const totalPrice = useMemo(() => cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0), [cartItems]);
  
  // Add getCartCount method implementation
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Save cart whenever it changes with improved error handling
  const saveCart = useMutation({
    mutationFn: async (items: CartItem[]) => {
      try {
        // If logged in, save to DB
        if (currentUser) {
          console.log('Saving cart items to DB:', items);
          
          // First, delete existing cart items
          const { error: deleteError } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', currentUser.id);
            
          if (deleteError) {
            console.error('Error deleting existing cart items:', deleteError);
          }
          
          // Then insert new items if there are any
          if (items.length > 0) {
            const dbItems = items.map(item => {
              // Create metadata object for storing additional data
              const metadata: Record<string, any> = {};
              
              // Store selectedSizes in metadata if available
              if (item.selectedSizes && item.selectedSizes.length > 0) {
                metadata.selectedSizes = JSON.stringify(item.selectedSizes);
              }
              
              return {
                user_id: currentUser.id,
                product_id: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                size: item.size || null,
                color: item.color || null,
                metadata: Object.keys(metadata).length > 0 ? metadata : null
              };
            });
            
            const { data, error } = await supabase.from('carts').insert(dbItems);
            if (error) {
              console.error('Error inserting cart items:', error);
              throw error;
            }
            console.log('Cart saved successfully:', data);
          }
          
          // Invalidate the query to refresh cart data
          queryClient.invalidateQueries({ queryKey: ['cart', currentUser.id] });
        }
      } catch (error) {
        console.error('Cart saving error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', currentUser?.id] });
    },
    onError: (error) => {
      console.error('Error in saveCart mutation:', error);
    }
  });

  // Save cart whenever it changes
  useEffect(() => {
    if (currentUser && !isLoading && cartItems.length >= 0) {
      console.log('Cart items changed, saving to DB:', cartItems);
      saveCart.mutate(cartItems);
    }
  }, [cartItems, currentUser]);

  // Add product to cart with improved error handling
  const addToCart = async (product: any, quantity = 1, sizes?: string[]) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to cart');
      navigate('/signin');
      return;
    }
    
    try {
      // Define product ID consistently
      const productId = product.id || product.productId;
      
      if (!productId) {
        console.error('Missing product ID:', product);
        toast.error('Error adding to cart: Invalid product');
        return;
      }
      
      console.log('Adding to cart:', product, 'quantity:', quantity);
      
      // Check if product is already in cart
      const existingItemIndex = cartItems.findIndex(item => 
        item.productId === productId
      );
      
      let updatedItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Product exists, update quantity instead of adding duplicate
        updatedItems = [...cartItems];
        
        if (product.selectedSizes && product.selectedSizes.length > 0) {
          // Update with selected sizes from product
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            selectedSizes: product.selectedSizes,
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
        } else if (sizes && sizes.length > 0) {
          // Update with sizes passed as parameter
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            selectedSizes: sizes,
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Update quantity only
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            size: product.size || updatedItems[existingItemIndex].size
          };
        }
        
        toast.success('Cart updated');
      } else {
        // Product doesn't exist, add new item
        const newItem: CartItem = {
          id: Math.random().toString(36).substring(2, 9),
          productId: productId,
          name: product.name || product.title || 'Product',
          price: parseFloat(product.price) || 0,
          quantity,
          image: product.image || product.images?.[0] || '',
          size: product.size,
          color: product.color,
          selectedSizes: product.selectedSizes || sizes
        };
        
        updatedItems = [...cartItems, newItem];
        toast.success('Added to cart');
      }
      
      console.log('Updated cart items:', updatedItems);
      setCartItems(updatedItems);
      
      // Force immediate save to database
      if (currentUser) {
        try {
          await saveCart.mutateAsync(updatedItems);
        } catch (error) {
          console.error('Error saving cart:', error);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to manage your cart');
      navigate('/signin');
      return;
    }
    
    const filteredItems = cartItems.filter(item => 
      item.productId !== productId
    );
    
    setCartItems(filteredItems);
    toast.success('Removed from cart');
  };

  // Update product quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (!currentUser) {
      toast.error('Please sign in to manage your cart');
      navigate('/signin');
      return;
    }
    
    if (quantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.productId === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    
    setCartItems(updatedItems);
  };

  // Clear cart
  const clearCart = () => {
    if (!currentUser) {
      toast.error('Please sign in to manage your cart');
      navigate('/signin');
      return;
    }
    
    setCartItems([]);
    toast.success('Cart cleared');
    
    // Clear from database
    if (currentUser) {
      supabase.from('carts').delete().eq('user_id', currentUser.id);
      
      // Invalidate the query
      queryClient.invalidateQueries({ queryKey: ['cart', currentUser.id] });
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isLoading,
    getCartCount // Add the method to the context value
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
