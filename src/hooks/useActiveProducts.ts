import { useEffect, useState } from 'react';

export function useActiveProduct(defaultValue: string = 'tshirt') {
  const [activeProduct, setActiveProduct] = useState<string>(() => {
    const stored = localStorage.getItem('activeProduct');
    if (!stored) {
      localStorage.setItem('activeProduct', defaultValue);
      return defaultValue;
    }
    return stored;
  });

  useEffect(() => {
    // Ensure it's always saved if changed
    if (activeProduct) {
      localStorage.setItem('activeProduct', activeProduct);
    }
  }, [activeProduct]);

  return { activeProduct, setActiveProduct };
}
