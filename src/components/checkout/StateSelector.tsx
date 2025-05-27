
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Split the states into a separate file for better maintainability
import { indianStates } from './indianStates';

interface StateSelectProps {
  form: any;
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

const StateSelector: React.FC<StateSelectProps> = ({
  form,
  name,
  label,
  required = false,
  disabled = false
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} {required && <span className="text-red-500">*</span>}</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={field.disabled || disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {indianStates.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StateSelector;
