
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TextContextType {
  text: string;
  setText: (text: string) => void;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [text, setText] = useState<string>('');

  return (
    <TextContext.Provider value={{ text, setText }}>
      {children}
    </TextContext.Provider>
  );
};

export const useText = (): TextContextType => {
  const context = useContext(TextContext);
  if (context === undefined) {
    throw new Error('useText must be used within a TextProvider');
  }
  return context;
};
