
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmojiContextType {
  selectedEmoji: string;
  setSelectedEmoji: (emoji: string) => void;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

export const EmojiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');

  return (
    <EmojiContext.Provider value={{ selectedEmoji, setSelectedEmoji }}>
      {children}
    </EmojiContext.Provider>
  );
};

export const useEmoji = (): EmojiContextType => {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmoji must be used within an EmojiProvider');
  }
  return context;
};
