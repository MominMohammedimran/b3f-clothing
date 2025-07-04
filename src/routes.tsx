import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaymentRetry from './pages/PaymentRetry';
import ProductDetails from './pages/ProductDetails';
import ProductsPage from './pages/ProductsPage';
import NotFound from './pages/NotFound';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ProductDetailsPage from './pages/ProductDetailsPage';
import OrderComplete from './pages/OrderComplete';
import OrderHistory from './pages/OrderHistory';
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
import AdminWebsiteUsers from './pages/admin/AdminWebsiteUsers';
import ThankYou from './components/ui/ThankYou'
// Legal pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import ShippingDelivery from './pages/legal/ShippingDelivery';
import CancellationRefund from './pages/legal/CancellationRefund';

import AdminAuthGuard from './components/admin/AdminAuthGuard';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-retry/:orderId" element={<PaymentRetry />} />
 
        <Route path="/product/details/:productId" element={< ProductDetailsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductsPage />} />
        <Route path="/products/:category" element={<ProductsPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/order-complete/:orderId" element={<OrderComplete />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/track-order/:id" element={<TrackOrder />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/design-tool" element={<DesignTool />} />
        <Route path="/design-tool/:productkey" element={<DesignTool />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/wishlist" element={<Wishlist />} />
 <Route path="/thank-you" element={<ThankYou/>} />

        {/* Legal pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/shipping-delivery" element={<ShippingDelivery />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
        <Route path="/admin/dashboard" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
        <Route path="/admin/products" element={<AdminAuthGuard><AdminProducts /></AdminAuthGuard>} />
        <Route path="/admin/orders" element={<AdminAuthGuard><AdminOrders /></AdminAuthGuard>} />
        <Route path="/admin/orders/:orderId" element={<AdminAuthGuard><AdminOrderView /></AdminAuthGuard>} />
        <Route path="/admin/customers" element={<AdminAuthGuard><AdminCustomers /></AdminAuthGuard>} />
        <Route path="/admin/settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />
        <Route path="/admin/users" element={<AdminAuthGuard><AdminUsers /></AdminAuthGuard>} />
        <Route path="/admin/users/:userId/orders" element={<AdminAuthGuard><AdminUserOrderHistory /></AdminAuthGuard>} />
        <Route path="/admin/profiles" element={<AdminAuthGuard><AdminProfiles /></AdminAuthGuard>} />
        <Route path="/admin/website-users" element={<AdminAuthGuard><AdminWebsiteUsers /></AdminAuthGuard>} />
        <Route path="/admin/*" element={<AdminAuthGuard><AdminNotFound /></AdminAuthGuard>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
