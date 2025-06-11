import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className = '', required = false, min, max, step }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}
      required={required}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default Input;