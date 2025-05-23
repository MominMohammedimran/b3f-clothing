
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, PenTool, Home, PackageSearch, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import LocationPopover from '../ui/LocationPopover';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const routerLocation = useRouterLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { clearCart } = useCart();
  
  const { 
    currentLocation, 
    locations, 
    setCurrentLocation, 
  } = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    const handleCartUpdate = (event: CustomEvent) => {
      setCartCount(event.detail.count);
    };
    
    window.addEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    
    const loadCartCount = () => {
      if (currentUser) {
        // Get cart items from Supabase
        supabase
          .from('carts')
          .select('*')
          .eq('user_id', currentUser.id)
          .then(({ data }) => {
            if (data) {
              setCartCount(data.length);
            }
          });
      }
    };
    
    loadCartCount();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    };
  }, [currentUser]);

  const isActive = (path: string) => {
    if (path === '/' && routerLocation.pathname === '/') {
      return true;
    } else if (path !== '/' && routerLocation.pathname !== '/'){
      return routerLocation.pathname.startsWith(path);
    }
    return false;
  };

  const handleLocationSelect = (location: any) => {
    setCurrentLocation(location);
    toast.success(`Location updated to ${location.name}`);
  };

  const handleSignOut = async () => {
    try {
      // Clear cart before sign out
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          console.error('Error clearing cart during sign out:', error);
        }
      }
      
      // Clear client-side cart
      clearCart();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Call context signOut
      if (signOut) {
        await signOut();
      }
      
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 bg-white transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <LocationPopover
              locations={locations}
              currentLocation={currentLocation}
              onSelectLocation={handleLocationSelect}
              triggerClassName="px-2 py-1 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
            />
          </div>
          
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <div className="h-2 sm:h-5 md:h-5 object-contain flex items-center justify-center bg-white-600 text-white px-6 rounded">
              <img style={{height:"42px",marginTop:"2px"}} src="/lovable-uploads/B3F.jpg" alt="Logo" />
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
           
            
            
            
            <Link to="/cart" className="flex items-center space-x-1 text-blue-600 font-medium">
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xl">Cart</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50 md:hidden">
        <div className="flex items-center justify-between">
          <Link to="/" className={`flex flex-col items-center text-xs sm:text-sm ${
            isActive('/') 
              ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
              : 'text-gray-500'
          }`}>
            <Home size={18} className={isActive('/') ? 'text-blue-600' : 'text-gray-500'} />
            <span>Home</span>
          </Link>
          
          <Link to="/design-tool" className={`flex flex-col items-center text-xs sm:text-sm ${
            isActive('/design-tool') 
              ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
              : 'text-gray-500'
          }`}>
            <PenTool size={18} className={isActive('/design-tool') ? 'text-blue-600' : 'text-gray-500'} />
            <span>Design Tool</span>
          </Link>
          
          <Link to="/search" className={`flex flex-col items-center text-xs sm:text-sm ${
            isActive('/search') 
              ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
              : 'text-gray-500'
          }`}>
            <Search size={18} className={isActive('/search') ? 'text-blue-600' : 'text-gray-500'} />
            <span>Search</span>
          </Link>
          
          <Link to="/orders" className={`flex flex-col items-center text-xs sm:text-sm ${
            isActive('/orders') 
              ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
              : 'text-gray-500'
          }`}>
            <div className="relative">
              <PackageSearch size={18} className={isActive('/orders') ? 'text-blue-600' : 'text-gray-500'} />
            </div>
            <span>Orders</span>
          </Link>
          
          {currentUser ? (
            <Link to="/profile" className={`flex flex-col items-center text-xs sm:text-sm ${
              isActive('/profile') 
                ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
                : 'text-gray-500'
            }`}>
              <User size={18} className={isActive('/profile') ? 'text-blue-600' : 'text-gray-500'} />
              <span>Profile</span>
            </Link>
          ) : (
            <Link to="/signin" className={`flex flex-col items-center text-xs sm:text-sm ${
              isActive('/signin') 
                ? 'text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1' 
                : 'text-gray-500'
            }`}>
              <User size={18} className={isActive('/signin') ? 'text-blue-600' : 'text-gray-500'} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
