
import React from 'react';
import { Check } from 'lucide-react';

interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ selectedFont, onFontChange }) => {
  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' }
  ];
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Font Family</label>
      <div className="relative">
        <select 
          value={selectedFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
        >
          {fonts.map(font => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Preview: <span style={{ fontFamily: selectedFont }}>The quick brown fox jumps over the lazy dog</span>
      </div>
    </div>
  );
};

export default FontSelector;
