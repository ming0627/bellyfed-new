import { AlertCircle } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormFieldProps<T extends string> {
  id: T;
  label: string;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: string;
  onChange: (field: T, value: string) => void;
  onBlur: (field: T) => void;
  error?: string;
  touched?: boolean;
}

export const FormField = <T extends string>({
  id,
  label,
  type = 'text',
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  error,
  touched,
}: FormFieldProps<T>) => {
  const showError = touched && error;

  const inputProps = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(id, e.target.value),
    onBlur: () => onBlur(id),
    placeholder,
    className: showError ? 'border-red-500' : '',
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {type === 'select' ? (
          <Select
            value={value}
            onValueChange={(value: string) => onChange(id, value)}
            onOpenChange={() => onBlur(id)}
          >
            <SelectTrigger className={showError ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'radio' ? (
          <div className="flex space-x-4">
            {options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(id, e.target.value)
                  }
                  onBlur={() => onBlur(id)}
                  className="form-radio"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <Input type={type} {...inputProps} />
        )}
        {showError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {showError && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
