import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ApperIcon name="Search" className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button onClick={() => navigate('/dashboard')} className="px-6 py-3">
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;