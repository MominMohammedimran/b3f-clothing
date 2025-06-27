// src/context/ActiveProductContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveProductContextType {
  activeProduct: string;
  setActiveProduct: (value: string) => void;
}

const ActiveProductContext = createContext<ActiveProductContextType | null>(null);

export const ActiveProductProvider = ({ children }: { children: ReactNode }) => {
  const [activeProduct, setActiveProduct] = useState<string>('tshirt');

  return (
    <ActiveProductContext.Provider value={{ activeProduct, setActiveProduct }}>
      {children}
    </ActiveProductContext.Provider>
  );
};

export const useActiveProduct = () => {
  const context = useContext(ActiveProductContext);
  if (!context) {
    throw new Error('❌ useActiveProduct must be used inside <ActiveProductProvider>');
  }
  return context;
};
