
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input as ShadcnInput } from './input';

interface InputProps {
  name: string;
  label: string;
  control: any;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
}

const Input: React.FC<InputProps> = ({
  name, 
  label, 
  control, 
  placeholder, 
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  min,
  max
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}{required && <span className="text-red-500 ml-1">*</span>}</FormLabel>
          <FormControl>
            <ShadcnInput
              placeholder={placeholder}
              type={type}
              disabled={disabled}
              autoComplete={autoComplete}
              min={min}
              max={max}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default Input;
