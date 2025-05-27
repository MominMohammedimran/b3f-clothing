
import React from 'react';

interface TextEffectProps {
  effectType: string;
  isSelected: boolean;
  onSelect: (effect: string) => void;
}

const TextEffect: React.FC<TextEffectProps> = ({ effectType, isSelected, onSelect }) => {
  const getEffectPreview = () => {
    switch(effectType) {
      case 'straight':
        return 'Aa';
      case 'arc':
        return '⌒Aa⌒';
      case 'circle':
        return '○Aa○';
      default:
        return 'Aa';
    }
  };
  
  return (
    <button
      onClick={() => onSelect(effectType)}
      className={`w-16 h-16 flex items-center justify-center text-lg border rounded-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 text-blue-600' 
          : 'border-gray-300 hover:bg-gray-50'
      }`}
    >
      {getEffectPreview()}
    </button>
  );
};

interface TextEffectsProps {
  selectedEffect: string;
  onEffectChange: (effect: string) => void;
}

const TextEffects: React.FC<TextEffectsProps> = ({ 
  selectedEffect,
  onEffectChange
}) => {
  const effects = ['straight', 'arc', 'circle'];
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Text Effect</label>
      <div className="flex space-x-3">
        {effects.map(effect => (
          <TextEffect 
            key={effect}
            effectType={effect}
            isSelected={selectedEffect === effect}
            onSelect={onEffectChange}
          />
        ))}
      </div>
    </div>
  );
};

export default TextEffects;
