import React from 'react';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
}

export function SelectField({ id, label, value, onChange, options, required }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <SelectRoot
        value={String(value)}
        onValueChange={onChange}
        required={required}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[220px]">
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  );
}

export { SelectField as Select };