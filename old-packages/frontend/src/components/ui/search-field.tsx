import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchField;
