
import React from 'react';

interface TextStyleControlsProps {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
}

const TextStyleControls: React.FC<TextStyleControlsProps> = ({
  isBold,
  isItalic,
  isUnderline,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Text Style</label>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onToggleBold}
          className={`p-2 border rounded-md ${
            isBold 
              ? 'bg-blue-50 border-blue-300 text-blue-600' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </button>
        
        <button
          type="button"
          onClick={onToggleItalic}
          className={`p-2 border rounded-md ${
            isItalic 
              ? 'bg-blue-50 border-blue-300 text-blue-600' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Italic"
        >
          <span className="italic">I</span>
        </button>
        
        <button
          type="button"
          onClick={onToggleUnderline}
          className={`p-2 border rounded-md ${
            isUnderline 
              ? 'bg-blue-50 border-blue-300 text-blue-600' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Underline"
        >
          <span className="underline">U</span>
        </button>
      </div>
    </div>
  );
};

export default TextStyleControls;
