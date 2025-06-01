// src/App.tsx
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Preloader from './Preloader';
import AppRoutes from './routes';
import { initializeSecurity } from './utils/securityUtils';

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize security headers and HTTPS enforcement
    initializeSecurity();

    // Simulate an async operation (e.g., fetching user session)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Adjust the duration as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <AppRoutes />
              <Toaster position="top-right" />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
