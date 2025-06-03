
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WishlistContextType {
  wishlistItems: Product[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: true,
  isInWishlist: () => false,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  clearWishlist: async () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Helper function to normalize product ID
  const normalizeProductId = (product: Product | string): string => {
    if (typeof product === 'string') {
      return product;
    }
    
    return product.id || '';
  };
  
  // Function to fetch wishlist data from Supabase
  const fetchWishlist = async (): Promise<Product[]> => {
    if (!currentUser) {
      return [];
    }

    try {
      // Query the wishlist items for the current user
      const { data: wishlistData, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', currentUser.id);

      if (error) {
        throw error;
      }
      
      // If we have wishlist items, create basic Product objects
      if (wishlistData && wishlistData.length > 0) {
        const items: Product[] = wishlistData.map((item: any) => ({
          id: item.product_id,
          code: item.product_id, 
          name: `Product ${item.product_id.substring(0, 5)}`,
          price: 99.99,
          originalPrice: 99.99,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500',
          description: 'A great product for your needs.',
          category: 'General',
          rating: 4.5,
          discountPercentage: 0,
          tags: ['featured'],
          stock: 10
        }));
        
        return items;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  };
  
  // Use React Query for wishlist data
  const { data: wishlistData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['wishlist', currentUser?.id],
    queryFn: fetchWishlist,
    staleTime: 1000 * 60, // 1 minute
    enabled: !!currentUser, // Only run if user is logged in
  });
  
  // Update wishlistItems state when query data changes
  useEffect(() => {
    if (wishlistData) {
      setWishlistItems(wishlistData);
    }
    setIsLoading(isQueryLoading);
  }, [wishlistData, isQueryLoading]);
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    const normalizedId = normalizeProductId(productId);
    return wishlistItems.some(item => normalizeProductId(item) === normalizedId);
  };
  
  // Save wishlist mutation
  const saveWishlist = useMutation({
    mutationFn: async (action: { type: 'add' | 'remove' | 'clear', product?: Product, productId?: string }) => {
      if (!currentUser) return;
      
      try {
        if (action.type === 'add' && action.product) {
          const productId = normalizeProductId(action.product);
          
          // Add to database
          const { error } = await supabase
            .from('wishlists')
            .insert({
              user_id: currentUser.id,
              product_id: productId,
            });
          
          if (error) throw error;
        } 
        else if (action.type === 'remove' && action.productId) {
          // Remove from database
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('product_id', action.productId);
          
          if (error) throw error;
        }
        else if (action.type === 'clear') {
          // Delete all wishlist items for the user
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', currentUser.id);
          
          if (error) throw error;
        }
        
        // Refresh wishlist data
        queryClient.invalidateQueries({ queryKey: ['wishlist', currentUser.id] });
      } catch (error) {
        console.error('Wishlist save error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', currentUser?.id] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });
  
  // Add a product to the wishlist
  const addToWishlist = async (product: Product): Promise<void> => {
    if (!currentUser) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }
    
    try {
      setIsLoading(true);
      const productId = normalizeProductId(product);
      
      if (!productId) {
        throw new Error("Product ID is undefined");
      }
      
      if (isInWishlist(productId)) {
        setIsLoading(false);
        return; // Product already in wishlist
      }
      
      // Add to Supabase
      await saveWishlist.mutateAsync({ type: 'add', product });
      
      // Update local state immediately for better UX
      const newItem: Product = {
        id: productId,
        code: product.code || productId,
        name: product.name,
        price: product.price,
        image: product.image || '',
        description: product.description || '',
        originalPrice: product.originalPrice || product.price,
        discountPercentage: product.discountPercentage || 0,
        rating: product.rating || 0,
        category: product.category || '',
        tags: Array.isArray(product.tags) ? product.tags : ['featured'],
        stock: product.stock || 10
      };
      
      setWishlistItems(prev => [...prev, newItem]);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add item to wishlist');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a product from the wishlist
  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!currentUser) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }
    
    try {
      setIsLoading(true);
      const normalizedId = normalizeProductId(productId);
      
      // Remove from Supabase
      await saveWishlist.mutateAsync({ type: 'remove', productId: normalizedId });
      
      // Update local state to immediately reflect change
      setWishlistItems(prev => 
        prev.filter(item => normalizeProductId(item) !== normalizedId)
      );
      
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear the entire wishlist
  const clearWishlist = async (): Promise<void> => {
    if (!currentUser) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Clear in Supabase
      await saveWishlist.mutateAsync({ type: 'clear' });
      
      // Update local state
      setWishlistItems([]);
      
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <WishlistContext.Provider 
      value={{
        wishlistItems,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
