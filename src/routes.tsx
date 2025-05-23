
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import NotFound from './pages/NotFound';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import OrderComplete from './pages/OrderComplete';
import Orders from './pages/Orders';
import UserProfile from './pages/UserProfile';
import TrackOrder from './pages/TrackOrder';
import ResetPassword from './pages/ResetPassword';
import DesignTool from './pages/DesignTool';
import AuthCallback from './pages/AuthCallback';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account'
// Admin routes
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminOrderView from './pages/admin/AdminOrderView';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserOrderHistory from './pages/admin/AdminUserOrderHistory';
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminNotFound from './pages/admin/AdminNotFound';

// Legal pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import ShippingDelivery from './pages/legal/ShippingDelivery';
import CancellationRefund from './pages/legal/CancellationRefund';

import AdminAuthGuard from './components/admin/AdminAuthGuard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/cart" element={<Cart />} />
       <Route path="/search" element={<Search />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
       <Route path="/product/details/:productId" element={<ProductDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:category" element={<Products />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/order-complete" element={<OrderComplete />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<UserProfile />} />
       <Route path="/account" element={<Account />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/track-order/:orderId" element={<TrackOrder />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/design-tool" element={<DesignTool />} />
      <Route path="/design-tool/:productkey" element={<DesignTool />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/wishlist" element={<Wishlist />} />

      {/* Legal pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/shipping-delivery" element={<ShippingDelivery />} />
      <Route path="/cancellation-refund" element={<CancellationRefund />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
      <Route path="/admin/products" element={<AdminAuthGuard><AdminProducts /></AdminAuthGuard>} />
      <Route path="/admin/orders" element={<AdminAuthGuard><AdminOrders /></AdminAuthGuard>} />
      <Route path="/admin/orders/:orderId" element={<AdminAuthGuard><AdminOrderView /></AdminAuthGuard>} />
      <Route path="/admin/customers" element={<AdminAuthGuard><AdminCustomers /></AdminAuthGuard>} />
      <Route path="/admin/settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />
      <Route path="/admin/users" element={<AdminAuthGuard><AdminUsers /></AdminAuthGuard>} />
      <Route path="/admin/users/:userId/orders" element={<AdminAuthGuard><AdminUserOrderHistory /></AdminAuthGuard>} />
      <Route path="/admin/profiles" element={<AdminAuthGuard><AdminProfiles /></AdminAuthGuard>} />
      <Route path="/admin/*" element={<AdminAuthGuard><AdminNotFound /></AdminAuthGuard>} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
