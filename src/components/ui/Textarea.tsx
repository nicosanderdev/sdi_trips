import React from 'react';
import type { TextareaProps } from '../../types';

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const textareaClasses = `w-full px-4 py-3 rounded-xl border-2 bg-white font-medium text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-200 resize-none ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-gold'
  } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-charcoal">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
      />
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Textarea;