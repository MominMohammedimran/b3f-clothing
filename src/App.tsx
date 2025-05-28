import React, { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import Preloader from './Preloader'; // adjust path if needed
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // Match duration with Preloader animation

    return () => clearTimeout(timeout);
  }, []);

  return (
    <HelmetProvider>
      {loading ? <Preloader /> : <AppRoutes />}
      <Toaster position="top-right" />
    </HelmetProvider>
  );
}

export default App;
