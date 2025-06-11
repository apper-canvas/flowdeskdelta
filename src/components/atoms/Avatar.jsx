import React from 'react';

const Avatar = ({ initials, className = '' }) => {
  return (
    <div className={`w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;