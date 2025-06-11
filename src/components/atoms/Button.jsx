import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', type = 'button', disabled = false, whileHover, whileTap }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 ${className}`}
      disabled={disabled}
      whileHover={whileHover || { scale: 1.05 }}
      whileTap={whileTap || { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;