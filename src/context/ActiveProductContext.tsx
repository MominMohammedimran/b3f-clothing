// ActiveProductContext.tsx
import { createContext, useContext, useState } from 'react';

const ActiveProductContext = createContext(null);

export const ActiveProductProvider = ({ children }) => {
  const [activeProduct, setActiveProduct] = useState(null);
  return (
    <ActiveProductContext.Provider value={{ activeProduct, setActiveProduct }}>
      {children}
    </ActiveProductContext.Provider>
  );
};

export const useActiveProduct = () => useContext(ActiveProductContext);
