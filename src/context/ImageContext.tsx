
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageContextType {
  selectedImage: string;
  setSelectedImage: (image: string) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedImage, setSelectedImage] = useState<string>('');

  return (
    <ImageContext.Provider value={{ selectedImage, setSelectedImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};
