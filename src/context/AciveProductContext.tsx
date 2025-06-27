import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveProductContextProps {
  activeProduct: string;
  setActiveProduct: (value: string) => void;
}

const ActiveProductContext = createContext<ActiveProductContextProps | undefined>(undefined);

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
    throw new Error('useActiveProduct must be used within ActiveProductProvider');
  }
  return context;
};
