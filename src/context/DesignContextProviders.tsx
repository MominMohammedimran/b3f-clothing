
import React, { ReactNode } from 'react';
import { ColorProvider } from './ColorContext';
import { FontProvider } from './FontContext';
import { ImageProvider } from './ImageContext';
import { TextProvider } from './TextContext';
import { EmojiProvider } from './EmojiContext';

interface DesignContextProvidersProps {
  children: ReactNode;
}

const DesignContextProviders: React.FC<DesignContextProvidersProps> = ({ children }) => {
  return (
    <ColorProvider>
      <FontProvider>
        <ImageProvider>
          <TextProvider>
            <EmojiProvider>
              {children}
            </EmojiProvider>
          </TextProvider>
        </ImageProvider>
      </FontProvider>
    </ColorProvider>
  );
};

export default DesignContextProviders;
