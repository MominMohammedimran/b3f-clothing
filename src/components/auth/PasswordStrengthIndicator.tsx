
import React from 'react';
import { checkPasswordStrength } from '@/utils/securityUtils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { strength, message } = checkPasswordStrength(password);

  const getColorClass = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getWidthClass = () => {
    switch (strength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="mt-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColorClass()} ${getWidthClass()}`}></div>
      </div>
      <p className={`text-xs mt-1 ${
        strength === 'weak' ? 'text-red-600' : 
        strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {message}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
