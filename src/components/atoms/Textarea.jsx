import React from 'react';

const Textarea = ({ value, onChange, placeholder, className = '', required = false, rows = 3 }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${className}`}
      required={required}
      rows={rows}
    />
  );
};

export default Textarea;