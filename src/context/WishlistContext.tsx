
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
    console.log('Fetching wishlist for user:', currentUser?.id);
    
    if (!currentUser) {
      return [];
    }

    try {
      // Query the wishlist items for the current user
      const { data: wishlistData, error } = await supabase
        .from('wishlists')
        .select('product_id, name, price, image, description')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }
      
      console.log('Wishlist data from DB:', wishlistData);

      // If we have wishlist items, construct Product objects
      if (wishlistData && wishlistData.length > 0) {
        const items: Product[] = wishlistData.map((item: any) => ({
          id: item.product_id,
          code: item.product_id, 
          name: item.name || `Product ${item.product_id.substring(0, 5)}`,
          price: parseFloat(item.price) || 99.99,
          original_price: parseFloat(item.price) || 99.99,
          image: item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500',
          description: item.description || 'A great product for your needs.',
          category: 'General',
          rating: 4.5,
          discount_percentage: 0,
          tags: ['featured'], 
        }));
        
        return items;
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchWishlist:', error);
      return [];
    }
  };
  
  // Use React Query for wishlist data
  const { data: wishlistData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['wishlist', currentUser?.id],
    queryFn: fetchWishlist,
    staleTime: 1000 * 60, // 1 minute - shorter stale time for more frequent refreshes
    enabled: !!currentUser, // Only run if user is logged in
  });
  
  // Update wishlistItems state when query data changes
  useEffect(() => {
    if (wishlistData) {
      console.log('Setting wishlist items from query data:', wishlistData);
      setWishlistItems(wishlistData);
    }
    setIsLoading(isQueryLoading);
  }, [wishlistData, isQueryLoading]);
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    const normalizedId = normalizeProductId(productId);
    const result = wishlistItems.some(item => normalizeProductId(item) === normalizedId);
    return result;
  };
  
  // Save wishlist mutation
  const saveWishlist = useMutation({
    mutationFn: async (action: { type: 'add' | 'remove' | 'clear', product?: Product, productId?: string }) => {
      if (!currentUser) return;
      
      try {
        console.log('Wishlist action:', action);
        
        if (action.type === 'add' && action.product) {
          const productId = normalizeProductId(action.product);
          
          // Add to database with product details
          const { error } = await supabase
            .from('wishlists')
            .insert({
              user_id: currentUser.id,
              product_id: productId,
              name: action.product.name,
              price: action.product.price,
              image: action.product.image || '',
              description: action.product.description || '',
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
      console.error('Error in wishlist mutation:', error);
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
        console.log('Product already in wishlist:', productId);
        setIsLoading(false);
        return; // Product already in wishlist
      }
      
      console.log('Adding to wishlist:', product);
      
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
        original_price: product.original_price || product.price,
        discount_percentage: product.discount_percentage || 0,
        rating: product.rating || 0,
        category: product.category || '',
        tags: Array.isArray(product.tags) ? product.tags : ['featured']
      };
      
      setWishlistItems(prev => [...prev, newItem]);
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
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
      
      console.log('Removing from wishlist:', normalizedId);
      
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
      
      console.log('Clearing entire wishlist');
      
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
