import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const MetricCard = ({ title, value, iconName, iconBgColor, delay, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          <ApperIcon name={iconName} size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;