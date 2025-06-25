// src/context/ActiveProductContext.tsx
import React, { createContext, useContext, useState } from 'react';

const ActiveProductContext = createContext<{
  activeProduct: string;
  setActiveProduct: (value: string) => void;
}>({
  activeProduct: 'tshirt',
  setActiveProduct: () => {},
});

export const ActiveProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProduct, setActiveProduct] = useState('tshirt');
  return (
    <ActiveProductContext.Provider value={{ activeProduct, setActiveProduct }}>
      {children}
    </ActiveProductContext.Provider>
  );
};

export const useActiveProduct = () => useContext(ActiveProductContext);
