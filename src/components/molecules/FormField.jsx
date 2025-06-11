import React from 'react';

const FormField = ({ label, children, htmlFor, className = '' }) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export default FormField;