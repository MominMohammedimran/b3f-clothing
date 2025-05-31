
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import DesignTool from './pages/DesignTool';
import ProductDesigner from './pages/ProductDesigner';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPublicUsers from './pages/admin/AdminPublicUsers';
import AdminLocations from './pages/admin/AdminLocations';
import ProductInventory from './components/admin/product/ProductInventory';
import { initializeDatabase } from './utils/initializeDatabase';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';

function App() {
  useEffect(() => {
    // Initialize database on app load
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productCode" element={<ProductDetails />} />
      <Route path="/design/:productCode?" element={<DesignTool />} />
      <Route path="/product-designer" element={<ProductDesigner />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/track-order/:id" element={<TrackOrder />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/wishlist" element={<Wishlist />} />
     <Route path="/design-tool" element={<DesignTool />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/product-inventory" element={<ProductInventory />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/public-users" element={<AdminPublicUsers />} />
      <Route path="/admin/users/:userId/orders" element={<TrackOrder />} />
      <Route path="/admin/locations" element={<AdminLocations />} />
    </Routes>
  );
}

export default App;
