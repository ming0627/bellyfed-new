/**
 * FormField Component
 *
 * A versatile form field component that supports various input types, validation,
 * and error handling. It's designed to work with form libraries like react-hook-form
 * but can also be used standalone.
 *
 * Features:
 * - Support for various input types (text, email, password, textarea, select, checkbox, radio)
 * - Built-in error display
 * - Support for required fields
 * - Support for help text
 * - Support for icons
 * - Support for custom validation
 * - Integration with react-hook-form
 */

import React, { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
/**
 * FormField component
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Field ID
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type (text, email, password, textarea, select, checkbox, radio)
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.helpText - Help text to display below the field
 * @param {Object} props.error - Error object from form validation
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left side of the input
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right side of the input
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.readOnly - Whether the field is read-only
 * @param {string} props.className - Additional CSS classes for the field container
 * @param {string} props.inputClassName - Additional CSS classes for the input element
 * @param {string} props.labelClassName - Additional CSS classes for the label element
 * @param {string} props.errorClassName - Additional CSS classes for the error message
 * @param {string} props.helpTextClassName - Additional CSS classes for the help text
 * @param {Object} props.register - Register function from react-hook-form
 * @param {Object} props.validation - Validation rules for react-hook-form
 * @param {Array} props.options - Options for select, checkbox, or radio inputs
 * @param {Function} props.onChange - Function to call when the input value changes
 * @param {Function} props.onBlur - Function to call when the input loses focus
 * @param {Function} props.onFocus - Function to call when the input gains focus
 * @param {any} props.value - Input value (for controlled components)
 * @param {Object} props.inputProps - Additional props to pass to the input element
 * @returns {JSX.Element} - Rendered component
 */
const FormField = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  helpText,
  error,
  leftIcon,
  rightIcon,
  disabled = false,
  readOnly = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  register,
  validation,
  options = [],
  onChange,
  onBlur,
  onFocus,
  value,
  inputProps = {},
  ...props
}, ref) => {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the actual input type for password fields
  const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  // Prepare registration props for react-hook-form
  const registerProps = register ? register(name, validation) : {};

  // Combine onChange handlers
  const handleChange = (e) => {
    if (registerProps.onChange) {
      registerProps.onChange(e);
    }
    if (onChange) {
      onChange(e);
    }
  };

  // Combine onBlur handlers
  const handleBlur = (e) => {
    if (registerProps.onBlur) {
      registerProps.onBlur(e);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  // Combine onFocus handlers
  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  // Base classes for input elements
  const baseInputClasses = `
    w-full px-4 py-2 border rounded-md
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || type === 'password' ? 'pr-10' : ''}
    ${inputClassName}
  `;

  // Render different input types
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id || name}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
            ref={ref}
            rows={inputProps.rows || 4}
            {...registerProps}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={value}
            {...inputProps}
          />
        );

      case 'select':
        return (
          <select
            id={id || name}
            name={name}
            disabled={disabled}
            className={baseInputClasses}
            ref={ref}
            {...registerProps}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={value}
            {...inputProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={id || name}
              name={name}
              type="checkbox"
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
              ref={ref}
              {...registerProps}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              checked={value}
              {...inputProps}
            />
            {label && (
              <label
                htmlFor={id || name}
                className={`ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${id || name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  disabled={disabled}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                  ref={ref}
                  {...registerProps}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  checked={value === option.value}
                  {...inputProps}
                />
                <label
                  htmlFor={`${id || name}-${option.value}`}
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={id || name}
            name={name}
            type={actualType}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
            ref={ref}
            {...registerProps}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={value}
            {...inputProps}
          />
        );
    }
  };

  // Don't render the label twice for checkboxes
  const shouldRenderLabel = type !== 'checkbox' && label;

  return (
    <div className={`mb-4 ${className}`}>
      {shouldRenderLabel && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {typeof leftIcon === 'function' ? (
              <leftIcon className="w-5 h-5 text-gray-400" />
            ) : (
              leftIcon
            )}
          </div>
        )}

        {renderInput()}

        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}

        {rightIcon && type !== 'password' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {typeof rightIcon === 'function' ? (
              <rightIcon className="w-5 h-5 text-gray-400" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>

      {error && (
        <p className={`mt-1 text-sm text-red-600 dark:text-red-400 flex items-center ${errorClassName}`}>
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.message || error}
        </p>
      )}

      {helpText && !error && (
        <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${helpTextClassName}`}>
          {helpText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
