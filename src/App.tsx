
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </HelmetProvider>
  );
}

export default App;
