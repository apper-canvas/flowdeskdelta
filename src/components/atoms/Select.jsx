import React from 'react';

const Select = ({ value, onChange, options, className = '', required = false, defaultValue }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}
      required={required}
      defaultValue={defaultValue}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;